import validator from './parser/validator';
export default scriptTestComponent;

var scriptTestComponent = {
	controller: args => {
		var ctrl = {
			validations : m.prop([]),
			isError: false
		};

		try {
			eval(args.script.replace('define(', 'define("myTask",'));
			window.requirejs(['myTask'], script => {
				m.startComputation();
				ctrl.validations(validator(script, args.url));
				m.endComputation();
			}, err => {
				ctrl.isError = true;
				throw err;
			});
		} catch(e) {
			ctrl.isError = true;
		}


		return ctrl;
	},
	view: ctrl => {
		return  m('div', [
			m('h3', 'Script Analysis'),

			!ctrl.isError ? '' :	m('div', {class:'alert alert-danger'}, [
				m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
				`There was a problem parsing this script. Are you sure that it is a valid PI script?`
			]),

			ctrl.validations().map(validationReport => {
				return [
					m('h4', validationReport.type),
					!validationReport.errors.length
						?
						m('div', {class:'alert alert-success'}, [
							m('strong','Well done!'),
							'Your script is squeaky clean'
						])
						:
						validationReport.errors.map(err => {
							return m('.row',[
								m('.col-md-4', err.element),
								m('.col-md-8',[
									m('ul', err.messages.map(msg => {
										return m('li.list-unstyled', {class: msg.level == 'error' ? 'text-danger' : 'text-info'}, [
											m('strong', msg.level),
											msg.message
										]);
									}))
								])
							]);
						})
				];
			})

		]);
	}
};

