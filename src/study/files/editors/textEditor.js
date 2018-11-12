import {save} from '../sidebar/fileActions';
import ace from './ace/aceComponent';
import observerFactory from 'utils/observer';

import jshintOptions from './jshintOptions';
import syntaxComponent from './ace/syntaxComponent';
import validatorComponent from './ace/validatorComponent';

import textMenu from './textMenu';

export default textEditor;

const textEditor = args => m.component(textEditorComponent, args);

const textEditorComponent = {
    controller: function({file}){
        const err = m.prop();
        file.loaded || file.get()
            .catch(err)
            .then(m.redraw);

        const ctrl = {mode:m.prop('edit'), observer: observerFactory(), err};

        return ctrl;
    },

    view: function(ctrl, {file,study}){
        const {observer, err, mode} = ctrl;

        if (!file.loaded) return m('.loader');

        if (file.error) return m('div', {class:'alert alert-danger'}, [
            m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
            `The file "${file.path}" was not found (${err() ? err().message : 'please try to refresh the page'}).`
        ]);

        return m('.editor', [
            textMenu({mode, file, study, observer}),
            textContent(ctrl, {key: file.id, file,observer, study})
        ]);
    }
};

const textContent = (ctrl, {file, study, observer}) => {
    let textMode = modeMap[file.type] || 'javascript';
    switch (ctrl.mode()){
        case 'edit' : return ace({
            content:file.content,
            observer,
            settings: {
                onSave: save(file), 
                mode: textMode,
                jshintOptions,
                isReadonly: study.isReadonly||study.is_locked,
                undoManager: file.undoManager,
                position: file.position
            }
        });
        case 'validator': return validatorComponent({file});
        case 'syntax': return syntaxComponent({file});
    }
};

let modeMap = {
    js: 'javascript',
    json: 'json',
    jsp: 'jsp',
    jst: 'ejs',
    html: 'ejs',
    htm: 'ejs',
    txt: 'ejs',
    m: 'ejs',
    c: 'ejs',
    cs: 'ejs',
    h: 'ejs',
    py: 'ejs',
    xml: 'xml'
};
