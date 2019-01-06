import jshintOptions from './editors/jshintOptions';
import {fetchVoid, fetchJson} from 'utils/modelHelpers';
import {baseUrl} from 'modelUrls';
export default fileFactory;

const filePrototype = {
    apiUrl(){
        return `${baseUrl}/files/${encodeURIComponent(this.studyId)}/file/${encodeURIComponent(this.id)}`;
    },

    get(){
        return fetchJson(this.apiUrl())
            .then(response => {
                const content = response.content
                    .replace(/\r\n/g, '\n') // Replace carriage returns 
                    .replace(/([^\n])$/,'$1\n'); //  Make sure all files are unix EOF encoded...

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

    copy(path, study_id, new_study_id){
        return fetchJson(this.apiUrl() + `/copy/`, {
            method:'put',
            body: {new_study_id}
        })
            .catch(response => {
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
        console.warn('This should be deprecated!!!');
        const requirejs = context.requirejs;
        const name = this.url;
        const content = this.content();

        return new Promise((resolve) => {
            requirejs.undef(name);
            context.eval(content.replace(`define(`,`define('` + name + `',`));
            resolve();
        });
    },

    require(context = window){
        const requirejs = context.requirejs;
        return new Promise((resolve, reject) => {
            requirejs([this.url], resolve,reject);
        });
    },

    checkSyntax(){
        const jshint = window.JSHINT;
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

        undoManager     : m.prop(), // a prop to keep track of the ace-editor undo manager for this file
        position        : m.prop() // a prop to keep track of the ace-editor position in this file
    });

    file.content(fileObj.content || '');

    if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(file => Object.assign(file, {studyId: fileObj.studyId}));

    return file;

    function contentProvider (store) {
        let prop = (...args) => {
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
