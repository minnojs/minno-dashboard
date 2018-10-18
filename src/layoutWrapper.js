import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import spinner from 'utils/spinnerComponent';
import {getAuth, logout} from 'login/authModel';

export default layout;

let timer = 0;
let countdown = 0;
let role = '';
let isloggedin = true;

let layout = route => {
    return {
        controller(){
            const ctrl = {
                isloggedin: isloggedin,
                role: m.prop(role),
                present_templates: m.prop(false),
                doLogout,
                timer:m.prop(0)
            };
            is_loggedin();
            function is_loggedin(){
                getAuth().then((response) => {
                    role = ctrl.role(response.role);
                    isloggedin = ctrl.isloggedin = response.isloggedin;
                    ctrl.present_templates(response.present_templates);
                    let is_view = (m.route() == `/view/${m.route.param('code')}` || m.route() == `/view/${m.route.param('code')}/${m.route.param('resource')}/${encodeURIComponent(m.route.param('fileId'))}`);

                    if(ctrl.role()=='ro' && !is_view)
                        return doLogout();
                    if (!is_view &&  !ctrl.isloggedin  && m.route() !== '/login' && m.route() !== '/recovery' && m.route() !== '/activation/'+ m.route.param('code') && m.route() !== '/change_password/'+ m.route.param('code')  && m.route() !== '/reset_password/'+ m.route.param('code')){
                        // doLogout();
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

            const settings = {
                'studies':[],
                // 'data':['downloads', 'downloadsAccess', 'statistics'],
                // 'pool':[],
                'tags':[]
                ,'admin':[/*'deployList', 'removalList', 'changeRequestList', */'addUser', 'users'/*, 'massMail'*/]
            };


            const settings_hash = {
                'studies':{text: 'Studies', href:'/studies', sub:[]},
                'data':{text: 'Data', href:false,
                    subs: {
                        'downloads': {text: 'downloads', href: '/downloads'},
                        'downloadsAccess': {text: 'Downloads Access', href: '/downloadsAccess'},
                        'statistics': {text: 'Statistics', href: '/statistics'}
                    }},
                'pool':{text: 'Pool', href:'/pool', sub:[]},
                'tags':{text: 'Tags', href:'/tags', sub:[]},
                'admin':{text: 'Admin', href:false,
                    su:true,
                    subs:{'deployList': {text:'Deploy List', href: '/deployList'},
                          'removalList': {text:'Removal List', href:'/removalList'},
                          'changeRequestList': {text:'Change Request List', href: '/changeRequestList'},
                          'addUser': {text:'Add User', href: '/addUser'},
                          'massMail': {text:'Send MassMail', href: '/massMail'},
                          'users': {text:'Users Management', href: '/users'}
                    }}

            };


            return  m('.dashboard-root', {class: window.top!=window.self ? 'is-iframe' : ''}, [
                !ctrl.isloggedin || ctrl.role()=='ro'
                ?
                ''
                :
                m('nav.navbar.navbar-dark', [
                    m('a.navbar-brand', {href:'', config:m.route}, 'Dashboard'),
                    m('ul.nav.navbar-nav',[

                        Object.keys(settings).map(comp=>
                            settings_hash[comp].su && ctrl.role() !=='su' ? '' :
                            settings[comp].length==0 ?
                                m('li.nav-item',[
                                    m('a.nav-link',{href:settings_hash[comp].href, config:m.route}, settings_hash[comp].text)

                                ])
                                :
                                m('li.nav-item', [
                                    m('.dropdown', [
                                        m('a.nav-link', settings_hash[comp].text),
                                        m('.dropdown-menu', [
                                            settings[comp].map(sub_comp=>
                                                m('a.dropdown-item',{href:settings_hash[comp].subs[sub_comp].href, config:m.route}, settings_hash[comp].subs[sub_comp].text)
                                            )

                                        ])
                                    ])
                                ])
                        ),
                        // m('li.nav-item.pull-xs-right', [
                        //     m('a.nav-link',{href:'/messages', config:m.route},m('i.fa.fa-envelope.fa-lg'))
                        // ]),


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
