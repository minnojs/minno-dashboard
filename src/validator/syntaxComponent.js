export default syntax;

/**
 * Syntax component
 * Takes an argument as follows:
 *
 * {valid: Boolean, data: jshint(script).data()}
 */
var syntax = {

	/**
	 * Analyze script
	 * @param  {String} script A script to analyze
	 * @return {Object}
	 * {
	 *      valid: Boolean,
	 *      data: Object, // raw data
	 *      errors: Array, // an array of analyzed errors
	 *      errorCount: Number, // the number of errors
	 *      warningCount: Number // the number of warnings
	 * }
	 */
	analize: script => {
		var jshint = window.JSHINT;
		var valid = jshint(script, syntax.jshintOptions);
		var data = jshint.data();
		var errorCount = 0;
		var warningCount = 0;

		var errors = valid ? [] : data.errors
			.filter(e => e) // clean null values
			.map(err => {
				var isError = err.code && (err.code[0] === 'E');

				isError ? errorCount++ : warningCount++;

				return {
					isError: isError,
					line: err.line,
					col: err.character,
					reason: err.reason,
					evidence: err.evidence
				};
			});

		return {
			valid: valid,
			data: data,
			errors : errors,
			errorCount: errorCount,
			warningCount: warningCount
		};
	},

	jshintOptions: {
		// JSHint Default Configuration File (as on JSHint website)
		// See http://jshint.com/docs/ for more details

		'curly'         : false,    // true: Require {} for every new block or scope
		'latedef'       : 'nofunc', // true: Require variables/functions to be defined before being used
		'undef'         : true,     // true: Require all non-global variables to be declared (prevents global leaks)
		'unused'        : 'vars',   // Unused variables:
									//   true     : all variables, last function parameter
									//   'vars'   : all variables only
									//   'strict' : all variables, all function parameters
		'strict'        : false,    // true: Requires all functions run in ES5 Strict Mode

		'browser'       : true,     // Web Browser (window, document, etc)
		'devel'         : true,     // Development/debugging (alert, confirm, etc)

		// Custom Globals
		predef: ['piGlobal','define','require','requirejs','angular']
	},

	controller:  args => {
		return args.model;
	},

	view: ctrl => {
		return m('div', [
			m('h3', 'Syntax'),

			ctrl.valid
				?
				m('div', {class:'alert alert-success'}, [
					m('strong','Well done!'),
					'Your script is squeaky clean'
				])
				:
				m('div', [
					m('table.table', [
						m('tbody', ctrl.errors.map(err => {
							return m('tr',[
								m('td.text-muted', `line ${err.line}`),
								m('td.text-muted', `col ${err.col}`),
								m('td', {class: err.isError ? 'text-danger' : 'text-info'}, err.reason),
								m('td',err.evidence)
							]);
						}))
					]),

					m('.row',[
						m('.col-md-6', [
							m('div', {class:'alert alert-danger'}, [
								m('strong',{class:'glyphicon glyphicon-exclamation-sign'}),
								`You have ${ctrl.errorCount} critical errors.`
							])
						]),
						m('.col-md-6', [
							m('div', {class:'alert alert-info'}, [
								m('strong',{class:'glyphicon glyphicon-warning-sign'}),
								`You have ${ctrl.warningCount} non standard syntax errors.`
							])
						])
					])

				])
		]);
	}
};
