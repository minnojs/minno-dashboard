import {deleteFiles, downloadFiles} from './fileActions';
import fileContext from './fileContext';
import {uploadFiles} from './fileActions';
export default sidebarButtons;

let sidebarButtons = ({study}) => {
    let readonly = study.isReadonly;

    return m('.btn-group.btn-group-sm', [
        m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || fileContext(null, study), title: 'Create new files'}, [
            m('i.fa.fa-plus')
        ]),
        m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || deleteFiles(study), title: 'Delete checkmarked files'}, [
            m('i.fa.fa-close')
        ]),
        m('a.btn.btn-secondary.btn-sm', {onclick: downloadFiles(study), title: 'Download checkmarked files'}, [
            m('i.fa.fa-download')
        ]),
        m('label.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', title: 'Drag files over the file list in order to upload easily'}, [
            m('i.fa.fa-upload'),
            readonly ? '' : m('input[type="file"]', {style: 'display:none', multiple:'true', onchange: uploadButton(study)})
        ])
    ]);
};


function uploadButton(study){
    return e => {
        let dataTransfer = e.dataTransfer || e.target;
        uploadFiles('/', study)(dataTransfer.files);
    };
}
