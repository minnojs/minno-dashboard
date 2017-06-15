import {fetchFullJson, fetchJson, fetchVoid, fetchUpload} from 'utils/modelHelpers';
import fileFactory from './fileModel';
export default studyFactory;
import {baseUrl} from 'modelUrls';

let studyPrototype = {
    apiURL(path = ''){
        return `${baseUrl}/view_files/${encodeURIComponent(this.code)}${path}`;
    },

    get(){
        return fetchFullJson(this.apiURL())
            .then(study => {
                this.loaded = true;
                console.log(study);
                this.id = study.id;
                this.isReadonly = study.is_readonly;
                this.istemplate = study.is_template;
                this.is_locked = study.is_locked;
                this.name = study.study_name;
                this.baseUrl = study.base_url;
                let files = flattenFiles(study.files)
                    .map(assignStudyId(this.id))
                    .map(assignViewStudy())
                    .map(fileFactory);

                this.files(files);
                this.sort();
            })
            .catch(reason => {
                this.error = true;
                throw(reason);
                // if(reason.status==404)
                //
                // console.log(reason.status);
                //
                // return Promise.reject(reason); // do not swallow error
            });

        function flattenFiles(files){
            if (!files) return [];
            return files
                    .map(spreadFile)
                    .reduce((result, fileArr) => result.concat(fileArr),[]);
        }

        function assignStudyId(id){
            return f => Object.assign(f, {studyId: id});
        }

        function assignViewStudy(){
            return f => Object.assign(f, {viewStudy: true});
        }

        // create an array including file and all its children
        function spreadFile(file){
            return [file].concat(flattenFiles(file.files));
        }
    },

    getFile(id){
        return this.files().find(f => f.id === id);
    },

    // makes sure not to return both a folder and its contents.
    // This is important mainly for server side clarity (don't delete or download both a folder and its content)
    // We go recurse through all the files, starting with those sitting in root (we don't have a root node, so we need to get them manually).
    getChosenFiles(){
        let vm = this.vm;
        let rootFiles = this.files().filter(f => f.basePath === '/');
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
        // update the parent folder
        let parent = this.getParents(file).reduce((result, f) => result && (result.path.length > f.path.length) ? result : f , null); 
        if (parent) {
            parent.files || (parent.files = []);
            parent.files.push(file);
        }
    },

    createFile({name, content='',isDir}){
        // validation (make sure there are no invalid characters)
        if(/[^\/-_.A-Za-z0-9]/.test(name)) return Promise.reject({message: `The file name "${name}" is not valid`});

        // validation (make sure file does not already exist)
        let exists = this.files().some(file => file.path === name);
        if (exists) return Promise.reject({message: `The file "${name}" already exists`});

        // validateion (make sure direcotry exists)
        let basePath = (name.substring(0, name.lastIndexOf('/'))).replace(/^\//, '');
        let dirExists = basePath === '' || this.files().some(file => file.isDir && file.path === basePath);
        if (!dirExists) return Promise.reject({message: `The directory "${basePath}" does not exist`});
        return fetchJson(this.apiURL('/file'), {method:'post', body: {name, content, isDir}})
            .then(response => {
                Object.assign(response, {studyId: this.id, content, path:name, isDir});
                let file = fileFactory(response);
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


    /*
     * @param files [Array] a list of file.path to download
     * @returns url [String] the download url
     */
    downloadFiles(files){
        return fetchJson(this.apiURL(), {method: 'post', body: {files}})
            .then(response => `${baseUrl}/download?path=${response.zip_file}&study=_PATH`);
    },


    getParents(file){
        return this.files().filter(f => f.isDir && file.basePath.indexOf(f.path) === 0);
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

let studyFactory =  code =>{
    let study = Object.create(studyPrototype);
    Object.assign(study, {
        code    : code,
        id      : '',
        view    : true,
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
var viewModelMap = function(signature) {
    var map = {};
    return function(key) {
        if (!map[key]) {
            map[key] = {};
            for (var prop in signature) map[key][prop] = m.prop(signature[prop]());
        }
        return map[key];
    };
};
