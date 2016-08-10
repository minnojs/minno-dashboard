import inputWrapper from './inputWrapper';
export default textInputComponent;

let textInputComponent  = {
    controller({prop, form, required = false}) {
        let validity = () => !required || prop().length;
        form.register(validity);

        return {validity};
    },

    view: inputWrapper((ctrl, {prop, isArea = false, isFirst = false, placeholder = '', help, rows = 3}, {inputClass}) => {
        return !isArea
            ? m('input.form-control', {
                class: inputClass,
                placeholder: placeholder,
                value: prop(),
                oninput: m.withAttr('value', prop),
                config: (element, isInit) => isFirst && isInit && element.focus()
            })
            : m('textarea.form-control', {
                class: inputClass,
                placeholder: placeholder,
                oninput: m.withAttr('value', prop),
                rows,
                config: (element, isInit) => isFirst && isInit && element.focus()
            } , [prop()]);
    })
};
