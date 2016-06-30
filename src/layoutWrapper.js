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
                isloggedin: false,
                doLogout,
                timer:m.prop(0)
            };

            is_loggedin();

            function is_loggedin(){
                getAuth().then((response) => {
                    ctrl.isloggedin = response.isloggedin;
                    if (!ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code'))
                        m.route('/login');

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
                    // console.log(timer);
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
                logout().then(() => m.route('/login'));
            }
        },
        view(ctrl){
            return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                m('nav.navbar.navbar-dark.navbar-fixed-top', [
                    m('a.navbar-brand', {href:'/dashboard/dashboard'}, 'Dashboard'),
                    m('ul.nav.navbar-nav',[
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/studies', config:m.route},'Studies')
                        ]),
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/pool', config:m.route},'Pool')
                        ]),
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/downloads', config:m.route},'Downloads')
                        ]),
//                      m('li.nav-item',[
//                          m('a.nav-link',{href:'/deploy', config:m.route},'Deploy')
//                      ]),
//                      m('li.nav-item',[
//                          m('a.nav-link',{href:'/studyRemoval', config:m.route}, 'Study Removal')
//                      ]),
//                      m('li.nav-item',[
//                          m('a.nav-link',{href:'/StudyChangeRequest', config:m.route}, 'Study Change Request')
//                      ]),
                        m('li.nav-item', [
                            m('.dropdown', [
                                m('a.nav-link', 'Admin'),
                                m('.dropdown-menu', [
                                    m('a.dropdown-item',{href:'/addUser', config:m.route}, 'Add User')
                                ])
                            ])
                        ]),
                        m('li.nav-item',[
                            m('a.nav-link',{href:'/change_password', config:m.route}, 'Change password')
                        ]),
                        !ctrl.isloggedin ? '' : m('li.nav-item.pull-xs-right',[
                            m('button.btn.btn-info', {onclick:ctrl.doLogout}, [
                                m('i.fa.fa-sign-out'), '  Logout'
                            ])
                        ])
                    ])
                ]),

                m('.main-content.container-fluid', [
                    route
                ]),

                m.component(contextMenu), // register context menu
                m.component(messages), // register modal
                m.component(spinner) // register spinner
            ]);
        }
    };

};
