import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import spinner from 'utils/spinnerComponent';
import {getAuth, logout} from 'login/authModel';

export default layout;

let timer = 0;
let countdown = 0;

let layout = route => {
    return {
        controller(){
            const ctrl = {
                isloggedin: true,
                role: m.prop(''),
                doLogout,
                timer:m.prop(0)
            };
            is_loggedin();
            function is_loggedin(){
                getAuth().then((response) => {
                    ctrl.role(response.role);
                    ctrl.isloggedin = response.isloggedin;

                    if (!ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code')  && m.route() !== '/reset_password/'+ m.route.param('code')){
                        let url = m.route();
                        m.route('/login');
                        location.hash = encodeURIComponent(url);
                    }
                    if(ctrl.role()=='CU' && m.route() == '/studies')
                        m.route('/downloads');


                    timer = response.timeoutInSeconds;
                    run_countdown();
                    m.redraw();
                });
            }

            function run_countdown(){
                clearInterval(countdown);
                countdown = setInterval(function () {
                    if(timer<=0)
                        return;
                    if(timer<10) {
                        messages.close();
                        doLogout();
                    }
                    if(timer==70)
                        messages.confirm({header:'Timeout Warning', content:'The session is about to expire. Do you want to keep working?',okText:'Yes, stay signed-in', cancelText:'No, sign out'})
                            .then(response => {
                                if (!response)
                                    return doLogout();
                                return is_loggedin();
                            });
                    timer--;
                }, 1000);
            }
            return ctrl;

            function doLogout(){
                clearInterval(countdown);
                logout().then(() =>{
                    let url = m.route();
                    m.route('/login');
                    location.hash = encodeURIComponent(url);
                });
            }
        },
        view(ctrl){
            return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                m.route()=='/login' || m.route() == '/recovery' || m.route() == '/activation/'+ m.route.param('code')
                ?
                ''
                :
                m('nav.navbar.navbar-dark', [
                    m('a.navbar-brand', {href:'', config:m.route}, 'Dashboard'),
                    m('ul.nav.navbar-nav',[
                        ctrl.role()=='CU'
                         ?
                        ''
                        :
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/studies', config:m.route},'Studies')
                        ]),
                        ctrl.role()=='CU'
                        ?
                        ''
                        :
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/template_studies', config:m.route},'Template Studies')

                        ]),
                        m('li.nav-item', [
                            m('.dropdown', [
                                m('a.nav-link', 'Data'),
                                m('.dropdown-menu', [
                                    m('a.dropdown-item',{href:'/downloads', config:m.route}, 'Downloads'),
                                    m('a.dropdown-item',{href:'/downloadsAccess', config:m.route}, 'Downloads access'),
                                    m('a.dropdown-item',{href:'/studies/statistics', config:m.route}, 'Statistics')
                                ])
                            ])
                        ]),
                        ctrl.role()=='CU'
                        ?
                        ''
                        :
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/pool', config:m.route},'Pool')
                        ]),
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/tags', config:m.route},'Tags')
                        ]),
                        ctrl.role()!='SU'
                        ?
                        ''
                        :
                        m('li.nav-item', [
                            m('.dropdown', [
                                m('a.nav-link', 'Admin'),
                                m('.dropdown-menu', [
                                    m('a.dropdown-item',{href:'/deployList', config:m.route}, 'Deploy List'),
                                    m('a.dropdown-item',{href:'/removalList', config:m.route}, 'Removal List'),
                                    m('a.dropdown-item',{href:'/changeRequestList', config:m.route}, 'Change Request List'),
                                    m('a.dropdown-item',{href:'/addUser', config:m.route}, 'Add User'),
                                    m('a.dropdown-item',{href:'/massMail', config:m.route}, 'Send MassMail')
                                ])
                            ])
                        ]),
                        m('li.nav-item.pull-xs-right', [
                            m('a.nav-link',{href:'/settings', config:m.route},m('i.fa.fa-cog.fa-lg'))
                        ]),
                        !ctrl.isloggedin ? '' : m('li.nav-item.pull-xs-right',[
                            m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
                                m('i.fa.fa-sign-out'), '  Logout'
                            ])
                        ])
                    ])
                ]),

                m('.main-content.container-fluid', [
                    route,

                    m.component(contextMenu), // register context menu
                    m.component(messages), // register modal
                    m.component(spinner) // register spinner
                ])

            ]);
        }
    };

};
