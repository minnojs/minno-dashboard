import inputWrapper from './inputWrapper';
export default checkboxInputComponent;

let  checkboxInputComponent = {
    controller({prop, form, required}){
        let validity = () => !required || prop();
        form.register(validity);

        return {validity, showValidation: form.showValidation};
    },
    view: inputWrapper((ctrl, {prop, description = ''}, {groupClass, inputClass}) => {
        return m('.checkbox.checkbox-input-group', {class: groupClass}, [
            m('label.c-input.c-checkbox', {class: inputClass}, [
                m('input.form-control', {
                    type: 'checkbox',
                    onclick: m.withAttr('checked', prop),
                    checked: prop()
                }),
                m('span.c-indicator'),
                m.trust('&nbsp;'),
                description
            ])
        ]);
    })
};
