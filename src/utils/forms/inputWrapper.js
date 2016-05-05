export default inputWrapper;
let inputWrapper = (view,opts={}) => (ctrl, args) => {
	let isValid = !ctrl.validity || ctrl.validity();
	let groupClass;
	let inputClass;
	let isFormControl = opts.isFormControl !== false;

	if (ctrl.showValidation && ctrl.showValidation() && !isValid){
		groupClass = isValid ? 'has-success' : 'has-danger';
		inputClass = isValid ? 'form-controll-success' : 'form-control-error';
	}

	return args.stack
		? m('.form-group', {class: groupClass}, [
			m('label', {class: isFormControl ? 'form-control-label' : ''}, args.label),
			view(ctrl, args, {inputClass}),
			args.help && m('small.text-muted.m-y-0', args.help )
		])
		: m('.form-group.row', {class: groupClass}, [
			m('label.col-sm-2', {class: isFormControl ? 'form-control-label' : ''}, args.label),
			m('.col-sm-10', [
				view(ctrl, args, {inputClass})
			]),
			args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help )
		]);
};
