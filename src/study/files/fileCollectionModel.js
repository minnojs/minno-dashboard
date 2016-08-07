import {fetchJson, fetchVoid, fetchUpload} from 'utils/modelHelpers';
import fileFactory from './fileModel';
import downloadUrl from 'utils/downloadUrl';
export default studyFactory;
import {baseUrl} from 'modelUrls';

let studyPrototype = {
    apiURL(path = ''){
        return `${baseUrl}/files/${encodeURIComponent(this.id)}${path}`;
    },

    get(){
        return fetchJson(this.apiURL())
            .then(study => {
                this.loaded = true;
                this.isReadonly = study.is_readonly;
                this.name = study.study_name;
                let files = flattenFiles(study.files)
                    .map(assignStudyId(this.id))
                    .map(fileFactory);

                this.files(files);
                this.sort();
            })
            .catch(reason => {
                this.error = true;
                return Promise.reject(reason); // do not swallow error
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

        // create an array including file and all its children
        function spreadFile(file){
            return [file].concat(flattenFiles(file.files));
        }


    },

    getFile(id){
        return this.files().find(f => f.id === id);
    },

    getChosenFiles(){
        return this.files().filter(file => this.vm(file.id).isChosen() === 1); // do not include half chosen dirs
    },

    addFile(file){
        // update the file list
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

    uploadFiles(path, files){
        let paths = Array.from(files, file => path === '/' ? file.name : path + '/' + file.name);
        let formData = buildFormData(path === '/' ? '' : path, files);
        // validation (make sure files do not already exist)
        let exists = this.files().find(file => paths.includes(file.path));
        if (exists) return Promise.reject({message: `The file "${exists.path}" already exists`});

        return fetchUpload(this.apiURL(`/upload/${path === '/' ? '' : path}`), {method:'post', body:formData})
            .then(response => {
                response.forEach(src => {
                    let file = fileFactory(Object.assign({studyId: this.id},src));
                    this.addFile(file);
                });

                return response;
            })
            .then(this.sort.bind(this));

        function buildFormData(path, files) {
            var formData = new FormData;
            // formData.append('path', path);

            // for (let file in files) {
            //  formData.append('files', files[file]);
            // }

            for (let i = 0; i < files.length; i++) {
                formData.append(i, files[i]);
            }

            return formData;
        }
    },

    downloadFiles(files){
        return fetchJson(this.apiURL(), {method: 'post', body: {files}})
            .then(response => downloadUrl(`${baseUrl}/download?path=${response.zip_file}&study=_PATH`, this.name));
    },

    delFiles(files){
        return fetchVoid(this.apiURL(), {method: 'delete', body: {files}})
            .then(() => {
                let filesList = this.files()
                    .filter(f => files.indexOf(f.path) === -1); // only exact matches here, the choice mechanism takes care of nested folders

                this.files(filesList);
            });
    },

    del(fileId){
        let file = this.getFile(fileId);
        return file.del()
            .then(() => {
                let files = this.files()
                    .filter(f => f.path.indexOf(file.path) !== 0); // all paths that start with the same path are deleted
                this.files(files);
            });
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

let studyFactory =  id =>{
    let study = Object.create(studyPrototype);
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
