import inputWrapper from './inputWrapper';
export default selectInputComponent;

let selectInputComponent = {
	controller({prop, form, required}){
		if (!form) throw new Error('Inputs require a form');

		let validity = () => !required || prop();
		form.register(validity);

		return {validity, showValidation: form.showValidation};
	},
	view: inputWrapper((ctrl, {prop, isFirst = false, help, values = {}}) => {
		return m('.input-group', [
			m('select.c-select', {
				onchange: m.withAttr('value', prop),
				config: (element, isInit) => isFirst && isInit && element.focus()
			}, Object.keys(values).map(key => m('option', {value:key},values[key]))),
			help ? m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', help ) : ''
		]);
	})
};

