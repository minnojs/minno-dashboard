export let body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        m('h4', 'Select new password'),
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
        ctrl.error() ? m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()) : '',
        m('button.btn.btn-primary.btn-block', {onclick: ctrl.set_password},'Update')

    ])
]);

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}