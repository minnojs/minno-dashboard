import {deleteFiles, downloadChosenFiles} from './fileActions';
import fileContext from './fileContext';
import {uploadFiles} from './fileActions';
import dropdown from 'utils/dropdown';
import {do_delete, do_rename} from '../../studyActions';
import copyUrl from 'utils/copyUrl';
export default sidebarButtons;

let sidebarButtons = ({study}) => {
    let readonly = study.isReadonly;
    let studyId = m.route.param('studyId');

    return m('.btn-toolbar', [
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
        ]),
        m('.btn-group.btn-group-sm', [
            dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), right: true,  elements: [
                readonly ? '' : [
                    m('a.dropdown-item', {onclick: do_delete(study.id, () => m.route('/studies'))}, [
                        m('i.fa.fa-fw.fa-remove'), ' Delete'
                    ]),
                    m('a.dropdown-item', {onclick: do_rename(study.id, study.name, name => study.name = name)}, [
                        m('i.fa.fa-fw.fa-exchange'), ' Rename'
                    ])
                ],
                m('a.dropdown-item', { href: `/deploy/${studyId}`, config: m.route }, 'Request Deploy'),
                m('a.dropdown-item', { href: `/studyChangeRequest/${studyId}`, config: m.route }, 'Request Change'),
                m('a.dropdown-item', { href: `/studyRemoval/${studyId}`, config: m.route }, 'Request Removal'),
                m('a.dropdown-item', { href: `/sharing/${studyId}`, config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing']),
                m('a.dropdown-item.dropdown-onclick', {onmousedown: copyUrl(study.baseUrl)}, [m('i.fa.fa-fw.fa-link'), ' Copy Study Path'])
            ]})
        ])
    ]);
};


function uploadButton(study){
    return e => {
        let dataTransfer = e.dataTransfer || e.target;
        uploadFiles('/', study)(dataTransfer.files);
    };
}
