import {deleteFiles, downloadChosenFiles} from './fileActions';
import fileContext from './fileContext';
import {uploadFiles} from './fileActions';
import dropdown from 'utils/dropdown';
import {draw_menu} from '../../studyMenu';

export default sidebarButtons;

const sidebarButtons = ({study}) => {
    const readonly = study.isReadonly;

    return m('.sidebar-buttons.btn-toolbar', [
        m('.btn-group.btn-group-sm', [
            dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), elements: [
                draw_menu(study)
            ]})
        ]),
        m('.btn-group.btn-group-sm', [
            m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || fileContext(null, study), title: 'Create new files'}, [
                m('i.fa.fa-plus')
            ]),
            m('a.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', onclick: readonly || deleteFiles(study), title: 'Delete selected files'}, [
                m('i.fa.fa-close')
            ]),
            m('a.btn.btn-secondary.btn-sm', {onclick: downloadChosenFiles(study), title: 'Download selected files'}, [
                m('i.fa.fa-download')
            ]),
            m('label.btn.btn-secondary.btn-sm', {class: readonly ? 'disabled' : '', title: 'Drag files over the file list in order to upload easily'}, [
                m('i.fa.fa-upload'),
                readonly ? '' : m('input[type="file"]', {style: 'display:none', multiple:'true', onchange: uploadButton(study)})
            ])
        ])
    ]);
};


function uploadButton(study){
    return e => {
        let dataTransfer = e.dataTransfer || e.target;
        uploadFiles('/', study)(dataTransfer.files);
    };
}
