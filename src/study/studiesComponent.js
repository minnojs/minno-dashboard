import {toJSON, checkStatus} from 'utils/modelHelpers';
export default mainComponent;
import messages from 'utils/messagesComponent';
import {create_study, delete_study, rename_study} from './studyModel';
import dropdown from 'utils/dropdown';

var mainComponent = {
    controller: function(){
        var ctrl = {
            studies:m.prop([]),
            filtered_studies:m.prop([]),
            error:m.prop(''),
            study_name:m.prop(''),
            user_name:m.prop(''),
            loaded:false
        };

        load();
        return {ctrl, do_create, do_delete, do_rename, filter_by};

        function load() {
            fetch('/dashboard/dashboard/studies', {credentials: 'same-origin'})
                .then(checkStatus)
                .then(toJSON)
                .then(response => response.studies.sort(sortStudies))
                .then(ctrl.studies)
                .then(ctrl.filtered_studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);

            function sortStudies(study1, study2){
                return study1.name === study2.name ? 0 : study1.name > study2.name ? 1 : -1;
            }
        }
        function filter_by(permission){
            if(permission === 'all') {
                ctrl.filtered_studies(ctrl.studies());
                return;
            }
            ctrl.filtered_studies(ctrl.studies().filter(study => study.permission ===permission));
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

    },
    view({ctrl, do_create, do_delete, do_rename, filter_by}){
        if (!ctrl.loaded) return m('.loader');
        return m('.container.studies', [
            m('.row', [
                m('.col-sm-6', [
                    m('h3', 'My Studies')
                ]),

                m('.col-sm-6', [
                    m('button.btn.btn-success.btn-sm.pull-right', {onclick:do_create}, [
                        m('i.fa.fa-plus'), '  Add new study'
                    ]),

                    dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle.pull-right.m-r-1', toggleContent: 'Show me...', elements: [
                        m('a.dropdown-item', {onclick:function() {filter_by('all');}}, 'Show all my studies'),
                        m('a.dropdown-item', {onclick:function() {filter_by('owner');}}, 'Show only studies I created'),
                        m('a.dropdown-item', {onclick:function() {filter_by('collaborate');}}, 'Show only studies shared with me')
                    ]})
                ])
            ]),
            m('.card.studies-card', [
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-3', [
                            m('strong','Study Name')
                        ])
                    ]),
                    ctrl.filtered_studies().map(study => m('.row.study-row', [
                        m('a', {href: `/editor/${study.id}`,config:routeConfig}, [
                            m('.col-sm-3', [
                                m('.study-text', study.name)
                            ]),
                            m('.col-sm-9', [
                                m('.btn-toolbar.pull-right', [
                                    m('.btn-group.btn-group-sm', [

                                        study.permission==='owner'
                                            ?
                                            m('a.btn.btn-sm.btn-secondary', {onclick:function() {do_delete(study.id);}}, [
                                                m('i.fa.fa-remove'), ' Delete'
                                            ])
                                            :
                                            '',
                                        study.permission==='owner'
                                            ?
                                            m('a.btn.btn-sm.btn-secondary', {onclick:function() {do_rename(study.id);}}, [
                                                m('i.fa.fa-exchange'), ' Rename'
                                            ])
                                            :
                                            '',
                                        dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                            m('a.dropdown-item', {
                                                href: `/deploy/${study.id}`,
                                                config: m.route
                                            }, 'Request Deploy'),
                                            m('a.dropdown-item', {
                                                href: `/studyChangeRequest/${study.id}`,
                                                config: m.route
                                            }, 'Request Change request'),
                                            m('a.dropdown-item', {
                                                href: `/studyRemoval/${study.id}`,
                                                config: m.route
                                            }, 'Request Removal'),
                                            m('a.dropdown-item', {
                                                href: `/collaboration/${study.id}`,
                                                config: m.route
                                            }, 'Add a Collaborator')
                                        ]})
                                    ])
                                ])
                            ])
                        ])
                    ]))
                ])
            ])
        ]);
    }
};

function routeConfig(el, isInit, ctx, vdom) {

    el.href = location.pathname + '?' + vdom.attrs.href;

    if (isInit) el.addEventListener('click', route);

    function route(e){
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;

        e.preventDefault();
        if (e.target !== el) return;

        m.route(el.search.slice(1));
    }
}
