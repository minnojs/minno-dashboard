
export function formFactory(){
	let validationHash = [];
	return {
		register(fn){
			validationHash.push(fn);
		},
		isValid() {
			return validationHash.every(fn => fn.call());
		},
		showErors: m.prop(false)
	}
}

let textInput = (label, {prop, required}) => {
	if (form) {
		form.register(() => required && prop().length);
	}

	return m('.form-group.row', [
		m('label.col-sm-2.form-control-label', label),
		m('.col-sm-10', [
			m('input, {
				value: prop(),
				onkeyup: m.withAttr('value', prop)
				
			})
		])
	]);

}
