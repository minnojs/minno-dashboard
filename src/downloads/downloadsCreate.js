import messages from 'utils/messagesComponent';
import {dateRangePicker} from 'utils/dateRange';
import classNames from 'utils/classNames';

const DAY_MS = 1000 * 60 ^ 60 * 24;


export default args => messages.custom({
	content: m.component(createComponent, Object.assign({close:messages.close}, args)),
	wide: true
});


let createComponent = {
	controller({output, close}){
		let download ={
			studyId: m.prop(''),
			db: m.prop('test'),
			startDate: m.prop(new Date(0)),
			endDate: m.prop(new Date())
		};

		// export study to calling component
		output(download);


		let ctrl = {
			download,
			submitAttempt: false,
			validity(){
				let response = {
					studyId: download.studyId()
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
		let download = ctrl.download;
		let validity = ctrl.validity();
		let dayButtonView = (name, days) => m('button.btn.btn-secondary.btn-sm', {onclick: () => {
			let d = new Date();
			d.setDate(d.getDate() - days);
			console.log(d)
			download.startDate(d);
			download.endDate(new Date());
		}}, name);

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
			m('h4', 'Request Download'),
			m('.card-block', [
				m('.form-group', {class:groupClasses(validity.studyId)}, [
					m('label', 'Study Id'),
					m('input.form-control', {
						config: focusConfig,
						placeholder:'Study Id',
						value: download.studyId(),
						onkeyup: m.withAttr('value', download.studyId),
						class:inputClasses(validity.rulesUrl)
					}),
					validationView(validity.studyId, 'The study ID is required in order to request a download.')
				]),
				m('.form-group', [
					m('label','Database'),
					m('select.form-control', {onchange: m.withAttr('value',download.db)}, [
						m('option',{value:'test', selected: download.db() === 'test'}, 'Development'),
						m('option',{value:'warehouse', selected: download.db() === 'warehouse'}, 'Production')
					])
				]),
				m('.form-group', [
					m('label', 'Date Range'),
					dateRangePicker(download),
					m('p.text-muted.btn-toolbar', [
						dayButtonView('Last 7 Days', 7),
						dayButtonView('Last 30 Days', 30),
						dayButtonView('Last 90 Days', 90),
						dayButtonView('All times', 3650),
					])
				])
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
			])
		]);
	}
};

let focusConfig = (element, isInitialized) => {
	if (!isInitialized) element.focus();
};
