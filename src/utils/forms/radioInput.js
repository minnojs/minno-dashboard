import inputWrapper from './inputWrapper';
export default selectInputComponent;

let selectInputComponent = {
    controller({prop, form, required}){
        if (!form) throw new Error('Inputs require a form');

        let validity = () => !required || prop();
        form.register(validity);

        return {validity, showValidation: form.showValidation};
    },
    view: inputWrapper((ctrl, {prop, values = {}}) => {
        const keys = Object.keys(values);
        if (keys.length === 1)
            prop(values[keys[0]]);
        return m('.c-inputs-stacked', keys
            .map(key => m('label.c-input.c-radio', [
                m('input', {type:'radio', checked: values[key] === prop(), onchange: prop.bind(null, values[key])}),
                m('span.c-indicator'),
                key
            ])));
    })
};

