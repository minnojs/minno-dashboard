export function formFactory(){
	let validationHash = [];
	return {
		register(fn){
			validationHash.push(fn);
		},
		isValid() {
			return validationHash.every(fn => fn.call());
		},
		showValidation: m.prop(false)
	};
}

let viewWrapper = (view,opts={}) => (ctrl, args) => {
	let isValid = !ctrl.validity || ctrl.validity();
	let groupClass;
	let inputClass;
	let {isFormControl = true} = opts;

	if (ctrl.showValidation && ctrl.showValidation() && !isValid){
		groupClass = isValid ? 'has-success' : 'has-danger';
		inputClass = isValid ? 'form-controll-success' : 'form-control-error';
	}

	return m('.form-group.row', {class: groupClass}, [
		m('label.col-sm-2', {class: isFormControl ? 'form-control-label' : ''}, args.label),
		m('.col-sm-10', [
			view(ctrl, args, {inputClass})
		]),
		args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help )
	]);
};

export let textInput = args => m.component(textInputComponent, args);
let textInputComponent  = {
	controller({prop, form, required = false}) {
		if (!form) throw new Error('Text input requires a form');
		
		let validity = () => !required || prop().length;
		form.register(validity);

		return {validity, showValidation: form.showValidation};
	},

	view: viewWrapper((ctrl, {prop, isArea = false, isFirst = false, placeholder = '', help, rows = 3}, {inputClass}) => {
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

export let checkboxInput = args => m.component(checkboxInputComponent, args);
let  checkboxInputComponent = {
	controller({prop, form, required}){
		if (!form) throw new Error('Inputs require a form');
		
		let validity = () => !required || prop();
		form.register(validity);

		return {validity, showValidation: form.showValidation};
	},
	view: viewWrapper((ctrl, {prop, description = ''}) => {
		return m('.checkbox', [
			m('label.c-input.c-checkbox', [
				m('input.form-control', {
					type: 'checkbox',
					onclick: m.withAttr('checked', prop),
					checked: prop()
				}),
				m('span.c-indicator'),
				m.trust('&nbsp;'),
				m('span.text-muted', description)
			])
		]);
	},{isFormControl:false})
};


export let maybeInput = args => m.component(maybeInputComponent, args);
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
	view: viewWrapper(({text, checked}, {placeholder = ''}) => {
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
