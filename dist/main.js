(function () { 'use strict';

	var babelHelpers = {};

	babelHelpers.typeof = function (obj) {
	  return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();

	babelHelpers;
	var fullHeight = function fullHeight(element, isInitialized, ctx) {
		if (!isInitialized) {
			onResize();

			window.addEventListener('resize', onResize, true);

			ctx.onunload = function () {
				window.removeEventListener('resize', onResize);
			};
		}

		function onResize() {
			element.style.height = document.documentElement.clientHeight - element.getBoundingClientRect().top + 'px';
		}
	};

	var imgEditor$1 = {
		view: function view(ctrl, args) {
			var file = args.file;
			return m('div.', { config: fullHeight }, [m('object', {
				data: file.url,
				type: 'application/pdf',
				width: '100%',
				height: '100%'
			})]);
		}
	};

	var noop = function noop() {};

	var aceComponent = {
		controller: function controller(args) {
			var ctrl = {
				content: args.content
			};

			return ctrl;
		},

		view: function editorView(ctrl, args) {
			return m('.editor', { config: aceComponent.config(ctrl, args) });
		},

		config: function config(ctrl, args) {
			return function (element, isInitialized, ctx) {
				var editor;
				var content = ctrl.content;
				var settings = args.settings || {};
				var mode = settings.mode || 'javascript';

				if (!isInitialized) {
					fullHeight(element, isInitialized, ctx);

					require(['ace/ace'], function (ace) {
						ace.config.set('packaged', true);
						ace.config.set('basePath', require.toUrl('ace'));

						editor = ace.edit(element);
						var commands = editor.commands;

						editor.setTheme('ace/theme/monokai');
						editor.getSession().setMode('ace/mode/' + mode);
						if (mode !== 'javascript') editor.getSession().setUseWorker(false);
						editor.setHighlightActiveLine(true);
						editor.setShowPrintMargin(false);
						editor.setFontSize('18px');
						editor.$blockScrolling = Infinity; // scroll to top

						editor.getSession().on('change', function () {
							m.startComputation();
							content(editor.getValue());
							m.endComputation();
						});

						commands.addCommand({
							name: 'save',
							bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
							exec: ctrl.onSave || noop
						});

						editor.setValue(content());
					});
				}

				editor && editor.setValue(content());
			};
		}
	};

	var editorPage = {
		controller: function controller(args) {
			var file = args.file;

			var ctrl = {
				file: file,
				content: file.content,
				save: file.save,
				play: play
			};

			return ctrl;

			function play() {
				var playground;

				playground = window.open('playground.html', 'Playground');

				playground.onload = function () {
					// first set the unload listener
					playground.addEventListener('unload', function () {
						// get focus back here
						window.focus();
					});

					// then activate the player (this ensures that when )
					playground.activate(file);
					playground.focus();
				};
			}
		},

		view: function view(ctrl, args) {
			return m('.editor', [m('.btn-toolbar', [m('.btn-group', [ctrl.file.type === 'js' ? m('a.btn.btn-secondary', { onclick: ctrl.save }, [m('strong.fa.fa-play')]) : '', m('a.btn.btn-secondary', { onclick: ctrl.play }, [m('strong.fa.fa-save')])])]), m.component(aceComponent, { content: ctrl.content, settings: args.settings })]);
		}
	};

	// taken from here:
	// https://github.com/JedWatson/classnames/blob/master/index.js
	var hasOwn = ({}).hasOwnProperty;

	function classNames() {
		var classes = '';

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg === 'undefined' ? 'undefined' : babelHelpers.typeof(arg);

			if (argType === 'string' || argType === 'number') {
				classes += ' ' + arg;
			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}

		return classes.substr(1);
	}

	var jsEditor$1 = {
		controller: function controller(args) {
			return {
				file: args.file,
				activeTab: m.prop('edit')
			};
		},
		view: function view(ctrl) {
			var file = ctrl.file;
			var activeTab = ctrl.activeTab;
			return m('div', [m('ul.nav.nav-tabs', [m('li.nav-item', [m('a[data-tab="edit"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'edit' }) }, 'Edit')]), m('li.nav-item', [m('a.nav-link.disabled', 'Syntax')]), m('li.nav-item', [m('a.nav-link.disabled', 'Vaildate')])]), m('.tab-content', [activeTab() == 'edit' ? m.component(editorPage, { file: file, settings: { mode: 'ejs' } }) : ''])]);
		}
	};

	var imgEditor = {
		view: function view(ctrl, args) {
			var file = args.file;
			return m('div.img-editor', { config: fullHeight }, [m('img', { src: file.url })]);
		}
	};

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
	  *      isValid: Boolean,
	  *      data: Object, // raw data
	  *      errors: Array, // an array of analyzed errors
	  *      errorCount: Number, // the number of errors
	  *      warningCount: Number // the number of warnings
	  * }
	  */
		analize: function analize(isValid, data) {
			var errorCount = 0;
			var warningCount = 0;
			var errors = isValid ? [] : data.errors.filter(function (e) {
				return e;
			}) // clean null values
			.map(function (err) {
				var isError = err.code && err.code[0] === 'E';

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
				isValid: isValid,
				data: data,
				errors: errors,
				errorCount: errorCount,
				warningCount: warningCount
			};
		},

		jshintOptions: {
			// JSHint Default Configuration File (as on JSHint website)
			// See http://jshint.com/docs/ for more details

			'curly': false, // true: Require {} for every new block or scope
			'latedef': 'nofunc', // true: Require variables/functions to be defined before being used
			'undef': true, // true: Require all non-global variables to be declared (prevents global leaks)
			'unused': 'vars', // Unused variables:
			//   true     : all variables, last function parameter
			//   'vars'   : all variables only
			//   'strict' : all variables, all function parameters
			'strict': false, // true: Requires all functions run in ES5 Strict Mode

			'browser': true, // Web Browser (window, document, etc)
			'devel': true, // Development/debugging (alert, confirm, etc)

			// Custom Globals
			predef: ['piGlobal', 'define', 'require', 'requirejs', 'angular']
		},

		controller: function controller(args) {
			var file = args.file;
			return syntax.analize(file.syntaxValid, file.syntaxData);
		},

		view: function view(ctrl) {
			return m('div', [ctrl.isValid ? m('div', { class: 'alert alert-success' }, [m('strong', 'Well done!'), 'Your script is squeaky clean']) : m('div', [m('table.table', [m('tbody', ctrl.errors.map(function (err) {
				return m('tr', [m('td.text-muted', 'line ' + err.line), m('td.text-muted', 'col ' + err.col), m('td', { class: err.isError ? 'text-danger' : 'text-info' }, err.reason), m('td', err.evidence)]);
			}))]), m('.row', [m('.col-md-6', [m('div', { class: 'alert alert-danger' }, [m('strong', { class: 'glyphicon glyphicon-exclamation-sign' }), 'You have ' + ctrl.errorCount + ' critical errors.'])]), m('.col-md-6', [m('div', { class: 'alert alert-info' }, [m('strong', { class: 'glyphicon glyphicon-warning-sign' }), 'You have ' + ctrl.warningCount + ' non standard syntax errors.'])])])])]);
		}
	};

	function warn(message, test) {
		return { level: 'warn', message: message, test: test };
	}

	function error(message, test) {
		return { level: 'error', message: message, test: test };
	}

	function row(element, testArr) {
		var messages = flatten(testArr).filter(function (msg) {
			return msg;
		}) // clean empty
		.filter(function (msg) {
			return typeof msg.test == 'function' ? msg.test(element) : !!msg.test;
		}); // run test...

		return !messages.length ? null : {
			element: element,
			messages: messages
		};
	}

	function flatten(arr) {
		return arr.reduce(function (flat, toFlatten) {
			return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
		}, []);
	}

	function multiPick(arr, propArr) {
		return arr.map(function (e) {
			return e && [].concat(e[propArr[0]], e[propArr[1]], e[propArr[2]]);
		}) // gather all stim arrays
		.reduce(function (previous, current) {
			return previous.concat(current);
		}, []) // flatten arrays
		.filter(function (t) {
			return t;
		}); // remove all undefined stim
	}

	function flattenSequence(sequence) {
		function unMix(e) {
			return flattenSequence([].concat(e.data, e.elseData, (e.branches || []).map(function (e) {
				return e.data;
			})));
		}

		return sequence.reduce(function (previous, current) {
			return previous.concat(current && current.mixer ? unMix(current) : current);
		}, []).filter(function (t) {
			return t;
		}); // remove all undefined stim;
	}

	function concatClean() {
		var args = [].splice.call(arguments, 0);
		return [].concat.apply([], args).filter(function (e) {
			return e;
		});
	}

	function pipElements(script) {
		var trials, stimuli, media;

		trials = concatClean(flattenSequence(script.sequence), script.trialSets);
		stimuli = concatClean(script.stimulusSets, multiPick(trials, ['stimuli', 'layout']));
		media = concatClean(script.mediaSets, multiPick(stimuli, ['media', 'touchMedia']));

		return { trials: trials, stimuli: stimuli, media: media };
	}

	function managerElements(script) {
		var tasks;

		tasks = [].concat(flattenSequence(script.sequence), script.pagesSets).filter(function (t) {
			return t;
		});

		return { tasks: tasks };
	}

	function pipValidator(script, url) {
		var errors = [];
		var elements = pipElements(script);

		errors.push({ type: 'Settings', errors: checkSettings(script, url) });
		errors.push({ type: 'Trials', errors: filterMap(elements.trials, trialTest) });
		// errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
		// errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

		return errors;
	}

	function filterMap(arr, fn) {
		return arr.map(fn).filter(function (e) {
			return e;
		});
	}

	/**
	 * Check settings
	 * @param  {Object} script The script to be tested
	 * @param  {String} url    The script origin URL
	 * @return {Array}        Array of error rows
	 */
	function checkSettings(script, url) {
		var settings = script.settings || {};

		var w = byProp(warn);
		// var e = byProp(error);

		var errors = [r('base_url', [w('Your base_url is not in the same directory as your script.', function (e) {
			// use this!!!
			// http://stackoverflow.com/questions/4497531/javascript-get-url-path
			var getPath = function getPath(url) {
				var a = document.createElement('a');
				a.href = url;
				return a.pathname;
			};

			var path = getPath(url).substring(0, url.lastIndexOf('/') + 1); // get path but remove file name
			var t = function t(s) {
				return !s || getPath(s).indexOf(path) !== 0;
			};

			return (typeof e === 'undefined' ? 'undefined' : babelHelpers.typeof(e)) == 'object' ? t(e.image) && t(e.template) : t(e);
		})])];

		return errors.filter(function (err) {
			return !!err;
		});

		function r(prop, arr) {
			var el = {};
			el[prop] = settings[prop];
			return prop in settings && row(el, arr);
		}

		// wrap warn/error so that I don't have to individually
		function byProp(fn) {
			return function (msg, test) {
				return fn(msg, function (e) {
					for (var prop in e) {
						return test(e[prop]);
					}
				});
			};
		}
	}

	function trialTest(trial) {
		var tests = [testInteractions(trial.interactions), testInput(trial.input)];

		return row(trial, tests);

		function testInteractions(interactions) {
			if (!interactions) {
				return;
			}

			if (!Array.isArray(interactions)) {
				return [error('Interactions must be an array.', true)];
			}

			return interactions.map(function (interaction, index) {
				return [!interaction.conditions ? error('Interaction [' + index + '] must have conditions', true) : [error('Interaction conditon [' + index + '] must have a type', toArray(interaction.conditions).some(function (c) {
					return !c.type;
				}))], !interaction.actions ? error('Interaction [' + index + '] must have actions', true) : [error('Interaction action [' + index + '] must have a type', toArray(interaction.actions).some(function (a) {
					return !a.type;
				}))]];
			});

			function toArray(arr) {
				return Array.isArray(arr) ? arr : [arr];
			}
		}

		function testInput(input) {
			if (!input) {
				return;
			}

			if (!Array.isArray(trial.input)) {
				return [error('Input must be an Array', true)];
			}

			return [error('Input must always have a handle', input.some(function (i) {
				return !i.handle;
			})), error('Input must always have an on attribute', input.some(function (i) {
				return !i.on;
			}))];
		}
	}

	function questValidator(script) {
		var errors = [];

		errors.push({ type: 'Settings', errors: [] });
		errors.push({ type: 'Pages', errors: [] });
		errors.push({ type: 'Questions', errors: [] });

		return errors;
	}

	function managerValidator(script) {
		var errors = [];
		var elements = managerElements(script);

		errors.push({ type: 'Settings', errors: [] });
		errors.push({ type: 'Tasks', errors: [] });

		return errors;
	}

	function validate(script) {
		var type = script.type && script.type.toLowerCase();
		switch (type) {
			case 'pip':
				return pipValidator.apply(null, arguments);
			case 'quest':
				return questValidator.apply(null, arguments);
			case 'manager':
				return managerValidator.apply(null, arguments);
			default:
				throw new Error('Unknown script.type: ' + type);
		}
	}

	var validateComponent = {
		controller: function controller(args) {
			var file = args.file;
			var ctrl = {
				validations: m.prop([]),
				isError: false
			};

			m.startComputation();
			file.define().then(function () {
				return file.require();
			}).then(function (script) {
				ctrl.validations(validate(script, file.url));
				m.endComputation();
			}).catch(function () {
				ctrl.isError = true;
				m.endComputation();
			});

			return ctrl;
		},
		view: function view(ctrl) {
			return m('div', [!ctrl.isError ? '' : m('div', { class: 'alert alert-danger' }, [m('strong', { class: 'glyphicon glyphicon-exclamation-sign' }), 'There was a problem parsing this script. Are you sure that it is a valid PI script? Make sure you fix all syntax errors.']), ctrl.validations().map(function (validationReport) {
				return [m('h4', validationReport.type), !validationReport.errors.length ? m('div', { class: 'alert alert-success' }, [m('strong', 'Well done!'), 'Your script is squeaky clean']) : validationReport.errors.map(function (err) {
					return m('.row', [m('.col-md-4.stringified', m('div', { class: 'pre' }, m.trust(stringify(err.element)))), m('.col-md-8', [m('ul', err.messages.map(function (msg) {
						return m('li.list-unstyled', { class: msg.level == 'error' ? 'text-danger' : 'text-info' }, [m('strong', msg.level), msg.message]);
					}))])]);
				})];
			})]);
		}
	};

	function stringify(value, pretty) {
		if (value == null) {
			// null || undefined
			return '<i class="text-muted">undefined</i>';
		}
		if (value === '') {
			return '<i class="text-muted">an empty string</i>';
		}

		switch (typeof value === 'undefined' ? 'undefined' : babelHelpers.typeof(value)) {
			case 'string':
				break;
			case 'number':
				value = '' + value;
				break;
			case 'object':
				// display the error message not the full thing...
				if (value instanceof Error) {
					value = value.message;
					break;
				}
			/* fall through */
			default:
				// @TODO: implement this: http://stackoverflow.com/questions/4810841/how-can-i-pretty-print-json-using-javascript
				value = syntaxHighlight(JSON.stringify(value, null, 4));
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

	var jsEditor = {
		controller: function controller(args) {
			return {
				file: args.file,
				activeTab: m.prop('edit')
			};
		},
		view: function view(ctrl) {
			var file = ctrl.file;
			var activeTab = ctrl.activeTab;
			return m('div', [m('ul.nav.nav-tabs', [m('li.nav-item', [m('a[data-tab="edit"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'edit' }) }, 'Edit')]), m('li.nav-item', [m('a[data-tab="syntax"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'syntax' }) }, ['Syntax ', m('span.badge.alert-danger', file.syntaxValid ? '' : file.syntaxData.errors.length)])]), m('li.nav-item', [m('a[data-tab="validate"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'validate' }) }, 'Validate')])]), m('.tab-content', [activeTab() == 'edit' ? m.component(editorPage, { file: file }) : '', activeTab() == 'syntax' ? m.component(syntax, { file: file }) : '', activeTab() == 'validate' ? m.component(validateComponent, { file: file }) : ''])]);
		}
	};

	var File = (function () {
		function File(url) {
			var _this = this;

			babelHelpers.classCallCheck(this, File);

			this.url = url;
			this.name = url.substring(url.lastIndexOf('/') + 1);
			this.type = url.substring(url.lastIndexOf('.') + 1);
			this.id = url;

			// keep track of file content
			this.sourceContent = m.prop('');
			this.content = (function (store) {
				var prop = function prop() {
					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					if (args.length) {
						store = args[0];
						_this.checkSyntax();
					}
					return store;
				};

				prop.toJSON = function () {
					return store;
				};

				return prop;
			})('');

			// this is set within the load function
			this.loaded = false;
			this.error = false;

			// these are defined when calling checkSyntax
			this.syntaxValid = undefined;
			this.syntaxData = undefined;
		}

		babelHelpers.createClass(File, [{
			key: 'load',
			value: function load() {
				var _this2 = this;

				return new Promise(function (resolve, reject) {
					m.request({ method: 'GET', url: _this2.url, background: true, deserialize: function deserialize(text) {
							return text;
						} }).then(function (script) {
						m.startComputation();
						_this2.sourceContent(script);
						_this2.content(script);
						_this2.loaded = true;
						m.endComputation();
					}, function () {
						m.startComputation();
						_this2.loaded = true;
						_this2.error = true;
						m.endComputation();
					}).then(resolve, reject);
				});
			}
		}, {
			key: 'save',
			value: function save() {
				alert('Saving content: not implemented yet');
			}
		}, {
			key: 'hasChanged',
			value: function hasChanged() {
				return this.sourceContent() === this.content();
			}
		}, {
			key: 'define',
			value: function define() {
				var context = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

				var requirejs = context.requirejs;
				var name = this.url;
				var content = this.content();

				return new Promise(function (resolve) {
					requirejs.undef(name);
					context.eval(content.replace('define(', 'define(\'' + name + '\','));
					resolve();
				});
			}
		}, {
			key: 'require',
			value: function require() {
				var _this3 = this;

				var context = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

				var requirejs = context.requirejs;
				return new Promise(function (resolve, reject) {
					requirejs([_this3.url], resolve, reject);
				});
			}
		}, {
			key: 'checkSyntax',
			value: function checkSyntax() {
				var jshint = window.JSHINT;
				this.syntaxValid = jshint(this.content(), jshintOptions);
				this.syntaxData = jshint.data();
				return this.syntaxValid;
			}
		}]);
		return File;
	})();

	var jshintOptions = {
		// JSHint Default Configuration File (as on JSHint website)
		// See http://jshint.com/docs/ for more details

		'curly': false, // true: Require {} for every new block or scope
		'latedef': 'nofunc', // true: Require variables/functions to be defined before being used
		'undef': true, // true: Require all non-global variables to be declared (prevents global leaks)
		'unused': 'vars', // Unused variables:
		//   true     : all variables, last function parameter
		//   'vars'   : all variables only
		//   'strict' : all variables, all function parameters
		'strict': false, // true: Requires all functions run in ES5 Strict Mode

		'browser': true, // Web Browser (window, document, etc)
		'devel': true, // Development/debugging (alert, confirm, etc)

		// Custom Globals
		predef: ['piGlobal', 'define', 'require', 'requirejs', 'angular']
	};

	var editors = {
		js: jsEditor,
		jpg: imgEditor,
		bmp: imgEditor,
		png: imgEditor,
		html: jsEditor$1,
		jst: jsEditor$1,
		pdf: imgEditor$1
	};

	var fileEditorComponent = {
		controller: function controller() {
			var url = m.route.param('url');
			var file = new File(url);
			file.load();

			var ctrl = {
				file: file
			};

			return ctrl;
		},

		view: function view(ctrl) {
			var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			var file = ctrl.file;

			return m('div', [!file.loaded ? m('.loader') : file.error ? m('div', { class: 'alert alert-danger' }, [m('strong', { class: 'glyphicon glyphicon-exclamation-sign' }), 'The file "' + file.url + '" was not found']) : m.component(editors[file.type], { file: file, settings: args.settings })]);
		}
	};

	var contextMenuComponent = {
		show: m.prop(false),
		style: m.prop({}),
		menu: m.prop([{ icon: 'fa-play', text: 'begone' }, { icon: 'fa-play', text: 'asdf' }, { separator: true }, { icon: 'fa-play', text: 'wertwert', menu: [{ icon: 'fa-play', text: 'asdf' }] }]),

		view: function view() {
			return m('.context-menu', {
				class: classNames({ 'show-context-menu': contextMenuComponent.show() }),
				style: contextMenuComponent.style(),
				onclick: function onclick(e) {
					return e.stopPropagation();
				}
			}, contextMenuComponent.menu().map(menuNode));
		},

		trigger: function trigger(e) {
			e.preventDefault();
			contextMenuComponent.show(true);
			contextMenuComponent.style({
				left: e.pageX + 'px',
				top: e.pageY + 'px'
			});

			document.addEventListener('click', onClick, false);
			function onClick() {
				m.startComputation();
				contextMenuComponent.show(false);
				m.endComputation();
				document.removeEventListener('click', onClick);
			}
		}
	};

	var menuNode = function menuNode(node) {
		return node.separator ? m('.context-menu-separator') : m('.context-menu-item', { class: classNames({ disabled: node.disabled, submenu: node.menu }) }, [m('button.context-menu-btn', { onclick: node.action }, [m('i.fa', { class: node.icon }), m('span.context-menu-text', node.text)]), node.menu ? m('.context-menu', node.menu.map(menuNode)) : '']);
	};

	// var menu = document.querySelector('.menu');

	// function showMenu(x, y){
	//     menu.style.left = x + 'px';
	//     menu.style.top = y + 'px';
	//     menu.classList.add('show-menu');
	// }

	// function hideMenu(){
	//     menu.classList.remove('show-menu');
	// }

	// function onContextMenu(e){
	//     e.preventDefault();
	//     showMenu(e.pageX, e.pageY);
	//     document.addEventListener('click', onClick, false);
	// }

	// function onClick(e){
	//     hideMenu();
	//     document.removeEventListener('click', onClick);
	// }

	// document.addEventListener('contextmenu', onContextMenu, false);

	var sidebarComponent = {
		controller: function controller() {
			var ctrl = {
				fileArr: [new File('/test/aaa.pdfs'), new File('/test/templates/left.jst'), new File('/test/example.js'), new File('/test/images/bf14_nc.jpg')]
			};

			return ctrl;
		},
		view: function view(ctrl) {
			return m('div', [m('h5', 'Files'), m.component(filesComponent, ctrl.fileArr)]);
		}
	};

	var filesComponent = {
		view: function view(ctrl, files) {
			return m('.files', [m('ul', files.map(function (node) {
				return m.component(nodeComponent, node, files);
			}))]);
		}
	};

	var nodeComponent = {
		controller: function controller(file) {
			return {
				isDir: file.isDir,
				isOpen: false,
				isCurrent: m.route.param('url') === file.id
			};
		},
		view: function view(ctrl, file) {
			return m('li.node', {
				key: file.id,
				class: classNames({
					open: ctrl.isOpen
				})
			}, [m('a.wholerow', {
				unselectable: 'on',
				class: classNames({
					'current': ctrl.isCurrent
				}),
				onclick: choose(file)
			}, m.trust('&nbsp;')), m('i.fa.fa-fw', {
				class: classNames({
					'fa-caret-right': ctrl.isDir && !ctrl.isOpen,
					'fa-caret-down': ctrl.isDir && ctrl.isOpen
				}),
				onclick: ctrl.isDir ? function () {
					return ctrl.isOpen = !ctrl.isOpen;
				} : choose(file)
			}), m('a', { onclick: choose(file) }, [m('i.fa.fa-fw.fa-file-o', {
				class: classNames({
					'fa-file-code-o': /(js)$/.test(file.type),
					'fa-file-text-o': /(jst|thml)$/.test(file.type),
					'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
					'fa-file-pdf-o': /(pdf)$/.test(file.type)
				})
			}), ' ' + file.name])]);
		}
	};

	var choose = function choose(file) {
		return function (e) {
			e.preventDefault();
			m.route('/file/' + file.url);
		};
	};

	var editorLayoutComponent = {
		view: function view() {
			return m('div', [m('nav.navbar.navbar-dark.navbar-fixed-top', [m('a.navbar-brand', 'Dashboard')]), m('.container-fluid', { style: { marginTop: '70px' } }, [m('.row', [m('.sidebar.col-md-2', [m.component(sidebarComponent)]), m('.main.col-md-10', [m.component(fileEditorComponent)])])]), m.component(contextMenuComponent) // register context menu
			]);
		}
	};

	var mainComponent = {
		controller: function controller() {
			var ctrl = {
				url: m.prop('')
			};

			return ctrl;
		},
		view: function view(ctrl) {
			return m('.container', [m('.jumbotron', [m('h2', 'Welcome to PI Validator'), m('p', 'Please insert the url for the file you would like to edit'), m('.input-group', [m('span.input-group-btn', [m('a.btn.btn-default', { href: '/file/' + ctrl.url(), config: m.route }, m.trust('<span aria-hidden="true" class="glyphicon glyphicon-search"></span>'))]), m('input.form-control[placeholder="Please insert a URL"]', { value: ctrl.url(), onchange: m.withAttr('value', ctrl.url) })])])]);
		}
	};

	m.route(document.body, '', {
		'': mainComponent,
		'/file/:url...': editorLayoutComponent
	});

})();
//# sourceMappingURL=main.js.map
