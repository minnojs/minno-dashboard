import inputWrapper from './inputWrapper';
export default maybeInputComponent;

let  maybeInputComponent = {
	controller({prop, form, required}){
		if (!form) throw new Error('Inputs require a form');

		let text = m.prop(typeof prop() == 'boolean' ? '' : prop());
		let checked = m.prop(typeof prop() == 'string' ? true : prop()); 
		let validity = () => !required || prop();
		form.register(validity);

		return {validity, showValidation: form.showValidation,
			text: function(value){
				if (arguments.length){
					text(value);
					prop(value || true);
				}
				return text();
			},
			checked: function(value){
				if (arguments.length) {
					checked(value);
					if (checked() && text()) prop(text());
					else prop(checked());
				}
				return checked();
			}	
		};
	},
	view: inputWrapper(({text, checked}, args) => {
		let placeholder = args.placeholder || '';
		return m('.input-group', [
			m('span.input-group-addon', [
				m('input', {
					type:'checkbox',
					onclick: m.withAttr('checked', checked),
					checked: checked()
				})
			]),
			m('input.form-control', {
				placeholder: placeholder,
				value: text(),
				onkeyup: m.withAttr('value', text),
				disabled: !checked()
			})
		]);
	})
};
