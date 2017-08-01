import {deleteFiles, downloadChosenFiles} from './fileActions';
import fileContext from './fileContext';
import {uploadFiles} from './fileActions';
import dropdown from 'utils/dropdown';
import {do_delete, do_rename, do_duplicate, do_lock} from '../../studyActions';
import copyUrl from 'utils/copyUrl';
export default sidebarButtons;

let sidebarButtons = ({study}) => {
    let readonly = study.isReadonly;
    let studyId = m.route.param('studyId');

    return m('.btn-toolbar', [
        m('.btn-group.btn-group-sm', [
            dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-menu-right', toggleContent: m('i.fa.fa-bars'), elements: [
                readonly ? '' : [
                    study.is_locked ? '' : m('button.dropdown-item.dropdown-onclick', {onmousedown: do_delete(study.id, () => m.route('/studies'))}, [
                        m('i.fa.fa-fw.fa-remove'), ' Delete study'
                    ]),
                    study.is_locked ? '' : m('button.dropdown-item.dropdown-onclick', {onmousedown: do_rename(study.id, study.name, name => study.name = name)}, [
                        m('i.fa.fa-fw.fa-exchange'), ' Rename study'
                    ])

                ],
                study.view ? '' :
                    m('button.dropdown-item.dropdown-onclick', {onmousedown: do_duplicate(study.id, study.name)}, [
                        m('i.fa.fa-fw.fa-clone'), ' Duplicate study'
                    ]),

                !study.is_locked && readonly ? '' : [
                    m('button.dropdown-item.dropdown-onclick', {onmousedown: do_lock(study)}, [
                        m('i.fa.fa-fw', {class: study.is_locked ? 'fa-unlock' : 'fa-lock'}), study.is_locked  ? ' Unlock Study' :' Lock Study'
                    ]),
                    study.is_locked ? '' : m('a.dropdown-item', { href: `/deploy/${studyId}`, config: m.route }, 'Request Deploy'),
                    study.is_locked ? '' : m('a.dropdown-item', { href: `/studyChangeRequest/${studyId}`, config: m.route }, 'Request Change'),
                    study.is_locked ? '' : m('a.dropdown-item', { href: `/studyRemoval/${studyId}`, config: m.route }, 'Request Removal'),
                    m('a.dropdown-item', { href: `/sharing/${studyId}`, config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing'])
                ],
                m('button.dropdown-item.dropdown-onclick', {onmousedown: copyUrl(study.baseUrl)}, [m('i.fa.fa-fw.fa-link'), ' Copy Base URL'])
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
