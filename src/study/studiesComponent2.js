import {toJSON, checkStatus} from 'utils/modelHelpers';
export default mainComponent;
import messages from 'utils/messagesComponent';
import {create_study} from './studyModel';
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
            fetch('/dashboard/dashboard/studies/0/shared_with_me', {credentials: 'same-origin'})
                .then(checkStatus)
                .then(toJSON)
                .then(ctrl.studies)
                .then(()=>ctrl.loaded = true)
                .then(m.redraw);
        }
        function do_add(){
            messages.prompt({header:'New Study', content:m('p', [m('p', 'Enter Study Name:'), m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())]), prop: ctrl.study_name})
                .then(response => {
                    if (response) create_study(ctrl)
                        .then((response)=>{
                            m.route('/editor/'+response.study_id);
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_add();
                        }).then(m.redraw);
                });
        }

        load();
        return {ctrl, do_add};
    },
    view({ctrl, do_add}){
        return  !ctrl.loaded
                ?
                m('.loader')
                :
        m('.container', [
            m('h3', 'My studies'),

            m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                m('button.btn.btn-secondary', {onclick:do_add}, [
                    m('i.fa.fa-plus'), '  Add new study'
                ])
            ]),
            m('table', {class:'table table-striped table-hover'}, [
                m('thead', [
                    m('tr', [
                        m('th', 'Study name'),
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