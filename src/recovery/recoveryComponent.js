import {recovery} from './recoveryModel';
import fullHeight from 'utils/fullHeight';
export default recoveryComponent;

let recoveryComponent = {
    controller(){
        const ctrl = {
            username: m.prop(''),
            error: m.prop(''),
            recoveryAction
        };
        return ctrl;

        function recoveryAction(){
            recovery(ctrl.username)
                .catch(response => {
                    ctrl.error(response.message);
                })
                .then(m.redraw);
        }
    },
    view(ctrl){
        return  m('.recovery.centrify', {config:fullHeight},[
            m('.card.card-inverse.col-md-4', [
                m('.card-block',[
                    m('h4', 'Password Reset Request'),
                    m('p', 'Enter your username or your email address in the space below and we will mail you the password reset instructions'),

                    m('form', {onsubmit:ctrl.recoveryAction}, [
                        m('input.form-control', {
                            type:'username',
                            placeholder: 'Username / Email',
                            value: ctrl.username(),
                            oninput: m.withAttr('value', ctrl.username),
                            onchange: m.withAttr('value', ctrl.username),
                            config: getStartValue(ctrl.username)
                        })
                    ]),

                    !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                    m('button.btn.btn-primary.btn-block', {onclick: ctrl.recovery},'Request')
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
