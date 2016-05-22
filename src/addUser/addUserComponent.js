import {add} from './addUserModel';
import fullHeight from 'utils/fullHeight';
export default addComponent;

let addComponent = {
    controller(){
        const username = m.prop('');
        const first_name = m.prop('');
        const last_name = m.prop('');
        const email = m.prop('');
        const iscu = m.prop(false);
        const ctrl = {
            username,
            first_name,
            last_name,
            email,
            iscu,
            error: m.prop(''),
            added:false,
            add: addAction
        };
        return ctrl;

        function addAction(){
            add(username, first_name , last_name, email, iscu)
                .then(() => {
                    ctrl.added = true;
                })
                .catch(response => {
                    ctrl.error(response.message);
                    m.redraw();
                })
                .then(() => {
                    m.redraw();
                });
        }
    },
    view(ctrl){
        return m('.add.centrify', {config:fullHeight},[
            ctrl.added
                ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', [ctrl.username(), ' successfully added (email sent)!'])
                ]
                :
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Please fill the following details'),
                        m('form', {onsubmit:ctrl.add}, [
                            m('input.form-control', {
                                type:'username',
                                placeholder: 'User name',
                                value: ctrl.username(),
                                onkeyup: m.withAttr('value', ctrl.username),
                                onchange: m.withAttr('value', ctrl.username),
                                config: getStartValue(ctrl.username)
                            }),
                            m('input.form-control', {
                                type:'first_name',
                                placeholder: 'first name',
                                value: ctrl.first_name(),
                                onkeyup: m.withAttr('value', ctrl.first_name),
                                onchange: m.withAttr('value', ctrl.first_name),
                                config: getStartValue(ctrl.first_name)
                            }),
                            m('input.form-control', {
                                type:'last_name',
                                placeholder: 'last name',
                                value: ctrl.last_name(),
                                onkeyup: m.withAttr('value', ctrl.last_name),
                                onchange: m.withAttr('value', ctrl.last_name),
                                config: getStartValue(ctrl.last_name)
                            }),
                            m('input.form-control', {
                                type:'email',
                                placeholder: 'email',
                                value: ctrl.email(),
                                onkeyup: m.withAttr('value', ctrl.email),
                                onchange: m.withAttr('value', ctrl.email),
                                config: getStartValue(ctrl.email)
                            }),
                            m('label.c-input.c-checkbox', [
                                m('input.form-control', {
                                    type: 'checkbox',
                                    onclick: m.withAttr('checked', ctrl.iscu)}),
                                m('span.c-indicator'),
                                m.trust('&nbsp;'),
                                m('span', 'contract user')
                            ])
                        ]),

                        ctrl.error() ? m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()) : '',
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.add},'Add')
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
