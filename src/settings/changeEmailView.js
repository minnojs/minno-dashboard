export let emil_body = ctrl => m('.card.card-inverse.col-md-4', [
    m('.card-block',[
        m('form', [
            m('label', 'Email Address:'),
            m('input.form-control', {
                type:'email',
                placeholder: 'Email Address',
                value: ctrl.email(),
                oninput: m.withAttr('value', ctrl.email),
                onchange: m.withAttr('value', ctrl.email),
                config: getStartValue(ctrl.email)
            })
        ])
        ,
        !ctrl.email_error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.email_error()),
        ctrl.external() ? '' : m('button.btn.btn-primary.btn-block', {onclick: ctrl.do_set_email},'Update')

    ])

]);

function getStartValue(prop){
    return (element, isInit) => {// !isInit && prop(element.value);
        if (!isInit) setTimeout(()=>prop(element.value), 30);
    };
}
