import {toJSON, checkStatus} from 'utils/modelHelpers';
export default mainComponent;
import messages from 'utils/messagesComponent';
import {create_study, delete_study, rename_study} from './studyModel';
import dropdown from 'utils/dropdown';

var mainComponent = {
    controller: function(){
        var ctrl = {
            studies:m.prop([]),
            error:m.prop(''),
            study_name:m.prop(''),
            user_name:m.prop(''),
            globalSearch: m.prop(''),
            permissionChoice: m.prop('all'),
            loaded:false,
            do_create, do_delete, do_rename
        };

        load();
        return ctrl;

        function load() {
            fetch('/dashboard/dashboard/studies', {credentials: 'same-origin'})
                .then(checkStatus)
                .then(toJSON)
                .then(response => response.studies.sort(sortStudies))
                .then(ctrl.studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);
            function sortStudies(study1, study2){
                return study1.name === study2.name ? 0 : study1.name > study2.name ? 1 : -1;
            }
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
    view({loaded, studies, do_create, do_delete, do_rename, permissionChoice, globalSearch}){
        if (!loaded) return m('.loader');
        return m('.container.studies', [
            m('.row', [
                m('.col-sm-6', [
                    m('h3', 'My Studies')
                ]),

                m('.col-sm-6', [
                    m('button.btn.btn-success.btn-sm.pull-right', {onclick:do_create}, [
                        m('i.fa.fa-plus'), '  Add new study'
                    ]),

                    m('.input-group.pull-right.m-r-1', [
                        m('select.c-select.form-control.form-control-sm', {value:'Filter studies', onchange: e => permissionChoice(e.target.value)}, [
                            m('option',{disabled: true}, 'Filter studies'),
                            m('option', {value:'all'}, 'Show all my studies'),
                            m('option', {value:'owner'}, 'Show only studies I created'),
                            m('option', {value:'collaboration'}, 'Show only studies shared with me'),
                            m('option', {value:'public'}, 'Show only public studies')
                        ])
                    ])
                ])
            ]),
            
            m('.card.studies-card', [
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-9', [
                            m('p.form-control-static',[m('strong', 'Study Name')])
                        ]),
                        m('.col-sm-3', [
                            m('input.form-control', {placeholder: 'Search ...', onkeyup: m.withAttr('value', globalSearch)})    
                        ])
                    ]),

                    studies()
                        .filter(permissionFilter(permissionChoice()))
                        .filter(searchFilter(globalSearch()))
                        .map(study => m('a', {href: `/editor/${study.id}`,config:routeConfig, key: study.id}, [
                            m('.row.study-row', [
                                m('.col-sm-3', [
                                    m('.study-text', study.name)
                                ]),
                                m('.col-sm-9', [
                                    m('.btn-toolbar.pull-right', [
                                        m('.btn-group.btn-group-sm', [
                                            study.permission =='read only' || study.is_public
                                            ?
                                            ''
                                            :
                                            dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                study.permission!=='owner'
                                                ?
                                                ''
                                                :
                                                [m('a.dropdown-item',
                                                    {onclick:function() {do_delete(study.id);}},
                                                    [m('i.fa.fa-remove'), ' Delete']),
                                                m('a.dropdown-item',
                                                    {onclick:function() {do_rename(study.id);}},
                                                        [m('i.fa.fa-exchange'), ' Rename'])]
                                                ,
                                                m('a.dropdown-item', {
                                                    href: `/deploy/${study.id}`,
                                                    config: m.route
                                                }, 'Request Deploy'),
                                                m('a.dropdown-item', {
                                                    href: `/studyChangeRequest/${study.id}`,
                                                    config: m.route
                                                }, 'Request Change'),
                                                m('a.dropdown-item', {
                                                    href: `/studyRemoval/${study.id}`,
                                                    config: m.route
                                                }, 'Request Removal'),
                                                m('a.dropdown-item', {
                                                    href: `/sharing/${study.id}`,
                                                    config: m.route
                                                }, [m('i.fa.fa-user-plus'), ' Sharing'])
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

let permissionFilter = permission => study => {
    if(permission === 'all') return !study.is_public;
    if(permission === 'public') return study.is_public;
    if(permission === 'collaboration') return study.permission !== 'owner' && !study.is_public;
    return study.permission === permission;
};

let searchFilter = searchTerm => study => !study.name || study.name.match(new RegExp(searchTerm, 'i'));

function routeConfig(el, isInit, ctx, vdom) {

    el.href = location.pathname + '?' + vdom.attrs.href;

    if (!isInit) el.addEventListener('click', route);

    function route(e){
        let el = e.currentTarget;

        if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;

        e.preventDefault();
        if (e.target.tagName === 'A' && e.target !== el) return;

        m.route(el.search.slice(1));
    }
}
