import classNames from 'utils/classNames';
export default editComponent;

let editComponent = {
	controller({oldStudy, newStudy, close}){
		let study = ['studyUrl', 'rulesUrl', 'targetCompletions', 'pauseUrl'].reduce((study, prop)=>{
			study[prop] = m.prop(oldStudy[prop] || '');
			return study;
		}, {});

		// export study to calling component
		newStudy(study);


		let ctrl = {
			study,
			submitAttempt: false,
			validity(){
				let isNormalInteger = str => /^\+?(0|[1-9]\d*)$/.test(str);
				let response = {
					studyUrl: study.studyUrl(),
					rulesUrl: study.rulesUrl(),
					targetCompletions: isNormalInteger(study.targetCompletions()),
					pauseUrl: study.pauseUrl()
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
	view(ctrl, {oldStudy}){
		let study = ctrl.study;
		let validity = ctrl.validity();
		let miniButtonView = (prop, name, url) => m('button.btn.btn-secondary.btn-sm', {onclick: prop.bind(null,url)}, name);
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
			m('h4', 'Study Editor'),
			m('.card-block', [
				m('.form-group', [
					m('label', 'Study ID'),
					m('p',[
						m('strong.form-control-static', oldStudy.studyId)
					])

				]),
				// let isEmail = str  => /\S+@\S+\.\S+/.test(str);
				// m('.form-group', {class:groupClasses(validity.userEmail)}, [
				// 	m('label','User Email'),
				// 	m('input.form-control', {
				// 		type:'email',
				// 		placeholder:'Email',
				// 		value: study.userEmail(),
				// 		onkeyup: m.withAttr('value', study.userEmail),
				// 		class:inputClasses(validity.userEmail)
				// 	}),
				// 	validationView(validity.userEmail, 'This row is required and must be a valid Email')
				// ]),
				m('.form-group', {class:groupClasses(validity.studyUrl)}, [
					m('label', 'Study URL'),
					m('input.form-control', {
						placeholder:'URL',
						value: study.studyUrl(),
						onkeyup: m.withAttr('value', study.studyUrl),
						class:inputClasses(validity.studyUrl)
					}),
					validationView(validity.studyUrl, 'This row is required')
				]),
				m('.form-group', {class:groupClasses(validity.rulesUrl)}, [
					m('label', 'Rules File'),
					m('input.form-control', {
						placeholder:'Rules file URL',
						value: study.rulesUrl(),
						onkeyup: m.withAttr('value', study.rulesUrl),
						class:inputClasses(validity.rulesUrl)
					}),
					m('p.text-muted.btn-toolbar', [
						miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml')
					]),
					validationView(validity.rulesUrl, 'This row is required')
				]),
				m('.form-group', {class:groupClasses(validity.targetCompletions)}, [
					m('label','Target number of sessions'),
					m('input.form-control', {
						type:'number',
						placeholder:'Target Sessions',
						value: study.targetCompletions(),
						onkeyup: m.withAttr('value', study.targetCompletions),
						class:inputClasses(validity.targetCompletions)
					}),
					validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')
				]),
				m('.form-group', {class:groupClasses(validity.pauseUrl)}, [
					m('label', 'Auto-pause file URL'),
					m('input.form-control', {
						placeholder:'Auto pause file URL',
						value: study.pauseUrl(),
						onkeyup: m.withAttr('value', study.pauseUrl),
						class:inputClasses(validity.pauseUrl)
					}),
					m('p.text-muted.btn-toolbar', [
						miniButtonView(study.pauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'),
						miniButtonView(study.pauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'),
						miniButtonView(study.pauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')
					]),
					validationView(validity.pauseUrl, 'This row is required')
				])
			]),
			m('.text-xs-right.btn-toolbar',[
				m('a.btn.btn-secondary.btn-sm', {onclick:ctrl.cancel}, 'Cancel'),
				m('a.btn.btn-primary.btn-sm', {onclick:ctrl.ok}, 'OK')
			])
		]);
	}
};

