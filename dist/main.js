(function () { 'use strict';

  var babelHelpers = {};

  function babelHelpers_typeof (obj) {
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  // taken from here:
  // https://github.com/JedWatson/classnames/blob/master/index.js
  var hasOwn = ({}).hasOwnProperty;

  function classNames() {
  	var classes = '';

  	for (var i = 0; i < arguments.length; i++) {
  		var arg = arguments[i];
  		if (!arg) continue;

  		var argType = typeof arg === 'undefined' ? 'undefined' : babelHelpers_typeof(arg);

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

  /**
   * Set this component into your layout then use any mouse event to open the context menu:
   * oncontextmenu: contextMenuComponent.open([...menu])
   *
   * Example menu:
   * [
   * 	{icon:'fa-play', text:'begone'},
   *	{icon:'fa-play', text:'asdf'},
   *	{separator:true},
   *	{icon:'fa-play', text:'wertwert', menu: [
   *		{icon:'fa-play', text:'asdf'}
   *	]}
   * ]
   */

  var contextMenuComponent = {
  	vm: {
  		show: m.prop(false),
  		style: m.prop({}),
  		menu: m.prop([])
  	},
  	view: function view() {
  		return m('.context-menu', {
  			class: classNames({ 'show-context-menu': contextMenuComponent.vm.show() }),
  			style: contextMenuComponent.vm.style()
  		}, contextMenuComponent.vm.menu().map(menuNode));
  	},

  	open: function open(menu) {
  		return function (e) {
  			e.preventDefault();
  			e.stopPropagation();

  			contextMenuComponent.vm.menu(menu);
  			contextMenuComponent.vm.show(true);
  			contextMenuComponent.vm.style({
  				left: e.pageX + 'px',
  				top: e.pageY + 'px'
  			});

  			document.addEventListener('mousedown', onClick, false);
  			function onClick() {
  				contextMenuComponent.vm.show(false);
  				document.removeEventListener('mousedown', onClick);
  				m.redraw();
  			}
  		};
  	}
  };

  var menuNode = function menuNode(node, key) {
  	return node.separator ? m('.context-menu-separator', { key: key }) : m('.context-menu-item', { class: classNames({ disabled: node.disabled, submenu: node.menu, key: key }) }, [m('button.context-menu-btn', { onmousedown: node.disabled || node.action }, [m('i.fa', { class: node.icon }), m('span.context-menu-text', node.text)]), node.menu ? m('.context-menu', node.menu.map(menuNode)) : '']);
  };

  var noop = function noop() {};

  var messages = {
  	vm: { isOpen: false },

  	open: function open(type) {
  		var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  		var promise = new Promise(function (resolve, reject) {
  			messages.vm = { resolve: resolve, reject: reject, type: type, opts: opts, isOpen: true };
  		});
  		m.redraw();

  		return promise;
  	},

  	close: function close(response) {
  		var vm = messages.vm;
  		vm.isOpen = false;
  		if (typeof vm.resolve === 'function') vm.resolve(response);
  		m.redraw();
  	},

  	custom: function custom(opts) {
  		return messages.open('custom', opts);
  	},
  	alert: function alert(opts) {
  		return messages.open('alert', opts);
  	},
  	confirm: function confirm(opts) {
  		return messages.open('confirm', opts);
  	},
  	prompt: function prompt(opts) {
  		return messages.open('prompt', opts);
  	},

  	view: function view() {
  		var vm = messages.vm;
  		var close = messages.close.bind(null, null);
  		var stopPropagation = function stopPropagation(e) {
  			return e.stopPropagation();
  		};
  		return m('.messages', [!vm || !vm.isOpen ? '' : [m('.overlay', { config: messages.config() }), m('.messages-wrapper', { onclick: close }, [m('.card', { class: vm.opts.wide ? 'col-sm-8' : 'col-sm-5' }, [m('.card-block', { onclick: stopPropagation }, [messages.views[vm.type](vm.opts)])])])]]);
  	},

  	config: function config() {
  		return function (element, isInitialized, context) {
  			if (!isInitialized) {
  				(function () {
  					var handleKey = function handleKey(e) {
  						if (e.keyCode == 27) {
  							messages.close(null);
  						}
  						if (e.keyCode == 13) {
  							messages.close(true);
  						}
  					};

  					document.body.addEventListener('keyup', handleKey);

  					context.onunload = function () {
  						document.body.removeEventListener('keyup', handleKey);
  					};
  				})();
  			}
  		};
  	},

  	views: {
  		custom: function custom() {
  			var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  			return opts.content;
  		},

  		alert: function alert() {
  			var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  			var close = function close(response) {
  				return messages.close.bind(null, response);
  			};
  			return [m('h4', opts.header), m('p.card-text', opts.content), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-primary.btn-sm', { onclick: close(true) }, opts.okText || 'OK')])];
  		},

  		confirm: function confirm() {
  			var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  			var close = function close(response) {
  				return messages.close.bind(null, response);
  			};
  			return [m('h4', opts.header), m('p.card-text', opts.content), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: close(null) }, opts.okText || 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: close(true) }, opts.okText || 'OK')])];
  		},

  		/**
     * Promise prompt(Object opts{header: String, content: String, name: Prop})
     *
     * where:
     *   any Prop(any value)
     */
  		prompt: function prompt() {
  			var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  			var close = function close(response) {
  				return messages.close.bind(null, response);
  			};
  			return [m('h4', opts.header), m('.card-text', opts.content), m('.card-block', [m('input.form-control', {
  				onchange: m.withAttr('value', opts.prop || noop),
  				config: function config(element, isInitialized) {
  					if (!isInitialized) element.focus();
  				}
  			})]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: close(null) }, opts.okText || 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: close(true) }, opts.okText || 'OK')])];
  		}
  	}
  };

  var layout = function layout(route) {
  	return {
  		view: function view() {
  			return m('div', [m('nav.navbar.navbar-dark.navbar-fixed-top', [m('a.navbar-brand', 'Dashboard'), m('ul.nav.navbar-nav', [m('li.nav-item', [m('a.nav-link', { href: '/studies', config: m.route }, 'Studies')]), m('li.nav-item', [m('a.nav-link', { href: '/pool', config: m.route }, 'Pool')]), m('li.nav-item', [m('a.nav-link', { href: '/downloads', config: m.route }, 'Downloads')])])]), m('.container-fluid', { style: { marginTop: '70px' } }, [route]), m.component(contextMenuComponent), // register context menu
  			m.component(messages)]);
  		}
  	};
  };

  function sortTable(listProp, sortByProp) {
  	return function (e) {
  		var prop = e.target.getAttribute('data-sort-by');
  		var list = listProp();
  		if (prop) {
  			if (typeof sortByProp == 'function') sortByProp(prop); // record property so that we can change style accordingly
  			var first = list[0];
  			list.sort(function (a, b) {
  				return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
  			});
  			if (first === list[0]) list.reverse();
  		}
  	};
  }

  function formatDate(date) {
  	var pad = function pad(num) {
  		return num < 10 ? '0' + num : num;
  	};
  	return pad(date.getMonth() + 1) + '\\' + pad(date.getDate()) + '\\' + date.getFullYear();
  }

  var checkStatus = function checkStatus(response) {
  	if (response.status >= 200 && response.status < 300) {
  		return response;
  	}

  	var error = new Error(response.statusText);
  	error.response = response;
  	throw error;
  };

  var toJSON = function toJSON(response) {
  	return response.json();
  };

  // extract info from status error
  var catchJSON = function catchJSON(err) {
  	return (err.response ? err.response.json() : Promise.reject()).catch(function () {
  		return Promise.reject(err);
  	}).then(function (json) {
  		return Promise.reject(json);
  	});
  };

  function fetchJson(url, options) {
  	var opts = Object.assign({
  		credentials: 'same-origin',
  		headers: {
  			'Accept': 'application/json',
  			'Content-Type': 'application/json'
  		}
  	}, options);

  	opts.body = JSON.stringify(options.body);

  	return fetch(url, opts).then(checkStatus).then(toJSON).catch(catchJSON);
  }

  var dud = function dud(a) {
  	return function () {
  		return console.log(a);
  	};
  };

  var downloadsComponent = {
  	controller: function controller() {
  		var ctrl = {
  			list: m.prop([]),
  			create: dud('create'),
  			remove: dud('remove'),
  			globalSearch: m.prop(''),
  			sortBy: m.prop('studyId')
  		};

  		fetchJson('/dashboard/DashboardData', { method: 'post', body: { action: 'getAllDownloads' } }).then(ctrl.list).then(m.redraw);

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var list = ctrl.list;
  		return m('.downloads', [m('h2', 'Downloads'), m('table', { class: 'table table-striped table-hover', onclick: sortTable(list, ctrl.sortBy) }, [m('thead', [m('tr', [m('th', { colspan: 7 }, [m('input.form-control', { placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch) })])]), m('tr', [m('th.text-xs-center', { colspan: 7 }, [m('button.btn.btn-secondary', { onclick: ctrl.create.bind(null, list) }, [m('i.fa.fa-plus'), '  Download request'])])]), m('tr', [m('th', thConfig$1('studyId', ctrl.sortBy), 'ID'), m('th', 'Data file'), m('th', thConfig$1('db', ctrl.sortBy), 'Database'), m('th', thConfig$1('fileSize', ctrl.sortBy), 'File Size'), m('th', thConfig$1('creationDate', ctrl.sortBy), 'Date Added'), m('th', 'Status'), m('th', 'Actions')])]), m('tbody', [list().filter(studyFilter$1(ctrl)).map(function (study) {
  			return m('tr', [
  			// ### ID
  			m('td', study.studyId),

  			// ### Study url
  			m('td', study.fileSize ? m('a', { href: study.studyUrl, download: true, target: '_blank' }, 'Download') : m('i.text-muted', 'No Data')),

  			// ### Database
  			m('td', study.db),

  			// ### Filesize
  			m('td', study.fileSize),

  			// ### Date Added
  			m('td', [formatDate(new Date(study.creationDate)), '  ', m('i.fa.fa-info-circle'), m('.card.info-box', [m('.card-header', 'Creation Details'), m('ul.list-group.list-group-flush', [m('li.list-group-item', [m('strong', 'Creation Date: '), formatDate(new Date(study.creationDate))]), m('li.list-group-item', [m('strong', 'Start Date: '), formatDate(new Date(study.startDate))]), m('li.list-group-item', [m('strong', 'End Date: '), formatDate(new Date(study.endDate))])])])]),

  			// ### Status
  			m('td', [({
  				C: m('span.label.label-success', 'Complete'),
  				R: m('span.label.label-info', 'Running'),
  				X: m('span.label.label-danger', 'Error')
  			})[study.studyStatus]]),

  			// ### Actions
  			m('td', [m('.btn-group', [m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.remove.bind(null, study, list) }, [m('i.fa.fa-close')])])])]);
  		})])])]);
  	}
  };

  // @TODO: bad idiom! should change things within the object, not the object itself.
  var thConfig$1 = function thConfig(prop, current) {
  	return { 'data-sort-by': prop, class: current() === prop ? 'active' : '' };
  };

  function studyFilter$1(ctrl) {
  	return function (study) {
  		return includes(study.studyId, ctrl.globalSearch()) || includes(study.studyUrl, ctrl.globalSearch());
  	};

  	function includes(val, search) {
  		return typeof val === 'string' && val.includes(search);
  	}
  }

  var url = '/dashboard/StudyData';

  var STATUS_RUNNING = 'R';
  var STATUS_PAUSED = 'P';
  var STATUS_STOP = 'S';

  function updateStudy(study) {
  	var body = Object.assign({
  		action: 'updateRulesTable'
  	}, study);

  	return fetchJson(url, { method: 'post', body: body }).then(interceptErrors);
  }

  function updateStatus(study, status) {
  	return updateStudy(Object.assign({ studyStatus: status }, study)).then(interceptErrors);
  }

  function getAllPoolStudies() {
  	return fetchJson(url, { method: 'post', body: { action: 'getAllPoolStudies' } }).then(interceptErrors);
  }

  function getStudyId(study) {
  	var body = Object.assign({
  		action: 'getStudyId'
  	}, study);

  	return fetchJson(url, { method: 'post', body: body });
  }

  function interceptErrors(response) {
  	if (!response.error) {
  		return response;
  	}

  	var errors = {
  		1: 'This ID already exists.',
  		2: 'The study could not be found.',
  		3: 'The rule file could not be found.',
  		4: 'The rules file does not fit the "research" schema.'
  	};

  	return Promise.reject({ message: errors[response.error] });
  }

  /**
   * Create edit component
   * Promise editMessage({oldStudy:Object, newStudy:Prop})
   */
  var editMessage = function editMessage(args) {
  	return messages.custom({
  		content: m.component(editComponent, Object.assign({ close: messages.close }, args)),
  		wide: true
  	});
  };

  var editComponent = {
  	controller: function controller(_ref) {
  		var oldStudy = _ref.oldStudy;
  		var newStudy = _ref.newStudy;
  		var close = _ref.close;

  		var study = ['rulesUrl', 'targetCompletions', 'pauseUrl'].reduce(function (study, prop) {
  			study[prop] = m.prop(oldStudy[prop] || '');
  			return study;
  		}, {});

  		// export study to calling component
  		newStudy(study);

  		var ctrl = {
  			study: study,
  			submitAttempt: false,
  			validity: function validity() {
  				var isNormalInteger = function isNormalInteger(str) {
  					return (/^\+?(0|[1-9]\d*)$/.test(str)
  					);
  				};
  				var response = {
  					rulesUrl: study.rulesUrl(),
  					targetCompletions: isNormalInteger(study.targetCompletions()),
  					pauseUrl: study.pauseUrl()
  				};
  				return response;
  			},
  			ok: function ok() {
  				ctrl.submitAttempt = true;
  				var response = ctrl.validity();
  				var isValid = Object.keys(response).every(function (key) {
  					return response[key];
  				});

  				if (isValid) close(true);
  			},
  			cancel: function cancel() {
  				close(null);
  			}
  		};

  		return ctrl;
  	},
  	view: function view(ctrl, _ref2) {
  		var oldStudy = _ref2.oldStudy;

  		var study = ctrl.study;
  		var validity = ctrl.validity();
  		var miniButtonView = function miniButtonView(prop, name, url) {
  			return m('button.btn.btn-secondary.btn-sm', { onclick: prop.bind(null, url) }, name);
  		};
  		var validationView = function validationView(isValid, message) {
  			return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message);
  		};
  		var groupClasses = function groupClasses(valid) {
  			return !ctrl.submitAttempt ? '' : classNames({
  				'has-danger': !valid,
  				'has-success': valid
  			});
  		};
  		var inputClasses = function inputClasses(valid) {
  			return !ctrl.submitAttempt ? '' : classNames({
  				'form-control-danger': !valid,
  				'form-control-success': valid
  			});
  		};

  		return m('div', [m('h4', 'Study Editor'), m('.card-block', [m('.form-group', [m('label', 'Study ID'), m('p', [m('strong.form-control-static', oldStudy.studyId)])]), m('.form-group', [m('label', 'Study URL'), m('p', [m('strong.form-control-static', oldStudy.studyUrl)])]),

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
  		// m('.form-group', {class:groupClasses(validity.studyUrl)}, [
  		// 	m('label', 'Study URL'),
  		// 	m('input.form-control', {
  		// 		placeholder:'URL',
  		// 		value: study.studyUrl(),
  		// 		onkeyup: m.withAttr('value', study.studyUrl),
  		// 		class:inputClasses(validity.studyUrl)
  		// 	}),
  		// 	validationView(validity.studyUrl, 'This row is required')
  		// ]),
  		m('.form-group', { class: groupClasses(validity.rulesUrl) }, [m('label', 'Rules File URL'), m('input.form-control', {
  			placeholder: 'Rules file URL',
  			value: study.rulesUrl(),
  			onkeyup: m.withAttr('value', study.rulesUrl),
  			class: inputClasses(validity.rulesUrl)
  		}), m('p.text-muted.btn-toolbar', [miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml')]), validationView(validity.rulesUrl, 'This row is required')]), m('.form-group', { class: groupClasses(validity.pauseUrl) }, [m('label', 'Auto-pause file URL'), m('input.form-control', {
  			placeholder: 'Auto pause file URL',
  			value: study.pauseUrl(),
  			onkeyup: m.withAttr('value', study.pauseUrl),
  			class: inputClasses(validity.pauseUrl)
  		}), m('p.text-muted.btn-toolbar', [miniButtonView(study.pauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'), miniButtonView(study.pauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'), miniButtonView(study.pauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')]), validationView(validity.pauseUrl, 'This row is required')]), m('.form-group', { class: groupClasses(validity.targetCompletions) }, [m('label', 'Target number of sessions'), m('input.form-control', {
  			type: 'number',
  			placeholder: 'Target Sessions',
  			value: study.targetCompletions(),
  			onkeyup: m.withAttr('value', study.targetCompletions),
  			class: inputClasses(validity.targetCompletions)
  		}), validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')])]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: ctrl.cancel }, 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: ctrl.ok }, 'OK')])]);
  	}
  };

  /**
   * Create edit component
   * Promise editMessage({newStudy:Prop})
   */
  var createMessage = function createMessage(args) {
  	return messages.custom({
  		content: m.component(createComponent, Object.assign({ close: messages.close }, args)),
  		wide: true
  	});
  };

  var createComponent = {
  	controller: function controller(_ref) {
  		var newStudy = _ref.newStudy;
  		var close = _ref.close;

  		var study = newStudy({
  			userEmail: m.prop(''),
  			studyUrl: m.prop('')
  		});

  		var ctrl = {
  			study: study,
  			submitAttempt: false,
  			validity: function validity() {
  				var isEmail = function isEmail(str) {
  					return (/\S+@\S+\.\S+/.test(str)
  					);
  				};
  				var response = {
  					studyUrl: study.studyUrl(),
  					userEmail: isEmail(study.userEmail())
  				};
  				return response;
  			},
  			ok: function ok() {
  				ctrl.submitAttempt = true;
  				var response = ctrl.validity();
  				var isValid = Object.keys(response).every(function (key) {
  					return response[key];
  				});
  				if (isValid) close(true);
  			},
  			cancel: function cancel() {
  				close(null);
  			}
  		};

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var study = ctrl.study;
  		var validity = ctrl.validity();
  		var validationView = function validationView(isValid, message) {
  			return isValid || !ctrl.submitAttempt ? '' : m('small.text-muted', message);
  		};
  		var groupClasses = function groupClasses(valid) {
  			return !ctrl.submitAttempt ? '' : classNames({
  				'has-danger': !valid,
  				'has-success': valid
  			});
  		};
  		var inputClasses = function inputClasses(valid) {
  			return !ctrl.submitAttempt ? '' : classNames({
  				'form-control-danger': !valid,
  				'form-control-success': valid
  			});
  		};

  		return m('div', [m('h4', 'Create Study'), m('.card-block', [m('.form-group', { class: groupClasses(validity.userEmail) }, [m('label', 'User Email'), m('input.form-control', {
  			type: 'email',
  			placeholder: 'Email',
  			value: study.userEmail(),
  			onkeyup: m.withAttr('value', study.userEmail),
  			class: inputClasses(validity.userEmail)
  		}), validationView(validity.userEmail, 'This row is required and must be a valid Email')]), m('.form-group', { class: groupClasses(validity.studyUrl) }, [m('label', 'Study URL'), m('input.form-control', {
  			placeholder: 'Study URL',
  			value: study.studyUrl(),
  			onkeyup: m.withAttr('value', study.studyUrl),
  			class: inputClasses(validity.studyUrl)
  		}), validationView(validity.studyUrl, 'This row is required')])]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: ctrl.cancel }, 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: ctrl.ok }, 'Proceed')])]);
  	}
  };

  function play(study) {
  	return messages.confirm({
  		header: 'Continue Study:',
  		content: 'Are you sure you want to continue "' + study.studyId + '"?'
  	}).then(function (response) {
  		if (response) {
  			studyPending(study, true)();
  			return updateStatus(study, STATUS_RUNNING).then(function () {
  				return study.studyStatus = STATUS_RUNNING;
  			}).catch(reportError('Continue Study')).then(studyPending(study, false));
  		}
  	});
  }

  function pause(study) {
  	return messages.confirm({
  		header: 'Pause Study:',
  		content: 'Are you sure you want to pause "' + study.studyId + '"?'
  	}).then(function (response) {
  		if (response) {
  			studyPending(study, true)();
  			return updateStatus(study, STATUS_PAUSED).then(function () {
  				return study.studyStatus = STATUS_PAUSED;
  			}).catch(reportError('Pause Study')).then(studyPending(study, false));
  		}
  	});
  }

  var remove = function remove(study, list) {
  	return messages.confirm({
  		header: 'Remove Study:',
  		content: 'Are you sure you want to remove "' + study.studyId + '" from the pool?'
  	}).then(function (response) {
  		if (response) {
  			studyPending(study, true)();
  			return updateStatus(study, STATUS_STOP).then(function () {
  				return list(list().filter(function (el) {
  					return el !== study;
  				}));
  			}).catch(reportError('Remove Study')).then(studyPending(study, false));
  		}
  	});
  };

  var edit = function edit(oldStudy) {
  	var newStudy = m.prop();
  	return editMessage({ oldStudy: oldStudy, newStudy: newStudy }).then(function (response) {
  		if (response) {
  			var _ret = (function () {
  				studyPending(oldStudy, true)();
  				var study = Object.assign({}, oldStudy, unPropify(newStudy()));
  				return {
  					v: updateStudy(study).then(function () {
  						return Object.assign(oldStudy, study);
  					}) // update study in view
  					.catch(reportError('Study Editor')).then(studyPending(oldStudy, false))
  				};
  			})();

  			if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers_typeof(_ret)) === "object") return _ret.v;
  		}
  	});
  };

  var create$1 = function create(list) {
  	var newStudy = m.prop();
  	return createMessage({ newStudy: newStudy }).then(function (response) {
  		if (response) getStudyId(newStudy()).then(function (response) {
  			return Object.assign(unPropify(newStudy()), response);
  		}) // add response data to "newStudy"
  		.then(editNewStudy);
  	});

  	function editNewStudy(oldStudy) {
  		var newStudy = m.prop();
  		return editMessage({ oldStudy: oldStudy, newStudy: newStudy }).then(function (response) {
  			if (response) {
  				var _ret2 = (function () {
  					var study = Object.assign({
  						startedSessions: 0,
  						completedSessions: 0,
  						creationDate: new Date(),
  						studyStatus: STATUS_RUNNING
  					}, oldStudy, unPropify(newStudy()));
  					return {
  						v: updateStudy(study).then(function () {
  							return list().push(study);
  						}).then(m.redraw).catch(reportError('Create Study'))
  					};
  				})();

  				if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers_typeof(_ret2)) === "object") return _ret2.v;
  			}
  		});
  	}
  };

  var reportError = function reportError(header) {
  	return function (err) {
  		return messages.alert({ header: header, content: err.message });
  	};
  };

  var studyPending = function studyPending(study, state) {
  	return function () {
  		study.$pending = state;
  		m.redraw();
  	};
  };

  var unPropify = function unPropify(obj) {
  	return Object.keys(obj).reduce(function (result, key) {
  		result[key] = obj[key]();
  		return result;
  	}, {});
  };

  var poolComponent = {
  	controller: function controller() {
  		var ctrl = {
  			play: play,
  			pause: pause,
  			remove: remove,
  			edit: edit,
  			create: create$1,
  			list: m.prop([]),
  			globalSearch: m.prop(''),
  			sortBy: m.prop()
  		};

  		getAllPoolStudies().then(ctrl.list).then(m.redraw);

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var list = ctrl.list;
  		return m('.pool', [m('h2', 'Study pool'), m('table', { class: 'table table-striped table-hover', onclick: sortTable(list, ctrl.sortBy) }, [m('thead', [m('tr', [m('th', { colspan: 8 }, [m('input.form-control', { placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch) })])]), m('tr', [m('th.text-xs-center', { colspan: 8 }, [m('button.btn.btn-secondary', { onclick: ctrl.create.bind(null, list) }, [m('i.fa.fa-plus'), '  Add new study'])])]), m('tr', [m('th', thConfig('studyId', ctrl.sortBy), 'ID'), m('th', thConfig('studyUrl', ctrl.sortBy), 'Study'), m('th', thConfig('rulesUrl', ctrl.sortBy), 'Rules'), m('th', thConfig('pauseUrl', ctrl.sortBy), 'Autopause'), m('th', thConfig('completedSessions', ctrl.sortBy), 'Completed'), m('th', thConfig('creationDate', ctrl.sortBy), 'Date'), m('th', 'Status'), m('th', 'Actions')])]), m('tbody', [list().filter(studyFilter(ctrl)).map(function (study) {
  			return m('tr', [
  			// ### ID
  			m('td', study.studyId),

  			// ### Study url
  			m('td', [m('a', { href: study.studyUrl, target: '_blank' }, 'Study')]),

  			// ### Rules url
  			m('td', [m('a', { href: study.rulesUrl, target: '_blank' }, 'Rules')]),

  			// ### Autopause url
  			m('td', [m('a', { href: study.pauseUrl, target: '_blank' }, 'Autopause')]),

  			// ### Completions
  			m('td', [(100 * study.completedSessions / study.targetCompletions).toFixed(1) + '% ', m('i.fa.fa-info-circle'), m('.card.info-box', [m('.card-header', 'Completion Details'), m('ul.list-group.list-group-flush', [m('li.list-group-item', [m('strong', 'Target Completions: '), study.targetCompletions]), m('li.list-group-item', [m('strong', 'Started Sessions: '), study.startedSessions]), m('li.list-group-item', [m('strong', 'Completed Sessions: '), study.completedSessions])])])]),

  			// ### Date
  			m('td', formatDate(new Date(study.creationDate))),

  			// ### Status
  			m('td', [({
  				R: m('span.label.label-success', 'Running'),
  				P: m('span.label.label-info', 'Paused'),
  				S: m('span.label.label-danger', 'Stopped')
  			})[study.studyStatus]]),

  			// ### Actions
  			m('td', [study.$pending ? m('.l', 'Loading...') : m('.btn-group', [study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.play.bind(null, study) }, [m('i.fa.fa-play')]) : '', study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.pause.bind(null, study) }, [m('i.fa.fa-pause')]) : '', m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.edit.bind(null, study) }, [m('i.fa.fa-edit')]), m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.remove.bind(null, study, list) }, [m('i.fa.fa-close')])])])]);
  		})])])]);
  	}
  };

  // @TODO: bad idiom! should change things within the object, not the object itself.
  var thConfig = function thConfig(prop, current) {
  	return { 'data-sort-by': prop, class: current() === prop ? 'active' : '' };
  };

  function studyFilter(ctrl) {
  	return function (study) {
  		return includes(study.studyId, ctrl.globalSearch()) || includes(study.studyUrl, ctrl.globalSearch()) || includes(study.rulesUrl, ctrl.globalSearch());
  	};

  	function includes(val, search) {
  		return typeof val === 'string' && val.includes(search);
  	}
  }

  var baseUrl$1 = '/dashboard/dashboard';

  /**
   * file = {
   * 	id: #hash,
   * 	url: URL
   * }
   */

  var filePrototype = {
  	apiUrl: function apiUrl() {
  		return baseUrl$1 + '/files/' + encodeURIComponent(this.studyID) + '/file/' + encodeURIComponent(this.id);
  	},
  	get: function get() {
  		var _this = this;

  		return fetch(this.apiUrl(), { credentials: 'same-origin' }).then(checkStatus).then(toJSON).then(function (response) {
  			_this.sourceContent(response.content);
  			_this.content(response.content);
  			_this.loaded = true;
  			_this.error = false;
  		}).catch(function (reason) {
  			_this.loaded = true;
  			_this.error = true;
  			return Promise.reject(reason); // do not swallow error
  		});
  	},
  	save: function save() {
  		var _this2 = this;

  		return fetch(this.apiUrl(), {
  			credentials: 'same-origin',
  			method: 'put',
  			headers: {
  				'Accept': 'application/json',
  				'Content-Type': 'application/json'
  			},
  			body: JSON.stringify({
  				content: this.content
  			})
  		}).then(checkStatus).then(function (response) {
  			_this2.sourceContent(_this2.content()); // update source content
  			return response;
  		}).catch(catchJSON);
  	},
  	del: function del() {
  		return fetch(this.apiUrl(), { method: 'delete', credentials: 'same-origin' }).then(checkStatus);
  	},
  	hasChanged: function hasChanged() {
  		return this.sourceContent() === this.content();
  	},
  	define: function define() {
  		var context = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

  		var requirejs = context.requirejs;
  		var name = this.url;
  		var content = this.content();

  		return new Promise(function (resolve) {
  			requirejs.undef(name);
  			context.eval(content.replace('define(', 'define(\'' + name + '\','));
  			resolve();
  		});
  	},
  	require: function require() {
  		var _this3 = this;

  		var context = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

  		var requirejs = context.requirejs;
  		return new Promise(function (resolve, reject) {
  			requirejs([_this3.url], resolve, reject);
  		});
  	},
  	checkSyntax: function checkSyntax() {
  		var jshint = window.JSHINT;
  		this.syntaxValid = jshint(this.content(), jshintOptions);
  		this.syntaxData = jshint.data();
  		return this.syntaxValid;
  	}
  };

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

  var fileFactory = function fileFactory(fileObj) {
  	var file = Object.create(filePrototype);
  	var url = fileObj.url;

  	Object.assign(file, fileObj, {
  		name: url.substring(url.lastIndexOf('/') + 1),
  		type: url.substring(url.lastIndexOf('.') + 1),
  		id: fileObj.id,
  		sourceContent: m.prop(fileObj.content || ''),
  		content: contentProvider.call(file),

  		// keep track of loaded state
  		loaded: false,
  		error: false,

  		// these are defined when calling checkSyntax
  		syntaxValid: undefined,
  		syntaxData: undefined
  	});

  	file.content(fileObj.content || '');

  	if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(function (file) {
  		return Object.assign(file, { studyID: fileObj.studyID });
  	});

  	return file;

  	function contentProvider(store) {
  		var _this4 = this;

  		var prop = function prop() {
  			if (arguments.length) {
  				store = arguments[0];
  				_this4.checkSyntax();
  			}
  			return store;
  		};

  		prop.toJSON = function () {
  			return store;
  		};

  		return prop;
  	}
  };

  var baseUrl = '/dashboard/dashboard';

  var studyPrototype = {
  	apiURL: function apiURL() {
  		return baseUrl + '/files/' + encodeURIComponent(this.id);
  	},
  	get: function get() {
  		var _this = this;

  		return fetch(this.apiURL(), { credentials: 'same-origin' }).then(checkStatus).then(toJSON).then(function (study) {
  			_this.loaded = true;
  			_this.files(study.files.map(function (file) {
  				Object.assign(file, { studyID: _this.id });
  				return fileFactory(file);
  			}));
  		}).catch(function (reason) {
  			_this.error = true;
  			return Promise.reject(reason); // do not swallow error
  		});
  	},
  	getFile: function getFile(id) {
  		return getById(id, this.files());

  		function getById(id, files) {
  			var _iteratorNormalCompletion = true;
  			var _didIteratorError = false;
  			var _iteratorError = undefined;

  			try {
  				for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
  					var file = _step.value;

  					if (file.id == id) return file;
  					if (file.files) return getById(id, file.files);
  				}
  			} catch (err) {
  				_didIteratorError = true;
  				_iteratorError = err;
  			} finally {
  				try {
  					if (!_iteratorNormalCompletion && _iterator.return) {
  						_iterator.return();
  					}
  				} finally {
  					if (_didIteratorError) {
  						throw _iteratorError;
  					}
  				}
  			}
  		}
  	},
  	createFile: function createFile(name) {
  		var _this2 = this;

  		var content = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  		return fetch(this.apiURL() + '/file', {
  			method: 'post',
  			credentials: 'same-origin',
  			body: JSON.stringify({ name: name, content: content }),
  			headers: {
  				'Accept': 'application/json',
  				'Content-Type': 'application/json'
  			}
  		}).then(checkStatus).then(toJSON).then(function (response) {
  			Object.assign(response, { studyID: _this2.id, content: content });
  			var file = fileFactory(response);
  			file.loaded = true;
  			_this2.files().push(file);
  			return response;
  		}).catch(catchJSON);
  	},
  	del: function del(fileId) {
  		var _this3 = this;

  		return this.getFile(fileId).del().then(function () {
  			_this3.files(filterById(fileId, _this3.files()));

  			function filterById(id, files) {
  				return files && files.filter(function (file) {
  					return file.id !== id;
  				}).map(function (file) {
  					if (Array.isArray(file.files)) file.files = filterById(id, file.files);
  					return file;
  				});
  			}
  		});
  	}
  };

  var studyFactory = function studyFactory(id) {
  	var study = Object.create(studyPrototype);
  	Object.assign(study, {
  		id: id,
  		files: m.prop([]),
  		loaded: false,
  		error: false
  	});

  	return study;
  };

  var pdfEditor = {
  	view: function view(ctrl, args) {
  		var file = args.file;
  		return m('object', {
  			data: file.url,
  			type: 'application/pdf',
  			width: '100%',
  			height: '100%'
  		});
  	}
  };

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

  var noop$1 = function noop() {};

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
  						exec: ctrl.onSave || noop$1
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
  		file.loaded || file.get().then(m.redraw).catch(function (err) {
  			return messages.alert({
  				header: 'Loading Error',
  				content: err.message
  			});
  		});

  		var ctrl = {
  			file: file,
  			content: file.content,
  			play: play,
  			save: save
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

  		function save() {
  			file.save().catch(function (err) {
  				return messages.alert({
  					header: 'Error Saving:',
  					content: err.message
  				});
  			});
  		}
  	},

  	view: function view(ctrl, args) {
  		var file = ctrl.file;
  		return m('.editor', [!file.loaded ? m('.loader') : file.error ? m('div', { class: 'alert alert-danger' }, [m('strong', { class: 'glyphicon glyphicon-exclamation-sign' }), 'The file "' + file.url + '" was not found']) : [m('.btn-toolbar', [m('.btn-group', [ctrl.file.type === 'js' ? m('a.btn.btn-secondary', { onclick: ctrl.play }, [m('strong.fa.fa-play')]) : '', m('a.btn.btn-secondary', { onclick: ctrl.save }, [m('strong.fa.fa-save')])])]), m.component(aceComponent, { content: ctrl.content, settings: args.settings })]]);
  	}
  };

  var xmlEditor = {
  	controller: function controller(args) {
  		return {
  			file: args.file,
  			activeTab: m.prop('edit')
  		};
  	},
  	view: function view(ctrl) {
  		var file = ctrl.file;
  		var activeTab = ctrl.activeTab;
  		return m('div', [m('ul.nav.nav-tabs', [m('li.nav-item', [m('a[data-tab="edit"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'edit' }) }, 'Edit')]), m('li.nav-item', [m('a.nav-link.disabled', 'Syntax')]), m('li.nav-item', [m('a.nav-link.disabled', 'Vaildate')])]), m('.tab-content', [activeTab() == 'edit' ? m.component(editorPage, { file: file, settings: { mode: 'xml' } }) : ''])]);
  	}
  };

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
  		return m('div.img-editor.centrify', [m('img', { src: file.url })]);
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

  		return (typeof e === 'undefined' ? 'undefined' : babelHelpers_typeof(e)) == 'object' ? t(e.image) && t(e.template) : t(e);
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

  	switch (typeof value === 'undefined' ? 'undefined' : babelHelpers_typeof(value)) {
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
  		return m('div', [!file.loaded ? '' : m('ul.nav.nav-tabs', [m('li.nav-item', [m('a[data-tab="edit"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'edit' }) }, 'Edit')]), m('li.nav-item', [m('a[data-tab="syntax"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'syntax' }) }, ['Syntax ', m('span.badge.alert-danger', file.syntaxValid ? '' : file.syntaxData.errors.length)])]), m('li.nav-item', [m('a[data-tab="validate"].nav-link', { onclick: m.withAttr('data-tab', activeTab), class: classNames({ active: activeTab() == 'validate' }) }, 'Validate')])]), m('.tab-content', [activeTab() == 'edit' ? m.component(editorPage, { file: file }) : '', activeTab() == 'syntax' ? m.component(syntax, { file: file }) : '', activeTab() == 'validate' ? m.component(validateComponent, { file: file }) : ''])]);
  	}
  };

  var editors = {
  	js: jsEditor,
  	jpg: imgEditor,
  	bmp: imgEditor,
  	png: imgEditor,
  	html: jsEditor$1,
  	jst: jsEditor$1,
  	xml: xmlEditor,
  	pdf: pdfEditor
  };

  var fileEditorComponent = {
  	controller: function controller(_ref) {
  		var study = _ref.study;

  		var id = m.route.param('fileID');
  		var file = study.getFile(id);
  		var ctrl = {
  			file: file
  		};

  		return ctrl;
  	},

  	view: function view(ctrl) {
  		var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  		var file = ctrl.file;

  		return m('div', { config: fullHeight }, [file ? editors[file.type] ? m.component(editors[file.type], { file: file, settings: args.settings }) : m('.centrify', [!file.isDir ? [m('i.fa.fa-file.fa-5x'), m('h5', 'Unknow file type')] : [m('i.fa.fa-folder-open-o.fa-5x'), m('h5', 'Sub directories are not supported yet.'), m('p', 'We have a team of monkeys hacking at it as we speak...')]]) : m('.centrify', [m('i.fa.fa-smile-o.fa-5x'), m('h5', 'Please select a file to start working')])]);
  	}
  };

  // download support according to modernizer
  var downloadSupport = !window.externalHost && 'download' in document.createElement('a');

  var fileContext = function fileContext(file, study) {
  	var menu = [{ icon: 'fa-copy', text: 'Duplicate', action: function action() {
  			return messages.alert({ header: 'Duplicate: ' + file.name, content: 'Duplicate has not been implemented yet' });
  		} }, { separator: true }, { icon: 'fa-download', text: 'Download', action: downloadFile },
  	// {icon:'fa-clipboard', text:'Copy Url', action: () => alert('copy')},
  	{ icon: 'fa-close', text: 'Delete', action: deleteFile }];
  	return contextMenuComponent.open(menu);

  	function downloadFile() {
  		if (downloadSupport) {
  			var link = document.createElement('a');
  			link.href = file.url;
  			link.download = file.name;
  			link.target = '_blank';
  			document.body.appendChild(link);
  			link.click();
  			document.body.removeChild(link);
  		} else {
  			var win = window.open(file.url, '_blank');
  			win.focus();
  		}
  	}

  	function deleteFile() {
  		messages.confirm({
  			header: ['Delete ', m('small', file.name)],
  			content: 'Are you sure you want to delete this file? This action is permanent!'
  		}).then(function (ok) {
  			if (ok) return study.del(file.id);
  		}).then(m.redraw).catch(function (err) {
  			throw err;
  			err.response.json().then(function (response) {
  				messages.alert({
  					header: 'Delete failed:',
  					content: response.message
  				});
  			});

  			return err;
  		});
  	} // end delete file
  };

  var nodeComponent = {
  	controller: function controller(_ref) {
  		var file = _ref.file;

  		return {
  			isCurrent: m.route.param('fileID') === file.id
  		};
  	},
  	view: function view(ctrl, _ref2) {
  		var file = _ref2.file;
  		var study = _ref2.study;
  		var filesVM = _ref2.filesVM;

  		var vm = filesVM(file.id); // vm is created by the study component, it exposes a "isOpen" and "isChanged" properties
  		return m('li.file-node', {
  			key: file.id,
  			class: classNames({
  				open: vm.isOpen()
  			}),
  			onclick: file.isDir ? function () {
  				return vm.isOpen(!vm.isOpen());
  			} : choose(file),
  			oncontextmenu: fileContext(file, study)
  		}, [m('a.wholerow', {
  			unselectable: 'on',
  			class: classNames({
  				'current': ctrl.isCurrent
  			})
  		}, m.trust('&nbsp;')), m('i.fa.fa-fw', {
  			class: classNames({
  				'fa-caret-right': file.isDir && !vm.isOpen(),
  				'fa-caret-down': file.isDir && vm.isOpen()
  			})
  		}), m('a', [m('i.fa.fa-fw.fa-file-o', {
  			class: classNames({
  				'fa-file-code-o': /(js)$/.test(file.type),
  				'fa-file-text-o': /(jst|html|xml)$/.test(file.type),
  				'fa-file-image-o': /(jpg|png|bmp)$/.test(file.type),
  				'fa-file-pdf-o': /(pdf)$/.test(file.type),
  				'fa-folder-o': file.isDir
  			})
  		}), ' ' + file.name, file.isDir ? m.component(filesComponent, { study: study, filesVM: filesVM, files: file.files }) : ''])]);
  	}
  };

  var choose = function choose(file) {
  	return function (e) {
  		e.stopPropagation();
  		e.preventDefault();
  		m.route('/editor/' + file.studyID + '/' + encodeURIComponent(file.id));
  	};
  };

  var filesComponent = {
  	view: function view(ctrl, _ref) {
  		var study = _ref.study;
  		var files = _ref.files;
  		var filesVM = _ref.filesVM;

  		return m('.files', [m('ul', files.map(function (file) {
  			return m.component(nodeComponent, { file: file, study: study, key: file.id, filesVM: filesVM });
  		}))]);
  	}
  };

  var pipWizard = function pipWizard(_ref) {
  	var name = _ref.name;
  	var content = _ref.content;

  	return messages.prompt({
  		header: 'Create PIP',
  		content: 'Please insert the file name:',
  		prop: name
  	}).then(function (response) {
  		if (response) {
  			content(template());
  		}
  		return response;
  	});
  };

  var template = function template() {
  	return 'define([\'pipAPI\',\'pipScorer\'], function(APIConstructor,Scorer) {\n\n\tvar API = new APIConstructor();\n\tvar scorer = new Scorer();\n\n\t// add something to the current object\n\tAPI.addCurrent({});\n\n\t// set the base urls for images and templates\n\tAPI.addSettings(\'base_url\',{\n\t\timage : \'/my/folder/images\',\n\t\ttemplate : \'/my/folder/templates\'\n\t});\n\n\t// base trial\n\tAPI.addTrialSets(\'base\',{\n\t\tinput: [\n\t\t\t{handle:\'space\',on:\'space\'}\n\t\t],\n\n\t\tstimuli: [\n\t\t\t{media: \'Hellow World!!\'}\n\t\t],\n\n\t\tinteractions: [\n\t\t\t{\n\t\t\t\tconditions: [\n\t\t\t\t\t{type:\'begin\'}\n\t\t\t\t],\n\t\t\t\tactions: [\n\t\t\t\t\t{type:\'showStim\',handle:\'All\'}\n\t\t\t\t]\n\t\t\t},\n\t\t\t{\n\t\t\t\tconditions: [\n\t\t\t\t\t{type:\'inputEquals\',value:\'space\'}\n\t\t\t\t],\n\t\t\t\tactions: [\n\t\t\t\t\t{type:\'endTrial\'}\n\t\t\t\t]\n\t\t\t}\n\t\t]\n\t});\n\n\tAPI.addSequence([\n\t\t{\n\t\t\tmixer: \'random\',\n\t\t\tdata: [\n\t\t\t\t{\n\t\t\t\t\tmixer: \'repeat\',\n\t\t\t\t\ttimes: 10,\n\t\t\t\t\tdata: [\n\t\t\t\t\t\t{inherit:\'base\'}\n\t\t\t\t\t]\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t]);\n\n\treturn API.script;\n});';
  };

  var questWizard = function questWizard(_ref) {
  	var name = _ref.name;
  	var content = _ref.content;

  	return messages.prompt({
  		header: 'Create piQuest',
  		content: 'Please insert the file name:',
  		prop: name
  	}).then(function (response) {
  		if (response) {
  			content(template$1());
  		}
  		return response;
  	});
  };

  var template$1 = function template() {
  	return 'define([\'questAPI\'], function(Quest){\n\n\tvar API = new Quest();\n\n\tAPI.addSequence([\n\t\t{\n\t\t\theader: \'Hello World\',\n\t\t\tquestions: [\n\t\t\t\t{\n\t\t\t\t\tname: \'pickaname\',\n\t\t\t\t\ttype: \'selectOne\',\n\t\t\t\t\tstem: \'What is you favorite color?\',\n\t\t\t\t\tanswers: [\'red\', \'blue\', \'green\']\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t]);\n\n\treturn API.script;\n});';
  };

  var managerWizard = function managerWizard(_ref) {
  	var name = _ref.name;
  	var content = _ref.content;

  	return messages.prompt({
  		header: 'Create piManager',
  		content: 'Please insert the file name:',
  		prop: name
  	}).then(function (response) {
  		if (response) {
  			content(template$2());
  		}
  		return response;
  	});
  };

  var template$2 = function template() {
  	return 'define([\'managerAPI\'], function(Manager){\n\n    var API = new Manager();\n\n    API.addSequence([\n        {type:\'message\', template:\'<h1>Hellow world</h1>\', keys: \' \'}\n    ]);\n\n    return API.script;\n});';
  };

  var sidebarButtons = {
  	controller: function controller(_ref) {
  		var study = _ref.study;

  		var ctrl = {
  			newOpen: false,
  			toggleNew: function toggleNew() {
  				return ctrl.newOpen = !ctrl.newOpen;
  			},
  			createEmpty: createEmpty,
  			createPIP: createPIP,
  			createQuest: createQuest,
  			createManager: createManager
  		};

  		return ctrl;

  		function create(name, content) {
  			return function (response) {
  				if (response) {
  					study.createFile(name(), content()).then(function (response) {
  						m.route('/editor/' + study.id + '/' + response.id);
  						return response;
  					}).catch(function (err) {
  						return messages.alert({
  							heaser: 'Failed to create file:',
  							content: err.message
  						});
  					});
  				}
  			};
  		}

  		function createEmpty() {
  			var name = m.prop();
  			var content = function content() {
  				return '';
  			};

  			messages.prompt({
  				header: 'Create file',
  				content: 'Please insert the file name:',
  				prop: name
  			}).then(create(name, content));
  		}

  		function createPIP() {
  			var name = m.prop();
  			var content = m.prop();
  			pipWizard({ name: name, content: content }).then(create(name, content));
  		}

  		function createQuest() {
  			var name = m.prop();
  			var content = m.prop();
  			questWizard({ name: name, content: content }).then(create(name, content));
  		}

  		function createManager() {
  			var name = m.prop();
  			var content = m.prop();
  			managerWizard({ name: name, content: content }).then(create(name, content));
  		}
  	},

  	view: function view(ctrl) {
  		return m('.btn-group', { class: ctrl.newOpen ? 'open' : '' }, [m('.btn.btn-sm.btn-secondary', { onclick: ctrl.createEmpty }, [m('i.fa.fa-plus'), ' New']), m('.btn.btn-sm.btn-secondary.dropdown-toggle', { onclick: ctrl.toggleNew }), m('.dropdown-menu', { onclick: ctrl.toggleNew }, [m('a.dropdown-item', { onclick: ctrl.createPIP }, 'piPlayer'), m('a.dropdown-item', { onclick: ctrl.createQuest }, 'piQuest'), m('a.dropdown-item', { onclick: ctrl.createManager }, 'piManager')])]);
  	}
  };

  var sidebarComponent = {
  	view: function view(ctrl, _ref) {
  		var study = _ref.study;
  		var filesVM = _ref.filesVM;

  		return m('.sidebar', [m('h5', study.id), m.component(sidebarButtons, { study: study }), m.component(filesComponent, { study: study, filesVM: filesVM, files: study.files() })]);
  	}
  };

  var study = undefined;
  var filesVM = undefined;
  var editorLayoutComponent = {
  	controller: function controller() {
  		var id = m.route.param('studyID');
  		if (!study || study.id !== id) {
  			study = studyFactory(id);
  			study.get().then(m.redraw);
  		}

  		if (!filesVM) filesVM = viewModelMap({
  			isOpen: m.prop(false),
  			isChanged: m.prop(false)
  		});

  		var ctrl = { study: study, filesVM: filesVM };

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var study = ctrl.study;
  		var filesVM = ctrl.filesVM;
  		return m('.row.study', [study.loaded ? [m('.col-md-2', [m.component(sidebarComponent, { study: study, filesVM: filesVM })]), m('.col-md-10', [m.component(fileEditorComponent, { study: study, filesVM: filesVM })])] : '']);
  	}
  };

  // http://lhorie.github.io/mithril-blog/mapping-view-models.html
  var viewModelMap = function viewModelMap(signature) {
  	var map = {};
  	return function (key) {
  		if (!map[key]) {
  			map[key] = {};
  			for (var prop in signature) {
  				map[key][prop] = m.prop(signature[prop]());
  			}
  		}
  		return map[key];
  	};
  };

  var mainComponent = {
  	controller: function controller() {
  		var ctrl = {
  			studies: m.prop(),
  			loaded: false
  		};
  		fetch('/dashboard/dashboard/studies', { credentials: 'same-origin' }).then(checkStatus).then(toJSON).then(ctrl.studies).then(function () {
  			return ctrl.loaded = true;
  		}).then(m.redraw);

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		return m('.container', [m('h3', 'My studies'), !ctrl.loaded ? m('.loader') : m('.list-group', ctrl.studies().studies.map(function (study) {
  			return m('a.list-group-item', {
  				href: '/editor/' + study.id,
  				config: m.route
  			}, study.name);
  		}))]);
  	}
  };

  var routes = {
  	'studies': mainComponent,
  	'/editor/:studyID': editorLayoutComponent,
  	'/editor/:studyID/:fileID': editorLayoutComponent,
  	'/pool': poolComponent,
  	'/downloads': downloadsComponent
  };

  var wrappedRoutes = mapObject(routes, layout);
  m.route(document.body, 'studies', wrappedRoutes);

  /**
   * Map Object
   * A utility function to transform objects
   * @param  {Object} 	obj 	The object to transform
   * @param  {Function} 	cb 		The transforming function
   * @return {Object}        [description]
   *
   * Signature:
   *
   * Object mapObject(Object obj, callbackFunction cb)
   *
   * where:
   * 	callbackFunction :: any Function(any value, String key, Object object)
   */
  function mapObject(obj, cb) {
    return Object.keys(obj).reduce(function (result, key) {
      result[key] = cb(obj[key], key, obj);
      return result;
    }, {});
  }

})();
//# sourceMappingURL=main.js.map
