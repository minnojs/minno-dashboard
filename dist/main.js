(function () { 'use strict';

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

	function warn(message, test){
		return {level:'warn', message: message, test:test};
	}

	function error(message, test){
		return {level:'error', message: message, test:test};
	}

	function row(element, testArr){

		var messages = testArr
			.reduce((previous, current)=>previous.concat(current), []) // concatAll
			.filter(msg => msg) // clean empty
			.filter(msg => typeof msg.test == 'function' ? msg.test(element) : !!msg.test); // run test...

		return !messages.length ? null : {
			element: element,
			messages: messages
		};
	}

	function multiPick(arr, propArr){
		return arr
			.map(e=> e && [].concat(e[propArr[0]], e[propArr[1]], e[propArr[2]])) // gather all stim arrays
			.reduce((previous, current)=>previous.concat(current),[]) // flatten arrays
			.filter(t=>t); // remove all undefined stim
	}

	function flattenSequence(sequence){
		function unMix(e){
			return flattenSequence([].concat(e.data, e.elseData, (e.branches || []).map(e=>e.data)));
		}

		return sequence
			.reduce((previous, current) => {return previous.concat(current && current.mixer ? unMix(current) : current);},[])
			.filter(t=>t); // remove all undefined stim;
	}

	function concatClean(){
		var args = [].splice.call(arguments,0);
		return [].concat.apply([], args).filter(e=>e);
	}

	function pipElements(script){
		var trials, stimuli, media;

		trials = concatClean(flattenSequence(script.sequence), script.trialSets);
		stimuli = concatClean(
			script.stimulusSets,
			multiPick(trials,['stimuli', 'layout'])
		);
		media = concatClean(
			script.mediaSets,
			multiPick(stimuli,['media','touchMedia'])
		);

		return {trials:trials, stimuli:stimuli, media:media};
	}

	function managerElements(script){
		var tasks;

		tasks = [].concat(
			flattenSequence(script.sequence),
			script.pagesSets
		).filter(t=>t);

		return {tasks:tasks};
	}

	function pipValidator(script, url){
		var errors = [];
		var elements = pipElements(script);

		errors.push({type:'Settings',errors: checkSettings(script, url)});
		errors.push({type:'Trials',errors: filterMap(elements.trials, trialTest)});
		// errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
		// errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

		return errors;
	}

	function filterMap(arr, fn){
		return arr.map(fn).filter(e=>e);
	}

	/**
	 * Check settings
	 * @param  {Object} script The script to be tested
	 * @param  {String} url    The script origin URL
	 * @return {Array}        Array of error rows
	 */
	function checkSettings(script, url){
		var settings = script.settings || {};

		var w = byProp(warn);
		// var e = byProp(error);

		var errors = [
			r('base_url', [
				w('Your base_url is not in the same directory as your script.', e => {
					var path = url.substring(0, url.lastIndexOf('/') + 1);
					var t = s => (!s || s.indexOf(path) !== 0);
					return (typeof e == 'object') ? t(e.image) && t(e.template) : t(e);
				})
			])
		];

		return errors.filter(function(err){return !!err;});

		function r(prop, arr){
			var el = {};
			el[prop] = settings[prop];
			return prop in settings && row(el, arr);
		}

		// wrap warn/error so that I don't have to individually
		function byProp(fn){
			return function(msg, test){
				return fn(msg, e => {
					for (var prop in e) {
						return test(e[prop]);
					}
				});
			};
		}
	}

	function trialTest(trial) {
		var tests = [
			testInteractions(trial.interactions),
			testInput(trial.input)
		];

		return row(trial, tests);

		function testInteractions(interactions){
			if (!interactions) {return;}

			if (!Array.isArray(interactions)){
				return [error('Interactions must be an array.', true)];
			}

			return [
				interactions.some(i=>!i.conditions) ? error('All interactions must have conditions', true) : [
					error('All conditions must have a type', interactions.some(i=>!!i.conditions.type))
				],
				interactions.some(i=>!i.actions) ? error('All interactions must have actions', true) : [
					error('All actions must have a type', interactions.some(i=>!!i.actions.type))
				]
			];
		}

		function testInput(input){
			if (!input) {return;}

			if (!Array.isArray(trial.input)){
				return [error('Input must be an Array', true)];
			}

			return [
				error('Input must always have a handle', input.some(i=>!i.handle)),
				error('Input must always have an on attribute', input.some(i=>!i.on))
			];
		}
	}

	function questValidator(script){
		var errors = [];

		errors.push({type:'Settings', errors:[]});
		errors.push({type:'Pages', errors:[]});
		errors.push({type:'Questions', errors:[]});

		return errors;
	}

	function managerValidator(script){
		var errors = [];
		var elements = managerElements(script);

		errors.push({type:'Settings', errors:[]});
		errors.push({type:'Tasks', errors:[]});

		return errors;
	}

	function validate(script){
		var type = script.type && script.type.toLowerCase();
		switch (type){
		case 'pip' : return pipValidator.apply(null, arguments);
		case 'quest' : return questValidator.apply(null, arguments);
		case 'manager' : return managerValidator.apply(null, arguments);
		default:
			throw new Error('Unknown script.type: ' + type);
		}
	}

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
					ctrl.validations(validate(script, args.url));
					m.endComputation();
				}, () => {
					m.startComputation();
					ctrl.isError = true;
					m.endComputation();
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
					`There was a problem parsing this script. Are you sure that it is a valid PI script? Make sure you fix all syntax errors.`
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
									m('.col-md-4.stringified',
										m('div', {class:'pre'}, m.trust(stringify(err.element)))
									),
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


		function stringify(value, pretty) {
			if (value == null) { // null || undefined
				return '<i class="text-muted">undefined</i>';
			}
			if (value === '') {
				return '<i class="text-muted">an empty string</i>';
			}

			switch (typeof value) {
				case 'string':
					break;
				case 'number':
					value = '' + value;
					break;
				case 'object':
					// display the error message not the full thing...
					if (value instanceof Error){
						value = value.message;
						break;
					}
				/* fall through */
				default:
					// @TODO: implement this: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
					value = syntaxHighlight(JSON.stringify(value));
			}

			return value;
		}


	function syntaxHighlight(json) {
	    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
	        var cls = 'number';
	        if (/^"/.test(match)) {
	            if (/:$/.test(match)) {
	                cls = 'key';
	            } else {
	                cls = 'string';
	            }
	        } else if (/true|false/.test(match)) {
	            cls = 'boolean';
	        } else if (/null/.test(match)) {
	            cls = 'null';
	        }
	        return '<span class="' + cls + '">' + match + '</span>';
	    });
	}

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
								m.component(scriptTestComponent, {url: ctrl.url, script: ctrl.script()})
						]
			]);
		}
	};

	var mainComponent = {
		controller: function(){
			var ctrl = {
				url: m.prop('')
			};

			return ctrl;
		},
		view: ctrl => {
			return m('.container', [
				m('.jumbotron', [
					m('h2', 'Welcome to PI Validator'),
					m('p','Please insert the url for the file you would like to validate'),
					m('.input-group', [
						m('span.input-group-btn', [
							m('a.btn.btn-default', {href: `/validator/${ctrl.url()}`, config: m.route}, m.trust('<span aria-hidden="true" class="glyphicon glyphicon-search"></span>'))
						]),
						m('input.form-control[placeholder="Please insert a URL"]', {value: ctrl.url(), onchange: m.withAttr('value', ctrl.url)})
					])
				])
			]);
		}
	};

	m.route(document.body, '', {
		'' : mainComponent,
		'/validator/:url...': validator
	});

})();
//# sourceMappingURL=main.js.map
