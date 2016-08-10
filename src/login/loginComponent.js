import {login, getAuth} from './authModel';
import fullHeight from 'utils/fullHeight';
export default loginComponent;

let loginComponent = {
    controller(){
        const ctrl = {
            username:m.prop(''),
            password:m.prop(''),
            isloggedin: false,
            loginAction,
            error: m.prop('')
        };

        is_loggedin();

        return ctrl;

        function loginAction(){
            login(ctrl.username, ctrl.password)
                .then(() => {
                    m.route('/');
                })
                .catch(response => {
                    ctrl.error(response.message);
                    m.redraw();
                })
            ;
        }

        function is_loggedin(){
            getAuth().then((response) => {
                ctrl.isloggedin = response.isloggedin;
                m.redraw();
            });
        }
    },
    view(ctrl){
        return m('.login.centrify', {config:fullHeight},[
            ctrl.isloggedin
            ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'You are already logged in!')
                ]
                :
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Please sign in'),

                        m('form', {onsubmit:ctrl.login}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'Username / Email',
                                value: ctrl.username(),
                                oninput: m.withAttr('value', ctrl.username),
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue(ctrl.username)
                            }),
                            m('input.form-control', {
                                type:'password',
                                placeholder: 'Password',
                                value: ctrl.password(),
                                oninput: m.withAttr('value', ctrl.password),
                                onchange: m.withAttr('value', ctrl.password),
                                config: getStartValue(ctrl.password)
                            })
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.loginAction},'Sign in'),
                        m('p.text-center',
                            m('small.text-muted',  m('a', {href:'index.html?/recovery'}, 'Lost your password?'))
                        )
                    ])
                ])
        ]);
    }
};

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}
