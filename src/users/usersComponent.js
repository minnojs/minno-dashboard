import {get_users, remove_user, update_role, change_user_password} from './usersModel';

import messages from 'utils/messagesComponent';
import dropdown from 'utils/dropdown';
import {draw_menu} from "../study/studyMenu";
import {rename_study} from "../study/studyModel";

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
            change_password};
        function load() {
            get_users()
                .then(response =>ctrl.users(response.users))
                .then(()=>ctrl.loaded = true)
                .catch(error => {
                    ctrl.col_error(error.message);
                }).then(m.redraw);

        }
        function remove(user_id){
            messages.confirm({header:'Delete user', content:'Are you sure?'})
                .then(response => {
                    if (response)
                        remove_user(user_id)
                            .then(()=> {
                                load();
                            })
                            .catch(error => {
                                ctrl.col_error(error.message);
                            })
                            .then(m.redraw);
                });
        }



        function change_password(user_id, user_name){
            let error = m.prop('');
            let ask = () => messages.confirm({
                header:'Change password for user',
                content: {
                    view(){
                        return m('div', [
                            m('p', `Enter new password for ${user_name}`),
                            m('input.form-control',  {placeholder: 'Enter new password', value: ctrl.password(), onchange: m.withAttr('value', ctrl.password)}),
                            !error() ? '' : m('p.alert.alert-danger', error())
                        ]);
                    }
                }
            }).then(response => response && change_pass());

            let change_pass = () => change_user_password(user_id, ctrl.password())
                .catch(e => {
                    error(e.message);
                    ask();
                }).then(m.redraw);

            ask();
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
                m('table', {class:'table table-striped table-hover'}, [
                    m('thead', [
                        m('tr', [
                            m('th', 'User name'),
                            m('th',  'First name'),
                            m('th',  'Last name'),
                            m('th',  'Email'),
                            m('th',  'Role'),
                            ctrl.users().filter(user=> !!user.reset_code).length>0 ? m('th',  'boom') : '',
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
                                m('select.form-control', {value:user.role, onchange : function(){ ctrl.update(user.id, this.value) }}, [
                                    m('option',{value:'u', selected: user.role !== 'su'},  'Simple user'),
                                    m('option',{value:'su', selected: user.role === 'su'}, 'Super user')
                                ])
                            ),
                            ctrl.users().filter(user=> !!user.reset_code).length==0 ? '' :
                                !user.reset_code ? m('td', '') : m('td', m('button.btn.btn-secondery', {onclick:()=>ctrl.change_password(user.id, user.user_name)}, 'Reset password'))
                            ,

                            m('td', m('button.btn.btn-danger', {onclick:()=>ctrl.remove(user.id)}, 'Remove'))
                        ]))
                    ]),
                ])
            ]);
    }
};

