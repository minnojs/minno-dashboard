import {get_users, remove_user, update_role} from './usersModel';
import messages from 'utils/messagesComponent';
import dropdown from 'utils/dropdown';
import {draw_menu} from "../study/studyMenu";

export default usersComponent;

let usersComponent = {
    controller(){
        let ctrl = {
            users:m.prop(),
            loaded:false,
            col_error:m.prop(''),
            remove,
            update};
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
                            // m('td', user.role === 'su'
                            //     ?
                            //
                            //
                            //     [m('strong', 'su '), m('button.btn.btn-secondary', {onclick:()=>ctrl.update(user.id, 'u')}, 'u')]
                            //     :
                            //     [m('button.btn.btn-secondary', {onclick:()=>ctrl.update(user.id, 'su')}, 'su'), m('strong', ' u')]),
                            m('td', m('button.btn.btn-danger', {onclick:()=>ctrl.remove(user.id)}, 'Remove'))
                        ]))
                    ]),
                ])
            ]);
    }
};

