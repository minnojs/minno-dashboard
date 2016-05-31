import {get_collaborations, remove_collaboration, add_collaboration} from './collaborationModel';
import messages from 'utils/messagesComponent';

export default collaborationComponent;
const TABLE_WIDTH = 8;

let collaborationComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            user_name:m.prop(''),
            loaded:false,
            error:m.prop('')
        };
        function load() {
            get_collaborations(m.route.param('studyId'))
                .then(response =>{ctrl.users(response.users); ctrl.loaded = true;})
                .catch(error => {
                    throw error;
                }).then(m.redraw);

        }
        function remove(user_id){
            messages.confirm({header:'Delete collaboration', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_collaboration(m.route.param('studyId'), user_id)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                ctrl.error(error.message);
                            })
                            .then(m.redraw);
                })
        }
        function do_add_collaboration(){
            messages.prompt({header:'New collaboration', content:m('p', [m('p', 'Enter user Name:'), m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())]), prop: ctrl.user_name})
                .then(response => {
                    if (response) add_collaboration(m.route.param('studyId'), ctrl.user_name)
                        .then(()=>{
                            load();
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_add_collaboration();
                        }).then(m.redraw);
                });
        }
        load();
        return {ctrl, remove, do_add_collaboration};
    },
    view({ctrl, remove, do_add_collaboration}){
        return  !ctrl.loaded
            ?
            m('.loader')
            :
            m('.container', [
                m('h3', 'My collaborations'),
                m('th.text-xs-center', {colspan:TABLE_WIDTH}, [
                    m('button.btn.btn-secondary', {onclick:do_add_collaboration}, [
                        m('i.fa.fa-plus'), '  Add new collaboration'
                    ])
                ]),
                m('table', {class:'table table-striped table-hover'}, [
                    m('thead', [
                        m('tr', [
                            m('th', 'User name'),
                            m('th',  'Permission'),
                            m('th',  'Remove')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.users().map(user => m('tr', [
                            m('td', user.USERNAME),
                            m('td', user.PERMISSION),
                            m('td', m('button.btn.btn-secondary', {onclick:function() {remove(user.USER_ID);}}, 'Remove'))
                        ]))

                    ])
                ])
            ]);
    }
};