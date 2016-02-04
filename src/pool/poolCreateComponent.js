import classNames from 'utils/classNames';
import messages from 'utils/messagesComponent';
export default createMessage;

/**
 * Create edit component
 * Promise editMessage({output:Prop})
 */
let createMessage = args => messages.custom({
	content: m.component(createComponent, Object.assign({close:messages.close}, args)),
	wide: true
});

let createComponent = {
	controller({output, close}){
		let study = output({
			studyUrl: m.prop('')
		});

		let ctrl = {
			study,
			submitAttempt: false,
			validity(){
				let response = {
					studyUrl: study.studyUrl()
				};
				return response;
			},
			ok(){
				ctrl.submitAttempt = true;
				let response = ctrl.validity();
				let isValid = Object.keys(response).every(key => response[key]);
				if (isValid) close(true);
			},
			cancel() {
				close(null);
			}
		};

		return ctrl;
	},
	view(ctrl){
		let study = ctrl.study;
		let validity = ctrl.validity();
		let validationView = (isValid, message) => isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message);
		let groupClasses = valid => !ctrl.submitAttempt ? '' : classNames({
			'has-danger': !valid,
			'has-success' : valid
		});
		let inputClasses = valid => !ctrl.submitAttempt ? '' : classNames({
			'form-control-danger': !valid,
			'form-control-success': valid
		});

		return m('div',[
			m('h4', 'Create Study'),
			m('.card-block', [
				m('.form-group', {class:groupClasses(validity.studyUrl)}, [
					m('label', 'Study URL'),
					m('input.form-control', {
						config: focusConfig,
						placeholder:'Study URL',
						value: study.studyUrl(),
						onkeyup: m.withAttr('value', study.studyUrl),
						class:inputClasses(validity.studyUrl)
					}),
					validationView(validity.studyUrl, 'This row is required')
				])
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'Proceed')
			])
		]);
	}
};

let focusConfig = (element, isInitialized) => {
	if (!isInitialized) element.focus();
};