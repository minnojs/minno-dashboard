import {get_collaborations, remove_collaboration, add_collaboration, make_pulic} from './sharingModel';
import messages from 'utils/messagesComponent';
import dropdown from 'utils/dropdown';

export default collaborationComponent;
const TABLE_WIDTH = 8;

let collaborationComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            is_public:m.prop(),
            user_name:m.prop(''),
            permission:m.prop(''),
            loaded:false,
            error:m.prop('')
        };
        function load() {
            get_collaborations(m.route.param('studyId'))
                .then(response =>{ctrl.users(response.users);
                    ctrl.is_public(response.is_public);
                    ctrl.loaded = true;})
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
                });
        }
        function do_add_collaboration(){
            messages.prompt({header:'Add a Collaborator', content:m('p', [m('p', 'Enter collaborator\'s user name:'),

                dropdown({toggleSelector:'a.btn.btn-secondary.btn-sm.dropdown-toggle', toggleContent: 'Permission', elements: [
                    m('a.dropdown-item', {onclick:function() {ctrl.permission('read only');}}, 'Read only'),
                    m('a.dropdown-item', {onclick:function() {ctrl.permission('can edit');}}, 'Can edit')
                ]}),
                m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())]), prop: ctrl.user_name})
                .then(response => {
                    if (response) add_collaboration(m.route.param('studyId'), ctrl.user_name, ctrl.permission)
                        .then(()=>{
                            load();
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_add_collaboration();
                        }).then(m.redraw);
                });
        }
        function do_make_public(is_public){
            messages.confirm({header:'Are you sure?', content:m('p', [m('p', is_public
                                                                                ?
                                                                                'Making the study public will allow everyone to view the files. It will NOT allow others to modify the study or its files.'
                                                                                :
                                                                                'Making the study private will hide its files from everyone but you.'),
                m('span', {class: ctrl.error()? 'alert alert-danger' : ''}, ctrl.error())])})
                .then(response => {
                    if (response) make_pulic(m.route.param('studyId'), is_public)
                        .then(()=>{
                            load();
                        })
                        .catch(error => {
                            ctrl.error(error.message);
                            do_make_public(is_public);
                        }).then(m.redraw);
                });

        }
        load();
        return {ctrl, remove, do_add_collaboration, do_make_public};
    },
    view({ctrl, remove, do_add_collaboration, do_make_public}){
        return  !ctrl.loaded
            ?
            m('.loader')
            :
            m('.container', [
                m('div', ['This study is: ', ctrl.is_public() ? 'public' : 'private', ' ',
                         m('button.btn.btn-secondary', {onclick:function() {do_make_public(!ctrl.is_public());}}, ['make it ', ctrl.is_public() ? 'private' : 'public'])
                ]),
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