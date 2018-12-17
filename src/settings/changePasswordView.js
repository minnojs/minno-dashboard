export let password_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        m('form', [
            m('label', 'Password:'),
            m('input.form-control', {
                type:'password',
                placeholder: 'Password',
                value: ctrl.password(),
                oninput: m.withAttr('value', ctrl.password),
                onchange: m.withAttr('value', ctrl.password),
                config: getStartValue(ctrl.password)
            }),
            m('label.space', 'Confirm password:'),
            m('input.form-control', {
                type:'password',
                placeholder: 'Confirm password',
                value: ctrl.confirm(),
                oninput: m.withAttr('value', ctrl.confirm),
                onchange: m.withAttr('value', ctrl.confirm),
                config: getStartValue(ctrl.confirm)
            })
        ]),
        !ctrl.password_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.password_error()),
        ctrl.external() ? '' : m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_password},'Update')
    ])
]);

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}