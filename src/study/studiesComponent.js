import {toJSON, checkStatus} from 'utils/modelHelpers';
export default mainComponent;
import messages from 'utils/messagesComponent';
import {create_study, delete_study, rename_study} from './studyModel';
import dropdown from 'utils/dropdown';

const TABLE_WIDTH = 8;
var mainComponent = {
    controller: function(){
        var ctrl = {
            studies:m.prop(),
            error:m.prop(''),
            study_name:m.prop(''),
            user_name:m.prop(''),
            loaded:false
        };
        function load() {
            fetch('/dashboard/dashboard/studies', {credentials: 'same-origin'})
                .then(checkStatus)
                .then(toJSON)
                .then(ctrl.studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);
        }
        function do_delete(study_id){
            messages.confirm({header:'Delete study', content:'Are you sure?', prop: ctrl.study_name})
                .then(response => {
                    if (response)
                        delete_study(study_id, ctrl)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                messages.alert({header: 'Delete study', content: m('p', {class: 'alert alert-danger'}, error.message)});

                            }).then(m.redraw);
                });
        }

        function do_create(){
            messages.prompt({header:'New Study', content:m('p', [m('p', 'Enter Study Name:'), m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())]), prop: ctrl.study_name})
                .then(response => {
                    if (response) create_study(ctrl)
                        .then((response)=>{
                            m.route('/editor/'+response.study_id);
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_create();
                        }).then(m.redraw);
                });
        }
        function do_rename(study_id){
            messages.prompt({header:'New Name', content:m('p', [m('p', 'Enter Study Name:'), m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())]), prop: ctrl.study_name})
                .then(response => {
                    if (response) rename_study(study_id, ctrl)
                        .then(()=>{
                            load();
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_rename(study_id);
                        }).then(m.redraw);
                });
        }

        load();
        return {ctrl, do_create, do_delete, do_rename};
    },
    view({ctrl, do_create, do_delete, do_rename}){
        return  !ctrl.loaded
                ?
                m('.loader')
                :
        m('.container', [
            m('h3', 'My studies'),

            m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                m('button.btn.btn-secondary', {onclick:do_create}, [
                    m('i.fa.fa-plus'), '  Add new study'
                ])
            ]),
            m('table', {class:'table table-striped table-hover'}, [
                m('thead', [
                    m('tr', [
                        m('th', 'Study name'),
                        m('th',  'Delete'),
                        m('th',  'Rename'),
                        m('th',  'collaboration'),
                        m('th',  'Actions')
                    ])
                ]),
                m('tbody', [
                    ctrl.studies().studies.map(study => m('tr', [
                        m('td', m('a.btn.btn-secondary',{
                            href: `/editor/${study.id}`,
                            config: m.route
                        }, study.name)),
                        m('td', m('button.btn.btn-secondary', {onclick:function() {do_delete(study.id);}}, 'Delete')),
                        m('td', m('button.btn.btn-secondary', {onclick:function() {do_rename(study.id);}}, 'Rename')),
                        m('td', m('a.dropdown-item', {
                            href: `/collaboration/${study.id}`,
                            config: m.route
                        }, 'collaboration')),
                        dropdown({toggleSelector:'a.btn.btn-secondary.dropdown-toggle', toggleContent: 'Action', elements: [
                            m('a.dropdown-item', {
                                href: `/deploy/${study.id}`,
                                config: m.route
                            }, 'Deploy'),
                            m('a.dropdown-item', {
                                href: `/studyChangeRequest/${study.id}`,
                                config: m.route
                            }, 'Change request'),
                            m('a.dropdown-item', {
                                href: `/studyRemoval/${study.id}`,
                                config: m.route
                            }, 'Removal')
                        ]})

                    ]))

                ])
            ])
        ]);
    }
};