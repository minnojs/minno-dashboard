import {recovery} from './recoveryModel';
import fullHeight from 'utils/fullHeight';
export default recoveryComponent;

let recoveryComponent = {
    controller(){
        const ctrl = {
            sent:false,
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
                .then(()=>{ctrl.sent = true; m.redraw();});
        }
    },
    view(ctrl){
        return  m('.recovery.centrify', {config:fullHeight},[
            ctrl.sent
                ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'Recovery request successfully sent!')
                ]
                :
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
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.recoveryAction},'Request')
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
