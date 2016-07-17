export default mainComponent;
import {load_studies} from './studyModel';
import dropdown from 'utils/dropdown';
import {do_create, do_delete, do_rename} from './studyActions';

let thConfig = (prop, current) => ({'data-sort-by':prop, class: current() === prop ? 'active' : ''});

var mainComponent = {
    controller: function(){
        var ctrl = {
            studies:m.prop([]),
            user_name:m.prop(''),
            globalSearch: m.prop(''),
            permissionChoice: m.prop('all'),
            loaded:false,
            loadStudies
        };

        loadStudies();
        return ctrl;

        function loadStudies() {
            load_studies()
                .then(response => response.studies.sort(sortStudies))
                .then(ctrl.studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);

            function sortStudies(study1, study2){
                return study1.name === study2.name ? 0 : study1.name > study2.name ? 1 : -1;
            }
        }

    },
    view({loaded, studies, permissionChoice, globalSearch, loadStudies}){
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
                    m('.row', [
                        m('.col-sm-3', [
                            
                            m('p.form-control-static',[m('strong', 'Study Name')])
                        ]),
                        m('.col-sm-5', [
                            m('p.form-control-static',[m('strong', ' Last Changed')])
                        ]),
                        m('.col-sm-4', [
                            m('input.form-control', {placeholder: 'Search ...', value: globalSearch(), onkeyup: m.withAttr('value', globalSearch)})    
                        ])
                    ]),

                    studies()
                        .filter(permissionFilter(permissionChoice()))
                        .filter(searchFilter(globalSearch()))
                        .map(study => m('a', {href: `/editor/${study.id}`,config:routeConfig, key: study.id}, [
                            m('.row.study-row', [
                                m('.col-sm-3', [
                                    m('.study-text', study.name),
                                    !study.is_public ? '' :  m('span.label.label-warning.m-l-1', 'Public'),
                                    study.is_public || study.permission === 'owner' ? '' :  m('span.label.label-info.m-l-1', 'Colaboration')
                                ]),
                                m('.col-sm-5', [
                                    m('.study-text', study.last_modified)
                                ]),
                                m('.col-sm-4', [
                                    m('.btn-toolbar.pull-right', [
                                        m('.btn-group.btn-group-sm', [
                                            study.permission =='read only' || study.is_public ?  '' : dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Actions', elements: [
                                                study.permission !== 'owner' ? '' : [
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

        e.preventDefault();
        if (e.target.tagName === 'A' && e.target !== el) return;

        m.route(el.search.slice(1));
    }
}
