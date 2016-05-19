import inputWrapper from './inputWrapper';
export default checkboxInputComponent;

let  checkboxInputComponent = {
	controller({prop, form, required}){
		if (!form) throw new Error('Inputs require a form');
		
		let validity = () => !required || prop();
		form.register(validity);

		return {validity, showValidation: form.showValidation};
	},
	view: inputWrapper((ctrl, {prop, description = ''}) => {
		return m('div', [
			m('label.c-input.c-checkbox', [
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
	},{isFormControl:false})
};
