import classNames from 'utils/classNames';
import messages from 'utils/messagesComponent';
export default editMessage;

/**
 * Create edit component
 * Promise editMessage({input:Object, output:Prop})
 */
let editMessage = args => messages.custom({
    content: m.component(editComponent, Object.assign({close:messages.close}, args)),
    wide: true
});

let editComponent = {
    controller({input, output, close}){
        let study = ['rulesUrl', 'targetCompletions', 'autopauseUrl', 'userEmail'].reduce((study, prop)=>{
            study[prop] = m.prop(input[prop] || '');
            return study;
        }, {});

        // export study to calling component
        output(study);


        let ctrl = {
            study,
            submitAttempt: false,
            validity(){
                let isEmail = str  => /\S+@\S+\.\S+/.test(str);
                let isNormalInteger = str => /^\+?(0|[1-9]\d*)$/.test(str);

                let response = {
                    rulesUrl: study.rulesUrl(),
                    targetCompletions: isNormalInteger(study.targetCompletions()),
                    autopauseUrl: study.autopauseUrl(),
                    userEmail: isEmail(study.userEmail())

                };
                return response;
            },
            ok(){
                ctrl.submitAttempt = true;
                let response = ctrl.validity();
                let isValid = Object.keys(response).every(key => response[key]);

                if (isValid) {
                    study.targetCompletions(+study.targetCompletions());// targetCompletions should be cast as a number
                    close(true);
                }
            },
            cancel() {
                close(null);
            }
        };

        return ctrl;
    },
    view(ctrl, {input}){
        let study = ctrl.study;
        let validity = ctrl.validity();
        let miniButtonView = (prop, name, url) => m('button.btn.btn-secondary.btn-sm', {onclick: prop.bind(null,url)}, name);
        let validationView = (isValid, message) => isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message);
        let groupClasses = valid => !ctrl.submitAttempt ? '' : classNames({
            'has-danger': !valid,
            'has-success' : valid
        });
        let inputClasses = valid => !ctrl.submitAttempt ? '' : classNames({
            'form-control-danger': !valid,
            'form-control-success': valid
        });

        return m('div',[
            m('h4', 'Study Editor'),
            m('.card-block', [
                m('.form-group', [
                    m('label', 'Study ID'),
                    m('p',[
                        m('strong.form-control-static', input.studyId)
                    ])

                ]),
                m('.form-group', [
                    m('label', 'Study URL'),
                    m('p',[
                        m('strong.form-control-static', input.studyUrl)
                    ])
                ]),

                m('.form-group', {class:groupClasses(validity.rulesUrl)}, [
                    m('label', 'Rules File URL'),
                    m('input.form-control', {
                        config: focusConfig,
                        placeholder:'Rules file URL',
                        value: study.rulesUrl(),
                        oninput: m.withAttr('value', study.rulesUrl),
                        class:inputClasses(validity.rulesUrl)
                    }),
                    m('p.text-muted.btn-toolbar', [
                        miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml'),
						miniButtonView(study.rulesUrl, 'Priority20', '/research/library/rules/Priority20.xml'),
						miniButtonView(study.rulesUrl, 'Priority14', '/research/library/rules/Priority14.xml'),
						miniButtonView(study.rulesUrl, 'Priority8', '/research/library/rules/Priority8.xml')
                    ]),
                    validationView(validity.rulesUrl, 'This row is required')
                ]),
                m('.form-group', {class:groupClasses(validity.autopauseUrl)}, [
                    m('label', 'Auto-pause file URL'),
                    m('input.form-control', {
                        placeholder:'Auto pause file URL',
                        value: study.autopauseUrl(),
                        oninput: m.withAttr('value', study.autopauseUrl),
                        class:inputClasses(validity.autopauseUrl)
                    }),
                    m('p.text-muted.btn-toolbar', [
                        miniButtonView(study.autopauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'),
                        miniButtonView(study.autopauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'),
                        miniButtonView(study.autopauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')
                    ]),
                    validationView(validity.autopauseUrl, 'This row is required')
                ]),
                m('.form-group', {class:groupClasses(validity.targetCompletions)}, [
                    m('label','Target number of sessions'),
                    m('input.form-control', {
                        type:'number',
                        placeholder:'Target Sessions',
                        value: study.targetCompletions(),
                        oninput: m.withAttr('value', study.targetCompletions),
                        onclick: m.withAttr('value', study.targetCompletions),
                        class:inputClasses(validity.targetCompletions)
                    }),
                    validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')
                ]),
                m('.form-group', {class:groupClasses(validity.userEmail)}, [
                    m('label','User Email'),
                    m('input.form-control', {
                        type:'email',
                        placeholder:'Email',
                        value: study.userEmail(),
                        oninput: m.withAttr('value', study.userEmail),
                        class:inputClasses(validity.userEmail)
                    }),
                    validationView(validity.userEmail, 'This row is required and must be a valid Email')
                ])
            ]),
            m('.text-xs-right.btn-toolbar',[
                m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
                m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
            ])
        ]);
    }
};

let focusConfig = (element, isInitialized) => {
    if (!isInitialized) element.focus();
};
