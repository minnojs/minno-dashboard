import fullHeight from 'utils/fullHeight';
import imgEditor from './editors/imgEditor';
import pdfEditor from './editors/pdfEditor';
import unknowEditor from './editors/unknownEditor';
import textEditor from './editors/textEditor';

export default fileEditorComponent;

let editors = {
    js: textEditor,
    jsp: textEditor,
    json: textEditor,
    html: textEditor,
    htm: textEditor,
    jst: textEditor,
    xml: textEditor,

    jpg: imgEditor,
    bmp: imgEditor,
    png: imgEditor,

    pdf: pdfEditor
};

let fileEditorComponent = {
    controller: function({study}) {
        var id = m.route.param('fileId');
        var file = study.getFile(id);
        var ctrl = {file,study};

        return ctrl;
    },

    view: ({file, study}, args = {}) => {
        let editor = file && editors[file.type] || unknowEditor;

        return m('div', {config:fullHeight}, [
            file
                ? editor({file, study,  settings: args.settings})
                : m('.centrify', [
                    m('i.fa.fa-smile-o.fa-5x'),
                    m('h5', 'Please select a file to start working')
                ])
        ]);
    }
};
