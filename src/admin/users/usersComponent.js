import {get_users, remove_user, update_role, change_user_password} from './usersModel';

import messages from 'utils/messagesComponent';
import {copyUrlContent} from 'utils/copyUrl';

import addComponent from '../../addUser/addUserComponent';


export default usersComponent;

let usersComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            loaded:false,
            col_error:m.prop(''),
            password:m.prop(''),
            remove,
            update,
            change_password,
            add_user};
        function load() {
            get_users()
                .then(response =>ctrl.users(response.users))
                .then(()=>ctrl.loaded = true)
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);

        }

        function add_user(){
            messages.alert({okText: 'Close', header:'Add a new user', content:addComponent

                    })
                .then(()=>load()).then(m.redraw);
        }


        function remove(user_id){
            messages.confirm({header:'Delete user', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_user(user_id)
                            .then(()=> load())
                            .catch(error => {
                                ctrl.col_error(error.message);
                            })
                            .then(m.redraw);
                });
        }

        function change_password(reset_code, user_name){
            messages.confirm({
                header:`Url for reset ${user_name}'s password`,
                content: copyUrlContent(reset_code)()
            })
        }

        function update(user_id, role){
            update_role(user_id, role)
                .then(()=> {
                    load();
                })
                .then(m.redraw);
        }

        load();
        return ctrl;
    },
    view(ctrl){
        return  !ctrl.loaded
            ?
            m('.loader')
            :
                m('.container.sharing-page', [
                    m('.row',[
                        m('.col-sm-10', [
                            m('h3', 'User Management')
                        ]),
                        m('.col-sm-2', [
                            m('button.btn.btn-success.btn-sm.m-r-1', {onclick:ctrl.add_user}, [
                                m('i.fa.fa-user-plus'), '  Add a new user'
                            ])
                        ])
                    ]),
                    m('table', {class:'table table-striped table-hover'}, [
                    m('thead', [
                        m('tr', [
                            m('th', 'User name'),
                            m('th',  'First name'),
                            m('th',  'Last name'),
                            m('th',  'Email'),
                            m('th',  'Role'),
                            ctrl.users().filter(user=> !!user.reset_code).length>0 ? m('th',  'Reset password') : '',
                            m('th',  'Remove')
                        ])
                    ]),
                    m('tbody', [
                        ctrl.users().map(user => m('tr', [
                            m('td', user.user_name),
                            m('td', user.first_name),
                            m('td', user.last_name),
                            m('td', user.email),
                            m('td',
                                m('select.form-control', {value:user.role, onchange : function(){ ctrl.update(user.id, this.value); }}, [
                                    m('option',{value:'u', selected: user.role !== 'su'},  'Simple user'),
                                    m('option',{value:'su', selected: user.role === 'su'}, 'Super user')
                                ])
                            ),
                            ctrl.users().filter(user=> !!user.reset_code).length==0 ? '' :
                                !user.reset_code ? m('td', '') : m('td', m('button.btn.btn-secondery', {onclick:()=>ctrl.change_password(user.reset_code, user.user_name)}, 'Reset password'))
                            ,

                            m('td', m('button.btn.btn-danger', {onclick:()=>ctrl.remove(user.id)}, 'Remove'))
                        ]))
                    ]),
                ])
            ]);
    }
};

