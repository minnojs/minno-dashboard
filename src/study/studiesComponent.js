export default mainComponent;
import {load_studies} from './studyModel';
import dropdown from 'utils/dropdown';
import {do_create, do_delete, do_rename, do_tags} from './studyActions';
import classNames from 'utils/classNames';
import formatDate from 'utils/formatDate';

var mainComponent = {

    controller: function(){
        var ctrl = {
            studies:m.prop([]),
            user_name:m.prop(''),
            globalSearch: m.prop(''),
            permissionChoice: m.prop('all'),
            loaded:false,
            order_by_name: true,
            loadStudies,
            sort_studies_by_name,
            sort_studies_by_date
        };

        loadStudies();
        return ctrl;
        function loadStudies() {
            load_studies()
                .then(response => response.studies.sort(sort_studies_by_name2))
                .then(ctrl.studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);
        }
        
        function sort_studies_by_name2(study1, study2){
            ctrl.order_by_name = true;

            return study1.name.toLowerCase() === study2.name.toLowerCase() ? 0 : study1.name.toLowerCase() > study2.name.toLowerCase() ? 1 : -1;
        }

        function sort_studies_by_date2(study1, study2){
            ctrl.order_by_name = false;
            return study1.last_modified === study2.last_modified ? 0 : study1.last_modified < study2.last_modified ? 1 : -1;
        }

        function sort_studies_by_date(){
            ctrl.studies(ctrl.studies().sort(sort_studies_by_date2));
        }
        function sort_studies_by_name(){
            ctrl.studies(ctrl.studies().sort(sort_studies_by_name2));
        }


    },
    view({loaded, studies, permissionChoice, globalSearch, loadStudies, sort_studies_by_date, sort_studies_by_name, order_by_name}){
        if (!loaded) return m('.loader');
        return m('.container.studies', [
            m('.row.p-t-1', [
                m('.col-sm-6', [
                    m('h3', 'My Studies')
                ]),

                m('.col-sm-6', [
                    m('button.btn.btn-success.btn-sm.pull-right', {onclick:do_create}, [
                        m('i.fa.fa-plus'), '  Add new study'
                    ]),

                    m('.input-group.pull-right.m-r-1', [
                        m('select.c-select.form-control.form-control-sm', {onchange: e => permissionChoice(e.target.value)}, [
                            m('option', {value:'all'}, 'Show all my studies'),
                            m('option', {value:'owner'}, 'Show only studies I created'),
                            m('option', {value:'collaboration'}, 'Show only studies shared with me'),
                            m('option', {value:'public'}, 'Show public studies')
                        ])
                    ])
                ])
            ]),
            
            m('.card.studies-card', [
                m('.card-block', [
                    m('.row', {key: '@@notid@@'}, [
                        m('p.col-sm-6', [
                            m('form-control-static',{onclick:sort_studies_by_name},[m('strong', 'Study Name ')]),
                            m('i.fa.fa-sort', {style: {color: order_by_name ? 'black' : 'grey'}})

                        ]),
                        m('p.col-sm-2', [
                            m('form-control-static',{onclick:sort_studies_by_date},[m('strong', ' Last Changed ')]),
                            m('i.fa.fa-sort', {style: {color: !order_by_name ? 'black' : 'grey'}})
                        ]),
                        m('.col-sm-4', [
                            m('input.form-control', {placeholder: 'Search ...', value: globalSearch(), oninput: m.withAttr('value', globalSearch)})    
                        ])
                    ]),

                    studies()
                        .filter(permissionFilter(permissionChoice()))
                        .filter(searchFilter(globalSearch()))
                        .map(study => m('a', {href: `/editor/${study.id}`,config:routeConfig, key: study.id}, [
                            m('.row.study-row', [
                                m('.col-sm-2', [
                                    m('i.fa.fa-fw.owner-icon', {
                                        class: classNames({
                                            'fa-globe': study.is_public,
                                            'fa-users': !study.is_public && study.permission !== 'owner' 
                                        }),
                                        title: classNames({
                                            'Public' : study.is_public,
                                            'Collaboration' : !study.is_public && study.permission !== 'owner' 
                                        })
                                    }),
                                    m('.study-text', study.name)
                                ]),
                                m('.col-sm-4', [
                                    study.tags.map(normalize_tags).map(tag=> m('span.study-tag',  {style: {'background-color': '#' + tag.color}}, tag.text))
                                ]),
                                m('.col-sm-5', [
                                    m('.study-text', formatDate(new Date(study.last_modified)))
                                ]),
                                m('.col-sm-1', [
                                    m('.btn-toolbar.pull-right', [
                                        m('.btn-group.btn-group-sm', [
                                            study.permission =='read only' || study.is_public ?  '' : dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                study.permission !== 'owner' ? '' : [
                                                    m('a.dropdown-item', {onclick: do_tags({study_id: study.id, callback: loadStudies})}, [
                                                        m('i.fa.fa-fw.fa-tags'), ' Tags'
                                                    ]),
                                                    m('a.dropdown-item', {onclick: do_delete(study.id, loadStudies)}, [
                                                        m('i.fa.fa-fw.fa-remove'), ' Delete'
                                                    ]),
                                                    m('a.dropdown-item', {onclick: do_rename(study.id, study.name, loadStudies)}, [
                                                        m('i.fa.fa-fw.fa-exchange'), ' Rename'
                                                    ])
                                                ],

                                                m('a.dropdown-item', { href: `/deploy/${study.id}`, config: m.route }, 'Request Deploy'),
                                                m('a.dropdown-item', { href: `/studyChangeRequest/${study.id}`, config: m.route }, 'Request Change'),
                                                m('a.dropdown-item', { href: `/studyRemoval/${study.id}`, config: m.route }, 'Request Removal'),
                                                m('a.dropdown-item', { href: `/sharing/${study.id}`, config: m.route }, [m('i.fa.fa-fw.fa-user-plus'), ' Sharing'])
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
        if (e.defaultPrevented) return;

        e.preventDefault();
        if (e.target.tagName === 'A' && e.target !== el) return;

        m.route(el.search.slice(1));
    }
}

function normalize_tags(tag){
    console.warn('This data should be fixed server side!!');
    tag.color = tag.color || tag.COLOR;
    tag.text = tag.text || tag.TEXT;
    return tag;
}
