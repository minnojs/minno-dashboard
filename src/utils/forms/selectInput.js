import inputWrapper from './inputWrapper';
export default selectInputComponent;

let selectInputComponent = {
    controller({prop, form, required}){
        if (!form) throw new Error('Inputs require a form');

        let validity = () => !required || prop();
        form.register(validity);

        return {validity, showValidation: form.showValidation};
    },
    view: inputWrapper((ctrl, {prop, isFirst = false, values = {}}, {inputClass}) => {
        const value = prop();
        return m('.input-group', [
            m('select.c-select.form-control', {
                class: inputClass, 
                onchange: e => prop(values[e.target.value]),
                config: (element, isInit) => isFirst && isInit && element.focus()
            }, Object.keys(values).map(key => m('option', {selected:value === values[key]}, key)))
        ]);
    })
};

