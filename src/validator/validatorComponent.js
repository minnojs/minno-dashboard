import syntax from './syntaxComponent';
import scriptTest from './scriptTestComponent';

/**
 * Validator component
 * m.component(validator, {url: 'url/d.js'})
 * @type {Object}
 */
var validator = {
	controller: function() {
		var url = m.route.param('url');
		var ctrl = {
			loaded: false,
			syntaxModel: {},
			url: url,
			script: m.prop()
		};

		m
			.request({method:'GET', url:url,background:true, deserialize: text => text})
			.then(ctrl.script, ()=>ctrl.error = true)
			.then(script => {
				m.startComputation();
				ctrl.syntaxModel = syntax.analize(script);
				ctrl.loaded = true;
				m.endComputation();
			});

		return ctrl;
	},
	view: ctrl => {
		return m('.container', [
			m('h2', 'Validator', [m('small', ctrl.url)]),
			!ctrl.loaded
				?
				m('.loader')
				:
				ctrl.error
					?
					m('div', {class:'alert alert-danger'}, [
						m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
						`The file "${ctrl.url}" was not found`
					])
					:
					[
						m.component(syntax, {model: ctrl.syntaxModel}),
						ctrl.syntaxModel.errorCount > 1
							?
							m('div', {class:'alert alert-danger'}, [
								m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
								`We cannot parse the script as long as there are syntax errors`
							])
							:
							m.component(scriptTest, {url: ctrl.url, script: ctrl.script()})
					]
		]);
	}
};

export default validator;