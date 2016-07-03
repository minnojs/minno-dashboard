export let password_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        m('h4', 'Enter New Password'),
        m('form', [
            m('input.form-control', {
                type:'password',
                placeholder: 'Password',
                value: ctrl.password(),
                onkeyup: m.withAttr('value', ctrl.password),
                onchange: m.withAttr('value', ctrl.password),
                config: getStartValue(ctrl.password)
            }),

            m('input.form-control', {
                type:'password',
                placeholder: 'Confirm password',
                value: ctrl.confirm(),
                onkeyup: m.withAttr('value', ctrl.confirm),
                onchange: m.withAttr('value', ctrl.confirm),
                config: getStartValue(ctrl.confirm)
            })
        ]),
        ctrl.password_error() ? m('.alert.alert-warning', m('strong', 'Error: '), ctrl.password_error()) : '',
        m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_password},'Update')
    ])
]);

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}