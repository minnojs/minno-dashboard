import {send} from './massMailModel';
import fullHeight from 'utils/fullHeight';
export default massMailComponent;

let massMailComponent = {
    controller(){
        const subject = m.prop('');
        const body = m.prop('');
        const ru = m.prop(false);
        const su = m.prop(false);
        const cu = m.prop(false);
        const ctrl = {
            subject,
            body,
            ru,
            su,
            cu,
            error: m.prop(''),
            sent:false,
            send: sendAction
        };
        return ctrl;

        function sendAction(){
            send(subject, body , ru, su, cu)
                .then(() => {
                    ctrl.sent = true;
                    m.redraw();
                })
                .catch(response => {
                    ctrl.error(response.message);
                    m.redraw();
                });
        }
    },
    view(ctrl){
        return m('.add.centrify', {config:fullHeight},[
            ctrl.sent
                ?
                [
                    m('i.fa.fa-thumbs-up.fa-5x.m-b-1'),
                    m('h5', 'Mail successfully sent!')
                ]
                :
                m('.card.card-inverse.col-md-4', [
                    m('.card-block',[
                        m('h4', 'Please fill the following details'),
                        m('form', {onsubmit:ctrl.send}, [
                            m('fieldset.form-group',
                                m('input.form-control', {
                                    type:'Subject',
                                    placeholder: 'Subject',
                                    value: ctrl.subject(),
                                    oninput: m.withAttr('value', ctrl.subject),
                                    onchange: m.withAttr('value', ctrl.subject),
                                    config: getStartValue(ctrl.subject)
                                }
                            )),
                            m('fieldset.form-group',
                                m('textarea.form-control', {
                                    type:'Body',
                                    placeholder: 'Body',
                                    value: ctrl.body(),
                                    oninput: m.withAttr('value', ctrl.body),
                                    onchange: m.withAttr('value', ctrl.body),
                                    config: getStartValue(ctrl.body)
                                }
                            )),
                            m('fieldset.form-group',

                                m('label.c-input.c-checkbox', [
                                    m('input.form-control', {
                                        type: 'checkbox',
                                        onclick: m.withAttr('checked', ctrl.ru)}),
                                    m('span.c-indicator'),
                                    m.trust('&nbsp;'),
                                    m('span', 'Regular users')
                                ]),
                                m('label.c-input.c-checkbox', [
                                    m('input.form-control', {
                                        type: 'checkbox',
                                        onclick: m.withAttr('checked', ctrl.su)}),
                                    m('span.c-indicator'),
                                    m.trust('&nbsp;'),
                                    m('span', 'Super users')
                                ]),
                                m('label.c-input.c-checkbox', [
                                    m('input.form-control', {
                                        type: 'checkbox',
                                        onclick: m.withAttr('checked', ctrl.cu)}),
                                    m('span.c-indicator'),
                                    m.trust('&nbsp;'),
                                    m('span', 'Contract users')
                                ])

                            )
                        ]),

                        !ctrl.error() ? '' : m('.alert.alert-warning', m('strong', 'Error: '), ctrl.error()),
                        m('button.btn.btn-primary.btn-block', {onclick: ctrl.send},'Send')
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
