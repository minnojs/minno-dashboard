import inputWrapper from './inputWrapper';
export default textInputComponent;

let textInputComponent  = {
	controller({prop, form, required = false}) {
		if (!form) throw new Error('Text input requires a form');
		
		let validity = () => !required || prop().length;
		form.register(validity);

		return {validity, showValidation: form.showValidation};
	},

	view: inputWrapper((ctrl, {prop, isArea = false, isFirst = false, placeholder = '', help, rows = 3}, {inputClass}) => {
		return !isArea
			? m('input.form-control', {
				class: inputClass,
				placeholder: placeholder,
				value: prop(),
				onkeyup: m.withAttr('value', prop),
				config: (element, isInit) => isFirst && isInit && element.focus()
			})
			: m('textarea.form-control', {
				class: inputClass,
				placeholder: placeholder,
				onkeyup: m.withAttr('value', prop),
				rows,
				config: (element, isInit) => isFirst && isInit && element.focus()
			} , [prop()]);
	})
};