import {fetchFullJson, fetchJson, fetchVoid, fetchUpload} from 'utils/modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;
import {baseUrl} from 'modelUrls';

const studyPrototype = {
    loaded: false,
    isUploading: false,
    apiURL(path = ''){
        return `${baseUrl}/files/${encodeURIComponent(this.id)}${path}`;
    },

    get(){

        return fetchJson(this.apiURL())
            .then(study => {

                const files = this.parseFiles(study.files);

                this.loaded = true;
                this.isReadonly = study.is_readonly;
                this.istemplate = study.is_template;
                this.is_locked = study.is_locked;
                this.is_published = study.is_published;
                this.is_public = study.is_public;
                this.name = study.study_name;
                this.type = study.type || 'minno02';
                this.base_url = study.base_url;
                this.versions = study.versions ? study.versions : [];
                this.files(files);
                this.sort();
            })
            .catch(reason => {
                this.error = true;
                return Promise.reject(reason); // do not swallow error
            });


    },

    parseFiles(files){
        const study = this;

        return ensureArray(files)
            .map(fileFactory)
            .map(spreadFile)
            .reduce(flattenDeep, [])
            .map(assignStudyId);

        function ensureArray(arr){ return arr || []; }
        function assignStudyId(file){ return Object.assign(file, {studyId: study.id}); }
        function flattenDeep(acc, val) { return Array.isArray(val) ? acc.concat(val.reduce(flattenDeep,[])) : acc.concat(val); }

        // create an array including file and all its children
        function spreadFile(file){ 
            const children = ensureArray(file.files).map(spreadFile);
            return [file].concat(children);
        }
    },

    mergeFiles(files){
        const newfiles = this.parseFiles(files);
        const oldfiles = this.files();

        const toRemove = oldfiles.filter(oldfile => !newfiles.some(newfile => oldfile.id == newfile.id));
        const toAdd = newfiles.filter(newfile => !oldfiles.some(oldfile => oldfile.id == newfile.id));

        toAdd.forEach(this.addFile.bind(this));
        toRemove.forEach(this.removeFile.bind(this));

        this.sort();
    },

    getFile(id){
        return this.files().find(f => f.id === id);
    },

    // makes sure not to return both a folder and its contents.
    // This is important mainly for server side clarity (don't delete or download both a folder and its content)
    // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
    getChosenFiles(){
        const vm = this.vm;
        const rootFiles = this.files().filter(f => f.basePath === '/');
        return getChosen(rootFiles);

        function getChosen(files){
            return files.reduce((response, file) => {
                // a chosen file/dir does not need sub files to be checked
                if (vm(file.id).isChosen() === 1) response.push(file);
                // if not chosen, we need to look deeper
                else response = response.concat(getChosen(file.files || []));
                return response;
            }, []);
        }
    },

    addFile(file){
        this.files().push(file);

        const parent = this.getParent(file);
        if (parent) {
            parent.files || (parent.files = []);
            parent.files.push(file);
        }
    },

    removeFile(file){
        const parent = this.getParent(file);

        remove(this.files(), file);
        if (parent && parent.files) remove(parent.files, file);

        function remove(arr, file){
            const index = arr.indexOf(file);
            arr.splice(index, 1);
        }
    },

    createFile({name, content='',isDir}){
        // validation (make sure there are no invalid characters)
        if(/[^/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: `The file name "${name}" is not valid`});

        // validation (make sure file does not already exist)
        const exists = this.files().some(file => file.path === name);
        if (exists) return Promise.reject({message: `The file "${name}" already exists`});

        // validateion (make sure direcotry exists)
        const basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
        const dirExists = basePath === '' || this.files().some(file => file.isDir && file.path === basePath);
        if (!dirExists) return Promise.reject({message: `The directory "${basePath}" does not exist`});
        return fetchJson(this.apiURL('/file'), {method:'post', body: {name, content, isDir}})
            .then(response => {
                Object.assign(response, {studyId: this.id, content, path:name, isDir});
                const file = fileFactory(response);
                file.loaded = true;
                this.addFile(file);
                return response;
            })
            .then(this.sort.bind(this));
    },

    sort(response){
        let files = this.files().sort(sort);
        this.files(files);
        return response;

        function sort(a,b){
            // sort by isDir then name
            let nameA= +!a.isDir + a.name.toLowerCase(), nameB=+!b.isDir + b.name.toLowerCase();
            if (nameA < nameB) return -1;//sort string ascending
            if (nameA > nameB) return 1;
            return 0; //default return value (no sorting)
        }
    },

    move(newpath, file){
        const study = this;
        const files = study.files();

        const basePath = (newpath.substring(0, newpath.lastIndexOf('/')));
        const folderExists = basePath === '' || files.some(f => f.isDir && f.path === basePath);
        const fileExists = files.some(f=>f.path === newpath);
        const hasChangedChildren = study
            .getChildren(file)
            .some(file => file.hasChanged());


        if (!folderExists) return Promise.reject({message: `Target folder ${basePath} does not exist.`});
        if (fileExists) return Promise.reject({message: `Target file ${newpath} already exists.`});
        if (hasChangedChildren) return Promise.reject({message: `You have unsaved changes in one of the files please save, then try again.`});

        return fetchJson(file.apiUrl() + `/move/` , {
            method:'put',
            body: {path:newpath, url:file.url}
        })
            .then(study.mergeFiles.bind(study));
    },

    uploadFiles({path, fd, force}){
        fd.append('forceUpload', +force);
        this.isUploading = true;
        m.redraw();

        return fetchUpload(this.apiURL(`/upload/${path === '/' ? '' : encodeURIComponent(path)}`), {method:'post', body:fd})
            .then(this.mergeFiles.bind(this))
            .then(() => this.isUploading = false)
            .catch((err) => {
                this.isUploading = false;
                return Promise.reject(err);
            });
    },

    /*
     * @param files [Array] a list of file.path to download
     * @returns url [String] the download url
     */
    downloadFiles(files){
        return fetchJson(this.apiURL(), {method: 'post', body: {files}})
            .then(response => `${baseUrl}/download?path=${response.zip_file}&study=_PATH`);
    },

    delFiles(files){
        const paths = files.map(f=>f.path);
        return fetchJson(this.apiURL(), {method: 'delete', body: {files:paths}})
            .then(this.mergeFiles.bind(this));
    },

    make_experiment(file, descriptive_id){
        return fetchJson(this.apiURL(`/file/${file.id}/experiment`),
            {method: 'post', body: {descriptive_id:descriptive_id}}).then((exp_data)=>file.exp_data=exp_data);
    },

    delete_experiment(file){
        return fetchVoid(this.apiURL(`/file/${file.id}/experiment`),
            {method: 'delete'});
    },

    update_experiment(file, descriptive_id){
        return fetchVoid(this.apiURL(`/file/${file.id}/experiment`),
            {method: 'put', body: {descriptive_id:descriptive_id}});
    },

    getParents(file){
        return this.files().filter(f => f.isDir && file.basePath.indexOf(f.path) === 0);
    },

    getParent(file){
        return this
            .getParents(file)
            .reduce((result, f) => result && (result.path.length > f.path.length) ? result : f , null); 
    },

    // returns array of children for this file, including itself
    getChildren(file){
        return children(file);
       
        function children(file){
            if (!file.files) return [file];
            return file.files
                .map(children) // harvest children
                .reduce((result, files) => result.concat(files), [file]); // flatten
        }
    }
};

const studyFactory =  id =>{
    const study = Object.create(studyPrototype);

    Object.assign(study, {
        id      : id,
        files   : m.prop([]),
        loaded  : false,
        error   :false,
        vm      : viewModelMap({
            isOpen: m.prop(false),
            isChanged: m.prop(false),
            isChosen: m.prop(0)
        })
    });

    return study;
};

// http://lhorie.github.io/mithril-blog/mapping-view-models.html
const viewModelMap = function(signature) {
    const map = {};
    return function(key) {
        if (!map[key]) {
            map[key] = {};
            for (let prop in signature) map[key][prop] = m.prop(signature[prop]());
        }
        return map[key];
    };
};
