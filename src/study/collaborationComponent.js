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
            loaded:false
        };
        load();
        return {ctrl};
        function load() {
            fetch('/dashboard/dashboard/studies/0/shared_with_me', {credentials: 'same-origin'})
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
    },
    view({ctrl}){
        if (!ctrl.loaded) return m('.loader');
        return m('.container.studies', [
            m('.row', [
                m('.col-sm-6', [
                    m('h3', 'Shared with me')
                ]),

            ]),
            m('.card.studies-card', [
                m('.card-block', [
                    m('.row', [
                        m('.col-sm-3', [
                            m('strong','Study Name')
                        ])
                    ]),
                    ctrl.studies().map(study => m('.row.study-row', [
                        m('a', {href: `/editor/${study.id}`,config:routeConfig}, [
                            m('.col-sm-3', [
                                m('.study-text', study.name)
                            ]),
                            m('.col-sm-9', [
                                m('.btn-toolbar.pull-right', [
                                    m('.btn-group.btn-group-sm', [

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
                                            }, 'Request Removal')
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
