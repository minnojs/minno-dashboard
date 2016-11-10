import jshintOptions from './editors/jshintOptions';
import {fetchVoid, fetchJson} from 'utils/modelHelpers';
import {fileUrl as baseUrl} from 'modelUrls';
export default fileFactory;

let filePrototype = {
    apiUrl(){
        return `${baseUrl}/files/${encodeURIComponent(this.studyId)}/file/${encodeURIComponent(this.id)}`;
    },

    get(){
        return fetchJson(this.apiUrl())
            .then(response => {
                let content = response.content.replace(/\r\n?|\n?$/g, '\n'); // replace carriage returns and add new line to EOF. this makes sure all files are unix encoded...
                this.sourceContent(content);
                this.content(content);
                this.loaded = true;
                this.error = false;
                this.last_modify = response.last_modify;

            })
            .catch(reason => {
                this.loaded = true;
                this.error = true;
                return Promise.reject(reason); // do not swallow error
            });
    },

    save(){


        return fetchJson(this.apiUrl(), {
            method:'put',
            body: {content: this.content, last_modify:this.last_modify}
        })
            .then(response => {
                this.sourceContent(this.content()); // update source content
                this.last_modify = response.last_modify;
                return response;
            });
    },

    move(path, study){
        let basePath = (path.substring(0, path.lastIndexOf('/')));
        let folderExists = basePath === '' || study.files().some(f => f.isDir && f.path === basePath);

        if (!folderExists) return Promise.reject({message: `Folder ${basePath} does not exist.`});
        if (study.files().some(f=>f.path === path)) return Promise.reject({message: `File ${path} already exists.`});

        let oldPath = this.path;
        this.setPath(path);
        this.content(this.content()); // in case where changing into a file type that needs syntax checking

        return fetchJson(this.apiUrl() + `/move/`, {
            method:'put',
            body: {path, url:this.url}
        })
            .then(response => {
                this.id = response.id;
                this.url = response.url;
            })
            .catch(response => {
                this.setPath(oldPath);
                return Promise.reject(response);
            });
    },

    del(){
        return fetchVoid(this.apiUrl(), {method:'delete'});
    },


    hasChanged() {
        return this.sourceContent() !== this.content();
    },

    define(context = window){
        var requirejs = context.requirejs;
        var name = this.url;
        var content = this.content();

        return new Promise((resolve) => {
            requirejs.undef(name);
            context.eval(content.replace(`define(`,`define('` + name + `',`));
            resolve();
        });
    },

    require(context = window){
        var requirejs = context.requirejs;
        return new Promise((resolve, reject) => {
            requirejs([this.url], resolve,reject);
        });
    },

    checkSyntax(){
        var jshint = window.JSHINT;
        this.syntaxValid = jshint(this.content(), jshintOptions);
        this.syntaxData = jshint.data();
        return this.syntaxValid;
    },

    setPath(path = ''){
        this.path = path;
        this.name = path.substring(path.lastIndexOf('/')+1);
        this.basePath = (path.substring(0, path.lastIndexOf('/'))) + '/';
        this.type = path.substring(path.lastIndexOf('.')+1).toLowerCase();
    }
};

/**
 * fileObj = {
 *  id: #hash,
 *  path: path,     
 *  url: URL
 * }
 */

const fileFactory = fileObj => {
    let file = Object.create(filePrototype);
    let path = decodeURIComponent(fileObj.path);


    file.setPath(path);

    Object.assign(file, fileObj, {
        id          : fileObj.id,
        sourceContent       : m.prop(fileObj.content || ''),
        content         : contentProvider.call(file, fileObj.content || ''), // custom m.prop, alows checking syntax on change

        // keep track of loaded state
        loaded          : false,
        error           : false,

        // these are defined when calling checkSyntax
        syntaxValid     : undefined,
        syntaxData      : undefined,

        undoManager     : m.prop() // a prop to keep track of the undo manager for this file
    });

    file.content(fileObj.content || '');

    if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(file => Object.assign(file, {studyId: fileObj.studyId}));

    return file;


    function contentProvider (store) {
        var prop = (...args) => {
            if (args.length) {
                store = args[0];
                this.type === 'js' && this.checkSyntax();
            }
            return store;
        };

        prop.toJSON = () => store;

        return prop;
    }
};
