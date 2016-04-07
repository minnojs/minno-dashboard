(function () {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  babelHelpers;

  var checkStatus = function checkStatus(response) {

  	if (response.status >= 200 && response.status < 300) {
  		return response;
  	}

  	var error = new Error(response.statusText);

  	error.response = response;

  	throw error;
  };

  var toJSON = function toJSON(response) {
  	return response.json().catch();
  };

  // extract info from status error
  var catchJSON = function catchJSON(err) {
  	return (err.response ? err.response.json() : Promise.reject()).catch(function () {
  		return Promise.reject(err);
  	}).then(function (json) {
  		return Promise.reject(json);
  	});
  };

  function fetchVoid(url) {
  	var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  	var opts = Object.assign({
  		credentials: 'same-origin',
  		headers: {
  			'Accept': 'application/json',
  			'Content-Type': 'application/json'
  		}
  	}, options);

  	opts.body = JSON.stringify(options.body);
  	return fetch(url, opts).then(checkStatus).catch(catchJSON);
  }

  function fetchJson(url, options) {
  	return fetchVoid(url, options).then(toJSON);
  }

  function fetchText(url, options) {
  	return fetchVoid(url, options).then(function (response) {
  		return response.text();
  	});
  }

  function fetchUpload(url, options) {
  	var opts = Object.assign({
  		credentials: 'same-origin'
  	}, options);

  	return fetch(url, opts).then(checkStatus).then(toJSON).catch(catchJSON);
  }

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

  var jshintOptions = {
  	// JSHint Default Configuration File (as on JSHint website)
  	// See http://jshint.com/docs/ for more details

  	'curly': false, // true: Require {} for every new block or scope
  	'latedef': 'nofunc', // true: Require variables/functions to be defined before being used
  	'undef': true, // true: Require all non-global variables to be declared (prevents global leaks)
  	'unused': 'vars', // Unused variables:
  	'strict': false, // true: Requires all functions run in ES5 Strict Mode

  	'browser': true, // Web Browser (window, document, etc)
  	'devel': true, // Development/debugging (alert, confirm, etc)

  	esversion: 3, // Require es3 syntax for backward compatibility

  	// Custom Globals
  	predef: ['piGlobal', 'define', 'require', 'requirejs', 'angular']
  };

  var baseUrl$1 = '/dashboard/dashboard';

  var filePrototype = {
  	apiUrl: function apiUrl() {
  		return baseUrl$1 + '/files/' + encodeURIComponent(this.studyId) + '/file/' + encodeURIComponent(this.id);
  	},
  	get: function get() {
  		var _this = this;

  		return fetchJson(this.apiUrl()).then(function (response) {
  			var content = response.content.replace(/\r\n?|\n?$/g, '\n'); // replace carriage returns and add new line to EOF. this makes sure all files are unix encoded...
  			_this.sourceContent(content);
  			_this.content(content);
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

  		return fetchVoid(this.apiUrl(), {
  			method: 'put',
  			body: { content: this.content }
  		}).then(function (response) {
  			_this2.sourceContent(_this2.content()); // update source content
  			return response;
  		});
  	},
  	move: function move(path, study) {
  		var _this3 = this;

  		var basePath = path.substring(0, path.lastIndexOf('/'));
  		var folderExists = basePath === '' || study.files().some(function (f) {
  			return f.isDir && f.path === basePath;
  		});

  		if (!folderExists) return Promise.reject({ message: 'Folder ' + basePath + ' does not exist.' });
  		if (study.files().some(function (f) {
  			return f.path === path;
  		})) return Promise.reject({ message: 'File ' + path + ' already exists.' });

  		var oldPath = this.path;
  		this.setPath(path);
  		return fetchJson(this.apiUrl() + '/move/', {
  			method: 'put',
  			body: { path: path }
  		}).then(function (response) {
  			_this3.id = response.id;
  			_this3.url = response.url;
  		}).catch(function (response) {
  			_this3.setPath(oldPath);
  			return Promise.reject(response);
  		});
  	},
  	del: function del() {
  		return fetchVoid(this.apiUrl(), { method: 'delete' });
  	},
  	hasChanged: function hasChanged() {
  		return this.sourceContent() !== this.content();
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
  		var _this4 = this;

  		var context = arguments.length <= 0 || arguments[0] === undefined ? window : arguments[0];

  		var requirejs = context.requirejs;
  		return new Promise(function (resolve, reject) {
  			requirejs([_this4.url], resolve, reject);
  		});
  	},
  	checkSyntax: function checkSyntax() {
  		var jshint = window.JSHINT;
  		this.syntaxValid = jshint(this.content(), jshintOptions);
  		this.syntaxData = jshint.data();
  		return this.syntaxValid;
  	},
  	setPath: function setPath() {
  		var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  		this.path = path;
  		this.name = path.substring(path.lastIndexOf('/') + 1);
  		this.basePath = path.substring(0, path.lastIndexOf('/')) + '/';
  		this.type = path.substring(path.lastIndexOf('.') + 1).toLowerCase();
  	}
  };

  /**
   * fileObj = {
   * 	id: #hash,
   *	path: path, 	
   * 	url: URL
   * }
   */

  var fileFactory = function fileFactory(fileObj) {
  	var file = Object.create(filePrototype);
  	var path = decodeURIComponent(fileObj.path);

  	file.setPath(path);

  	Object.assign(file, fileObj, {
  		id: fileObj.id,
  		sourceContent: m.prop(fileObj.content || ''),
  		content: contentProvider.call(file, fileObj.content || ''), // custom m.prop, alows checking syntax on change

  		// keep track of loaded state
  		loaded: false,
  		error: false,

  		// these are defined when calling checkSyntax
  		syntaxValid: undefined,
  		syntaxData: undefined
  	});

  	file.content(fileObj.content || '');

  	if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(function (file) {
  		return Object.assign(file, { studyId: fileObj.studyId });
  	});

  	return file;

  	function contentProvider(store) {
  		var _this5 = this;

  		var prop = function prop() {
  			if (arguments.length) {
  				store = arguments.length <= 0 ? undefined : arguments[0];
  				_this5.type === 'js' && _this5.checkSyntax();
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
  		var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

  		return baseUrl + '/files/' + encodeURIComponent(this.id) + path;
  	},
  	get: function get() {
  		var _this = this;

  		return fetchJson(this.apiURL()).then(function (study) {
  			_this.loaded = true;
  			var files = flattenFiles(study.files).map(assignStudyId(_this.id)).map(fileFactory);

  			_this.files(files);
  			_this.sort();
  		}).catch(function (reason) {
  			_this.error = true;
  			return Promise.reject(reason); // do not swallow error
  		});

  		function flattenFiles(files) {
  			var _ref;

  			return files ? (_ref = []).concat.apply(_ref, babelHelpers.toConsumableArray(files.map(spreadFile))) : [];
  		}

  		function assignStudyId(id) {
  			return function (f) {
  				return Object.assign(f, { studyId: id });
  			};
  		}

  		function spreadFile(file) {
  			return [file].concat(babelHelpers.toConsumableArray(flattenFiles(file.files)));
  		}
  	},
  	getFile: function getFile(id) {
  		return this.files().find(function (f) {
  			return f.id === id;
  		});
  	},
  	createFile: function createFile(_ref2) {
  		var _this2 = this;

  		var name = _ref2.name;
  		var _ref2$content = _ref2.content;
  		var content = _ref2$content === undefined ? '' : _ref2$content;
  		var isDir = _ref2.isDir;

  		// validation (make sure there are no invalid characters)
  		if (/[^\/-_.A-Za-z0-9]/.test(name)) return Promise.reject({ message: 'The file name "' + name + '" is not valid' });

  		// validation (make sure file does not already exist)
  		var exists = this.files().some(function (file) {
  			return file.path === name;
  		});
  		if (exists) return Promise.reject({ message: 'The file "' + name + '" already exists' });

  		// validateion (make sure direcotry exists)
  		var basePath = name.substring(0, name.lastIndexOf('/')).replace(/^\//, '');
  		var dirExists = basePath === '' || this.files().some(function (file) {
  			return file.isDir && file.path === basePath;
  		});
  		if (!dirExists) return Promise.reject({ message: 'The directory "' + basePath + '" does not exist' });

  		return fetchJson(this.apiURL('/file'), { method: 'post', body: { name: name, content: content, isDir: isDir } }).then(function (response) {
  			Object.assign(response, { studyId: _this2.id, content: content, path: name, isDir: isDir });
  			var file = fileFactory(response);
  			file.loaded = true;
  			_this2.files().push(file);
  			return response;
  		}).then(this.sort.bind(this));
  	},
  	sort: function sort(response) {
  		var files = this.files().sort(sort);
  		this.files(files);
  		return response;

  		function sort(a, b) {
  			// sort by isDir then name
  			var nameA = +!a.isDir + a.name.toLowerCase(),
  			    nameB = +!b.isDir + b.name.toLowerCase();
  			if (nameA < nameB) return -1; //sort string ascending
  			if (nameA > nameB) return 1;
  			return 0; //default return value (no sorting)
  		}
  	},
  	uploadFiles: function uploadFiles(path, files) {
  		var _this3 = this;

  		var paths = Array.from(files, function (file) {
  			return path === '/' ? file.name : path + '/' + file.name;
  		});
  		var formData = buildFormData(path === '/' ? '' : path, files);
  		// validation (make sure files do not already exist)
  		var exists = this.files().find(function (file) {
  			return paths.includes(file.path);
  		});
  		if (exists) return Promise.reject({ message: 'The file "' + exists.path + '" already exists' });

  		return fetchUpload(this.apiURL('/upload/' + (path === '/' ? '' : path)), { method: 'post', body: formData }).then(function (response) {
  			response.forEach(function (src) {
  				var file = fileFactory(Object.assign({ studyId: _this3.id }, src));
  				_this3.files().push(file);
  			});

  			return response;
  		}).then(this.sort.bind(this));

  		function buildFormData(path, files) {
  			var formData = new FormData();
  			// formData.append('path', path);

  			// for (let file in files) {
  			// 	formData.append('files', files[file]);
  			// }

  			for (var i = 0; i < files.length; i++) {
  				formData.append(i, files[i]);
  			}

  			return formData;
  		}
  	},
  	del: function del(fileId) {
  		var _this4 = this;

  		var file = this.getFile(fileId);
  		return file.del().then(function () {
  			var files = _this4.files().filter(function (f) {
  				return f.path.indexOf(file.path) !== 0;
  			}); // all paths that start with the same path are deleted
  			_this4.files(files);
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

  var imgEditor = function imgEditor(_ref) {
  	var file = _ref.file;
  	return m('div.img-editor.centrify', [m('img', { src: file.url })]);
  };

  var pdfEditor = function pdfEditor(_ref) {
  	var file = _ref.file;
  	return m('object', {
  		data: file.url,
  		type: 'application/pdf',
  		width: '100%',
  		height: '100%'
  	});
  };

  var unknownComponent = function unknownComponent() {
  	return m('.centrify', [m('i.fa.fa-file.fa-5x'), m('h5', 'Unknow file type')]);
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
  		return m('#messages.backdrop', [!vm || !vm.isOpen ? '' : [m('.overlay', { config: messages.config() }), m('.backdrop-content', { onclick: close }, [m('.card', { class: vm.opts.wide ? 'col-sm-8' : 'col-sm-5', config: maxHeight }, [m('.card-block', { onclick: stopPropagation }, [messages.views[vm.type](vm.opts)])])])]]);
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
  			var prop = opts.prop || noop;
  			return [m('h4', opts.header), m('.card-text', opts.content), m('.card-block', [m('input.form-control', {
  				key: 'prompt',
  				value: prop(),
  				onchange: m.withAttr('value', prop),
  				config: function config(element, isInitialized) {
  					if (!isInitialized) element.focus();
  				}
  			})]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: close(null) }, opts.okText || 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: close(true) }, opts.okText || 'OK')])];
  		}
  	}
  };

  // set message max height, so that content can scroll within it.
  var maxHeight = function maxHeight(element, isInitialized, ctx) {
  	if (!isInitialized) {
  		onResize();

  		window.addEventListener('resize', onResize, true);

  		ctx.onunload = function () {
  			window.removeEventListener('resize', onResize);
  		};
  	}

  	function onResize() {
  		element.style.maxHeight = document.documentElement.clientHeight * 0.9 + 'px';
  	}
  };

  var uploadFiles = function uploadFiles(path, study) {
  	return function (files) {
  		study.uploadFiles(path, files).catch(function (response) {
  			return messages.alert({
  				header: 'Upload File',
  				content: response.message
  			});
  		}).then(m.redraw);
  	};
  };

  var moveFile = function moveFile(file, study) {
  	return function () {
  		var newPath = m.prop(file.path);
  		return messages.prompt({
  			header: 'Move/Rename File',
  			prop: newPath
  		}).then(function (response) {
  			if (response) return moveAction(file, study);
  		});

  		function moveAction(file, study) {
  			var def = file.move(newPath(), study) // the actual movement
  			.catch(function (response) {
  				return messages.alert({
  					header: 'Move/Rename File',
  					content: response.message
  				});
  			}).then(m.redraw); // redraw after server response

  			m.redraw();
  			return def;
  		}
  	};
  };

  var play = function play(file) {
  	return function () {
  		var playground = undefined;

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
  	};
  };

  var save = function save(file) {
  	return function () {
  		file.save().then(m.redraw).catch(function (err) {
  			return messages.alert({
  				header: 'Error Saving:',
  				content: err.message
  			});
  		});
  	};
  };

  var copyUrl = function copyUrl(file) {
  	return function () {
  		var input = document.createElement('input');
  		input.value = file.url;
  		document.body.appendChild(input);
  		input.select();
  		if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
  			messages.alert({
  				header: 'Copy URL',
  				content: m('.card-block', [m('.form-group', [m('label', 'Copy Url by clicking Ctrl + C'), m('input.form-control', {
  					config: function config(el) {
  						return el.select();
  					},
  					value: file.url
  				})])])
  			});
  		}

  		try {
  			document.execCommand('copy');
  		} catch (err) {
  			messages.alert({
  				header: 'Copy URL',
  				content: 'Copying the URL has failed.'
  			});
  		}

  		input.parentNode.removeChild(input);
  	};
  };

  // add trailing slash if needed, and then remove proceeding slash
  // return prop
  var pathProp = function pathProp(path) {
  	return m.prop(path.replace(/\/?$/, '/').replace(/^\//, ''));
  };

  var createFile = function createFile(study, name, content) {
  	study.createFile({ name: name(), content: content() }).then(function (response) {
  		m.route('/editor/' + study.id + '/file/' + encodeURIComponent(response.id));
  		return response;
  	}).catch(function (err) {
  		return messages.alert({
  			header: 'Failed to create file:',
  			content: err.message
  		});
  	});
  };

  var createDir = function createDir(study) {
  	var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  	return function () {
  		var name = pathProp(path);

  		messages.prompt({
  			header: 'Create Directory',
  			content: 'Please insert directory name',
  			prop: name
  		}).then(function (response) {
  			if (response) return study.createFile({ name: name(), isDir: true });
  		}).then(m.redraw).catch(function (err) {
  			return messages.alert({
  				header: 'Failed to create directory:',
  				content: err.message
  			});
  		});
  	};
  };

  var createEmpty = function createEmpty(study) {
  	var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  	return function () {
  		var name = pathProp(path);
  		var content = function content() {
  			return '';
  		};

  		messages.prompt({
  			header: 'Create file',
  			content: 'Please insert the file name:',
  			prop: name
  		}).then(function (response) {
  			if (response) return createFile(study, name, content);
  		});
  	};
  };

  var ace = function ace(args) {
  	return m.component(aceComponent, args);
  };

  var noop$1 = function noop() {};

  var aceComponent = {
  	view: function editorView(ctrl, args) {
  		return m('.editor', { config: aceComponent.config(args) });
  	},

  	config: function config(_ref) {
  		var content = _ref.content;
  		var observer = _ref.observer;
  		var _ref$settings = _ref.settings;
  		var settings = _ref$settings === undefined ? {} : _ref$settings;

  		return function (element, isInitialized, ctx) {
  			var editor = undefined;
  			var mode = settings.mode || 'javascript';
  			var paste = function paste(text) {
  				if (editor) {
  					editor.insert(text);
  					editor.focus();
  				}
  			};

  			if (!isInitialized) {
  				fullHeight(element, isInitialized, ctx);

  				require(['ace/ace'], function (ace) {
  					ace.config.set('packaged', true);
  					ace.config.set('basePath', require.toUrl('ace'));

  					editor = ctx.editor = ace.edit(element);
  					var session = editor.getSession();
  					var commands = editor.commands;

  					editor.setTheme('ace/theme/cobalt');
  					session.setMode('ace/mode/' + mode);
  					if (mode !== 'javascript') session.setUseWorker(false);
  					editor.setHighlightActiveLine(true);
  					editor.setShowPrintMargin(false);
  					editor.setFontSize('18px');
  					editor.$blockScrolling = Infinity; // scroll to top

  					// set jshintOptions
  					editor.session.on('changeMode', function (e, session) {
  						if (session.getMode().$id === 'ace/mode/javascript' && !!session.$worker && settings.jshintOptions) {
  							session.$worker.send('setOptions', [settings.jshintOptions]);
  						}
  					});

  					session.on('change', function () {
  						content(editor.getValue());
  						m.redraw();
  					});

  					commands.addCommand({
  						name: 'save',
  						bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
  						exec: settings.onSave || noop$1
  					});

  					if (observer) observer.on('paste', paste);

  					setContent();
  					session.setUndoManager(new ace.UndoManager()); // reset undo manager so that ctrl+z doesn't erase file
  					editor.focus();

  					ctx.onunload = function () {
  						editor.destroy();
  						if (observer) observer.off(paste);
  					};
  				});
  			}

  			// each redraw set content from model (the function makes sure that this is not done when not needed...)
  			setContent();

  			function setContent() {
  				var editor = ctx.editor;
  				if (!editor) return;

  				// this should trigger only drastic changes such as the first time the editor is set
  				if (editor.getValue() !== content()) {
  					editor.setValue(content());
  					editor.moveCursorTo(0, 0);
  					editor.focus();
  				}
  			}
  		};
  	}
  };

  function observer() {
  	var channels = {};
  	return {
  		on: function on(channel, cb) {
  			channels[channel] || (channels[channel] = []);
  			channels[channel].push(cb);
  		},
  		off: function off(cb) {
  			for (var channel in channels) {
  				var index = channels[channel].indexOf(cb);
  				if (index > -1) channels[channel].splice(index, 1);
  			}
  		},
  		trigger: function trigger(channel) {
  			for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  				args[_key - 1] = arguments[_key];
  			}

  			if (!channels[channel]) return;
  			channels[channel].forEach(function (cb) {
  				return cb.apply(null, args);
  			});
  		}
  	};
  }

  var syntax = function syntax(args) {
  	return m.component(syntaxComponent, args);
  };

  /**
   * Syntax component
   * Takes an argument as follows:
   *
   * {valid: Boolean, data: jshint(script).data()}
   */
  var syntaxComponent = {

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

  	controller: function controller(args) {
  		var file = args.file;
  		return syntaxComponent.analize(file.syntaxValid, file.syntaxData);
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

  function validate$1(script) {
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

  var validate = function validate(args) {
  	return m.component(validateComponent, args);
  };

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
  			ctrl.validations(validate$1(script, file.url));
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

  var textMenuView = function textMenuView(_ref) {
  	var mode = _ref.mode;
  	var file = _ref.file;
  	var observer = _ref.observer;

  	var setMode = function setMode(value) {
  		return function () {
  			return mode(value);
  		};
  	};
  	var modeClass = function modeClass(value) {
  		return mode() === value ? 'active' : '';
  	};
  	var isJs = file.type === 'js';

  	return m('.btn-toolbar.editor-menu', [m('.file-name', { class: file.hasChanged() ? 'text-danger' : '' }, m('span', { class: file.hasChanged() ? '' : 'invisible' }, '*'), file.path), !isJs ? '' : m('.btn-group.btn-group-sm.pull-xs-right', [m('a.btn.btn-secondary', { onclick: setMode('edit'), class: modeClass('edit') }, [m('strong', 'Edit')]), m('a.btn.btn-secondary', { onclick: setMode('syntax'), class: modeClass('syntax') }, [m('strong', 'Syntax ', file.syntaxValid ? m('i.fa.fa-check-square.text-success') : m('span.label.label-danger', file.syntaxData.errors.length))])
  	//m('a.btn.btn-secondary', {onclick: setMode('validator'), class: modeClass('validator')},[
  	//	m('strong','Validator')
  	//])
  	]), m('.btn-group.btn-group-sm.pull-xs-right', [m('a.btn.btn-secondary', { onclick: function onclick() {
  			return observer.trigger('paste', '<%= %>');
  		}, title: 'Paste a template wizard' }, [m('strong.fa.fa-percent')])]), m('.btn-group.btn-group-sm.pull-xs-right', [!isJs ? '' : m('a.btn.btn-secondary', { onclick: play(file), title: 'Play this task' }, [m('strong.fa.fa-play')]), m('a.btn.btn-secondary', { onclick: save(file), title: 'Save (ctrl+s)', class: file.hasChanged() ? 'btn-danger-outline' : '' }, [m('strong.fa.fa-save')])])]);
  };

  var textEditor = function textEditor(args) {
  	return m.component(textEditorComponent, args);
  };

  var textEditorComponent = {
  	controller: function controller(_ref) {
  		var file = _ref.file;

  		file.loaded || file.get().then(m.redraw).catch(m.redraw);

  		var ctrl = { mode: m.prop('edit'), observer: observer() };

  		return ctrl;
  	},

  	view: function view(ctrl, _ref2) {
  		var file = _ref2.file;

  		var observer = ctrl.observer;

  		if (!file.loaded) return m('.loader');

  		if (file.error) return m('div', { class: 'alert alert-danger' }, [m('strong', { class: 'glyphicon glyphicon-exclamation-sign' }), 'The file "' + file.path + '" was not found']);

  		return m('.editor', [textMenuView({ mode: ctrl.mode, file: file, observer: observer }), textContent(ctrl, { file: file, observer: observer })]);
  	}
  };

  var textContent = function textContent(ctrl, _ref3) {
  	var file = _ref3.file;
  	var observer = _ref3.observer;

  	var textMode = modeMap[file.type] || 'javascript';
  	switch (ctrl.mode()) {
  		case 'edit':
  			return ace({ content: file.content, observer: observer, settings: { onSave: save(file), mode: textMode, jshintOptions: jshintOptions } });
  		case 'validator':
  			return validate({ file: file });
  		case 'syntax':
  			return syntax({ file: file });
  	}
  };

  var modeMap = {
  	js: 'javascript',
  	jst: 'ejs',
  	html: 'ejs',
  	htm: 'ejs',
  	xml: 'xml'
  };

  var editors = {
  	js: textEditor,
  	html: textEditor,
  	htm: textEditor,
  	jst: textEditor,
  	xml: textEditor,

  	jpg: imgEditor,
  	bmp: imgEditor,
  	png: imgEditor,

  	pdf: pdfEditor
  };

  var fileEditorComponent = {
  	controller: function controller(_ref) {
  		var study = _ref.study;

  		var id = m.route.param('fileID');
  		var file = study.getFile(id);
  		var ctrl = { file: file };

  		return ctrl;
  	},

  	view: function view(ctrl) {
  		var args = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  		var file = ctrl.file;
  		var editor = file && editors[file.type] || unknownComponent;

  		return m('div', { config: fullHeight }, [file ? editor({ file: file, settings: args.settings }) : m('.centrify', [m('i.fa.fa-smile-o.fa-5x'), m('h5', 'Please select a file to start working')])]);
  	}
  };

  function formFactory() {
  	var validationHash = [];
  	return {
  		register: function register(fn) {
  			validationHash.push(fn);
  		},
  		isValid: function isValid() {
  			return validationHash.every(function (fn) {
  				return fn.call();
  			});
  		},

  		showValidation: m.prop(false)
  	};
  }

  var viewWrapper = function viewWrapper(view) {
  	var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  	return function (ctrl, args) {
  		var isValid = !ctrl.validity || ctrl.validity();
  		var groupClass = undefined;
  		var inputClass = undefined;
  		var _opts$isFormControl = opts.isFormControl;
  		var isFormControl = _opts$isFormControl === undefined ? true : _opts$isFormControl;

  		if (ctrl.showValidation && ctrl.showValidation() && !isValid) {
  			groupClass = isValid ? 'has-success' : 'has-danger';
  			inputClass = isValid ? 'form-controll-success' : 'form-control-error';
  		}

  		return m('.form-group.row', { class: groupClass }, [m('label.col-sm-2', { class: isFormControl ? 'form-control-label' : '' }, args.label), m('.col-sm-10', [view(ctrl, args, { inputClass: inputClass })]), args.help && m('small.text-muted.col-sm-offset-2.col-sm-10.m-y-0', args.help)]);
  	};
  };

  var textInput = function textInput(args) {
  	return m.component(textInputComponent, args);
  };
  var textInputComponent = {
  	controller: function controller(_ref) {
  		var prop = _ref.prop;
  		var form = _ref.form;
  		var _ref$required = _ref.required;
  		var required = _ref$required === undefined ? false : _ref$required;

  		if (!form) throw new Error('Text input requires a form');

  		var validity = function validity() {
  			return !required || prop().length;
  		};
  		form.register(validity);

  		return { validity: validity, showValidation: form.showValidation };
  	},

  	view: viewWrapper(function (ctrl, _ref2, _ref3) {
  		var prop = _ref2.prop;
  		var _ref2$isArea = _ref2.isArea;
  		var isArea = _ref2$isArea === undefined ? false : _ref2$isArea;
  		var _ref2$isFirst = _ref2.isFirst;
  		var isFirst = _ref2$isFirst === undefined ? false : _ref2$isFirst;
  		var _ref2$placeholder = _ref2.placeholder;
  		var placeholder = _ref2$placeholder === undefined ? '' : _ref2$placeholder;
  		var help = _ref2.help;
  		var _ref2$rows = _ref2.rows;
  		var rows = _ref2$rows === undefined ? 3 : _ref2$rows;
  		var inputClass = _ref3.inputClass;

  		return !isArea ? m('input.form-control', {
  			class: inputClass,
  			placeholder: placeholder,
  			value: prop(),
  			onkeyup: m.withAttr('value', prop),
  			config: function config(element, isInit) {
  				return isFirst && isInit && element.focus();
  			}
  		}) : m('textarea.form-control', {
  			class: inputClass,
  			placeholder: placeholder,
  			onkeyup: m.withAttr('value', prop),
  			rows: rows,
  			config: function config(element, isInit) {
  				return isFirst && isInit && element.focus();
  			}
  		}, [prop()]);
  	})
  };

  var checkboxInput = function checkboxInput(args) {
  	return m.component(checkboxInputComponent, args);
  };
  var checkboxInputComponent = {
  	controller: function controller(_ref4) {
  		var prop = _ref4.prop;
  		var form = _ref4.form;
  		var required = _ref4.required;

  		if (!form) throw new Error('Inputs require a form');

  		var validity = function validity() {
  			return !required || prop();
  		};
  		form.register(validity);

  		return { validity: validity, showValidation: form.showValidation };
  	},

  	view: viewWrapper(function (ctrl, _ref5) {
  		var prop = _ref5.prop;
  		var _ref5$description = _ref5.description;
  		var description = _ref5$description === undefined ? '' : _ref5$description;

  		return m('.checkbox', [m('label.c-input.c-checkbox', [m('input.form-control', {
  			type: 'checkbox',
  			onclick: m.withAttr('checked', prop),
  			checked: prop()
  		}), m('span.c-indicator'), m.trust('&nbsp;'), m('span.text-muted', description)])]);
  	}, { isFormControl: false })
  };

  var maybeInput = function maybeInput(args) {
  	return m.component(maybeInputComponent, args);
  };
  var maybeInputComponent = {
  	controller: function controller(_ref6) {
  		var prop = _ref6.prop;
  		var form = _ref6.form;
  		var required = _ref6.required;

  		if (!form) throw new Error('Inputs require a form');

  		var _text = m.prop(typeof prop() == 'boolean' ? '' : prop());
  		var _checked = m.prop(typeof prop() == 'string' ? true : prop());
  		var validity = function validity() {
  			return !required || prop();
  		};
  		form.register(validity);

  		return { validity: validity, showValidation: form.showValidation,
  			text: function text(value) {
  				if (arguments.length) {
  					_text(value);
  					prop(value || true);
  				}
  				return _text();
  			},
  			checked: function checked(value) {
  				if (arguments.length) {
  					_checked(value);
  					if (_checked() && _text()) prop(_text());else prop(_checked());
  				}
  				return _checked();
  			}
  		};
  	},

  	view: viewWrapper(function (_ref7, _ref8) {
  		var text = _ref7.text;
  		var checked = _ref7.checked;
  		var _ref8$placeholder = _ref8.placeholder;
  		var placeholder = _ref8$placeholder === undefined ? '' : _ref8$placeholder;

  		return m('.input-group', [m('span.input-group-addon', [m('input', {
  			type: 'checkbox',
  			onclick: m.withAttr('checked', checked),
  			checked: checked()
  		})]), m('input.form-control', {
  			placeholder: placeholder,
  			value: text(),
  			onkeyup: m.withAttr('value', text),
  			disabled: !checked()
  		})]);
  	})
  };

  var END_LINE = '\n';
  var TAB = '\t';
  var indent = function indent(str) {
  	var tab = arguments.length <= 1 || arguments[1] === undefined ? TAB : arguments[1];
  	return str.replace(/^/gm, tab);
  };

  var print = function print(obj) {
  	switch (typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) {
  		case 'boolean':
  			return obj ? 'true' : 'false';
  		case 'string':
  			return printString(obj);
  		case 'number':
  			return obj + '';
  		case 'function':
  			if (obj.toJSON) return print(obj()); // Support m.prop
  			else return obj.toString();
  	}

  	if (Array.isArray(obj)) return printArray(obj);

  	return printObj(obj);

  	function printString(str) {
  		return '\'' + str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + '\''; // escape string and add parenthesis
  	}

  	function printArray(arr) {
  		var isShort = arr.every(function (element) {
  			return ['string', 'number', 'boolean'].includes(typeof element === 'undefined' ? 'undefined' : babelHelpers.typeof(element)) && (element.length === undefined || element.length < 15);
  		});
  		var content = arr.map(function (value) {
  			return print(value);
  		}).join(isShort ? ', ' : ',\n');

  		return isShort ? '[' + content + ']' : '[\n' + indent(content) + '\n]';
  	}

  	function printObj(obj) {
  		var content = Object.keys(obj).map(function (key) {
  			return key + ' : ' + print(obj[key]);
  		}).map(function (row) {
  			return indent(row);
  		}).join(',' + END_LINE);
  		return '{\n' + content + '\n}';
  	}
  };

  function ratingWizard(_ref) {
  	var basicPage = _ref.basicPage;
  	var basicSelect = _ref.basicSelect;
  	var questionList = _ref.questionList;
  	var sequence = _ref.sequence;

  	var NEW_LINE = '\n';
  	var content = ['var API = new Quest();', '', '// The structure for the basic questionnaire page', 'API.addPagesSet(\'basicPage\', ' + print(basicPage) + ');', '', '// The structure for the basic question\t', 'API.addQuestionsSet(\'basicSelect\', ' + print(basicSelect) + ');', '// This is the question pool, the sequence picks the questions from here', 'API.addQuestionsSet(\'questionList\', ' + print(questionList) + ');', '', '// This is the sequence of questions', '// Note that you may want to update the "times" property if you change the number of questions', 'API.addSequence(' + print(sequence) + ');', '', 'return API.script;'].join(NEW_LINE);

  	return 'define([\'questAPI\'], function(Quest){\n' + indent(content) + '\n});';
  }

  var wizardComponent = {
  	controller: function controller(_ref) {
  		var study = _ref.study;

  		var path = m.prop('');
  		var form = formFactory();
  		var submit = function submit() {
  			form.showValidation(true);
  			if (form.isValid()) {
  				createFile(study, path, compileScript(script));
  			}
  		};

  		var compileScript = function compileScript(script) {
  			return function () {
  				script.basicPage.questions = [{ inherit: { type: script.randomize() ? 'exRandom' : 'sequential', set: 'questionList' } }];
  				script.sequence = [{
  					mixer: 'repeat',
  					times: script.times() || script.questionList().length,
  					data: [{ inherit: 'basicPage' }]
  				}];

  				return ratingWizard(script);
  			};
  		};

  		var script = {
  			basicPage: {
  				header: m.prop(''),
  				decline: m.prop(true),
  				autoFocus: true
  			},
  			basicSelect: {
  				type: 'selectOne',
  				autoSubmit: m.prop(false),
  				numericValues: m.prop(false),
  				help: m.prop('<%= pagesMeta.number < 3 %>'),
  				helpText: m.prop('Selecting an answer once colors it blue.<br/>You can change your answer by selecting another option.<br/>To confirm, click the selected (blue) button a second time.'),
  				answers: m.prop(['Very much', 'Somewhat', 'Undecided', 'Not realy', 'Not at all'])
  			},
  			questionList: m.prop([{ stem: 'Do you like chocolate?', name: 'q1', inherit: 'basicSelect' }, { stem: 'Do you like bannanas?', name: 'q2', inherit: 'basicSelect' }]),
  			times: m.prop(false),
  			randomize: m.prop(true),
  			sequence: [{
  				mixer: 'repeat',
  				times: m.prop(10),
  				data: [{ inherit: 'basicPage' }]
  			}]
  		};
  		return { path: path, form: form, submit: submit, script: script };
  	},
  	view: function view(_ref2) {
  		var form = _ref2.form;
  		var submit = _ref2.submit;
  		var script = _ref2.script;
  		var path = _ref2.path;

  		var basicPage = script.basicPage;
  		var basicSelect = script.basicSelect;

  		return m('.wizard.container', [m('h3', 'Rating wizard'), m('p', 'This wizard is responsible for rating stuff'), textInput({ label: 'File Name', placeholder: 'Path to file', prop: path, form: form, required: true }), m('h4', 'Basic Page'), textInput({ label: 'Header', placeholder: 'Page header', help: 'The header for all pages.', prop: basicPage.header, form: form }), checkboxInput({ label: 'Decline', description: 'Allow users to decline', prop: basicPage.decline, form: form }), m('h4', 'Basic Select'), checkboxInput({ label: 'autoSubmit', description: 'Submit upon second click', prop: basicSelect.autoSubmit, form: form }), textInput({ label: 'answers', prop: str2Answers(basicSelect.answers), rows: 7, form: form, isArea: true, help: 'Each row here represents an answer option', required: true }), checkboxInput({ label: 'numericValues', description: 'Responses are recorded as numbers', prop: basicSelect.numericValues, form: form }), maybeInput({ label: 'help', help: 'If and when to display the help text (use templates to control the when part)', prop: basicSelect.help, form: form }), basicSelect.help() ? textInput({ label: 'helpText', help: 'The instruction text for using this type of question', prop: basicSelect.helpText, form: form, isArea: true }) : '', m('h4', 'Sequence'), checkboxInput({ label: 'Randomize', description: 'Randomize questions', prop: script.randomize, form: form }), maybeInput({ label: 'Choose', help: 'Set a number of questions to choose from the pool. If this option is not selected all questions will be used.', form: form, prop: script.times }), textInput({ label: 'questions', prop: str2Questions(script.questionList), rows: 20, form: form, isArea: true, help: 'Each row here represents a questions', required: true }), m('.row', [m('.col-cs-12.text-xs-right', [!form.showValidation() || form.isValid() ? m('button.btn.btn-primary', { onclick: submit }, 'Create') : m('button.btn.btn-danger', { disabled: true }, 'Not Valid')])])]);
  	}
  };

  var transformProp = function transformProp(prop, input, output) {
  	var p = function p() {
  		if (arguments.length) prop(input(arguments.length <= 0 ? undefined : arguments[0]));
  		return output(prop());
  	};

  	p.toJSON = function () {
  		return output(prop());
  	};

  	return p;
  };

  // transorm a "m.prop" so that an array is expressed as a "\n" separated string.
  var str2Answers = function str2Answers(prop) {
  	return transformProp(prop, function (str) {
  		return str.replace(/\n*$/, '').split('\n');
  	}, function (arr) {
  		return arr.join('\n');
  	});
  };

  // Create the plain text version of the question list
  var str2Questions = function str2Questions(prop) {
  	return transformProp(prop, function (str) {
  		return str.replace(/\n*$/, '').split('\n').map(function (stem, index) {
  			return { stem: stem, name: 'q' + index, inherit: 'basicSelect' };
  		});
  	}, function (arr) {
  		return arr.map(function (q) {
  			return q.stem;
  		}).join('\n');
  	});
  };

  // taken from here:
  // https://github.com/JedWatson/classnames/blob/master/index.js
  var hasOwn = {}.hasOwnProperty;

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

  // add trailing slash if needed, and then remove proceeding slash
  // return prop
  var pathProp$1 = function pathProp(path) {
  	return m.prop(path.replace(/\/?$/, '/').replace(/^\//, ''));
  };

  var createFromTemplate = function createFromTemplate(_ref) {
  	var study = _ref.study;
  	var path = _ref.path;
  	var url = _ref.url;
  	var templateName = _ref.templateName;
  	return function () {
  		var name = pathProp$1(path);
  		var template = fetchText(url);

  		return messages.prompt({
  			header: 'Create from "' + templateName + '"',
  			content: 'Please insert the file name:',
  			prop: name
  		}).then(function (response) {
  			if (response) return template.then(function (content) {
  				return createFile(study, name, function () {
  					return content;
  				});
  			});
  		}).catch(function (err) {
  			var message = err.response && err.response.status === 404 ? 'Template file not found at ' + url : err.message;

  			return messages.alert({
  				header: 'Create from "' + templateName + '" failed',
  				content: message
  			});
  		});
  	};
  };

  var hash = {};

  hash.piPlayer = {
  	'Empty': '/implicit/user/yba/wizards/emptypip.js',
  	'Typical': '/implicit/user/yba/wizards/typical.js',
  	'Simple sorting task': '/implicit/user/yba/wizards/sorting.js',
  	'IAT (images)': '/implicit/user/yba/wizards/iatimages.js',
  	'IAT (words)': '/implicit/user/yba/wizards/iatwords.js',
  	'IAT (modify attributes)': '/implicit/user/yba/wizards/iatatt.js',
  	'IAT (all the parameters)': '/implicit/user/yba/wizards/iatall.js',
  	'Mobile IAT': '/implicit/user/yba/wizards/iatmobile.js',
  	'ST-IAT': '/implicit/user/yba/wizards/stiatsimple.js',
  	'ST-IAT (all parameters)': '/implicit/user/yba/wizards/stiatall.js',
  	'AMP (with words as primes)': '/implicit/user/yba/wizards/ampwords.js',
  	'AMP (all parameters)': '/implicit/user/yba/wizards/ampall.js',
  	'Brief-IAT': '/implicit/user/yba/wizards/batsimple.js',
  	'Brief-IAT (all parameters)': '/implicit/user/yba/wizards/batall.js',
  	'Attitude induction (behaviors)': '/implicit/user/yba/wizards/attitude.js',
  	'Evaluative Conditioning': '/implicit/user/yba/wizards/ec.js'
  };

  hash.piQuest = {
  	'Empty': '/implicit/user/yba/wizards/emptyquest.js',
  	'Rating Questionnaire': '/implicit/user/yba/wizards/rating.js',
  	'Rating Questionnaire (with images)': '/implicit/user/yba/wizards/ratingimages.js'
  };

  hash.piMessage = {
  	'Consent (Yoav lab)': '/implicit/user/yba/wizards/consent.jst',
  	'Intro': '/implicit/user/yba/wizards/intro.jst',
  	'Debriefing': '/implicit/user/yba/wizards/debriefing.jst'
  };

  hash.piManager = {
  	'Empty': '/implicit/user/yba/wizards/emptymanager.js',
  	'Typical': '/implicit/user/yba/wizards/emptymanager.js'
  };

  // download support according to modernizer
  var downloadSupport = !window.externalHost && 'download' in document.createElement('a');

  var fileContext = function fileContext(file, study) {
  	var path = file.isDir ? file.path : file.basePath;
  	var menu = [
  	// {icon:'fa-copy', text:'Duplicate', action: () => messages.alert({header:'Duplicate: ' + file.name, content:'Duplicate has not been implemented yet'})},

  	{ icon: 'fa-folder', text: 'New Directory', action: createDir(study, path) }, { icon: 'fa-file', text: 'New File', action: createEmpty(study, path) }, { icon: 'fa-file-text', text: 'New from template', menu: mapWizardHash(hash) }, { icon: 'fa-magic', text: 'New from wizard', menu: [{ text: 'Rating wizard', action: activateWizard('rating') }] }, { separator: true }, { icon: 'fa-refresh', text: 'Refresh/Reset', action: refreshFile, disabled: file.content() == file.sourceContent() }, { icon: 'fa-download', text: 'Download', action: downloadFile }, { icon: 'fa-link', text: 'Copy URL', action: copyUrl(file) }, { icon: 'fa-close', text: 'Delete', action: deleteFile }, { icon: 'fa-exchange', text: 'Move/Rename...', action: moveFile(file, study) }];

  	return contextMenuComponent.open(menu);

  	function activateWizard(route) {
  		return function () {
  			return m.route('/editor/' + study.id + '/wizard/' + route);
  		};
  	}

  	function mapWizardHash(wizardHash) {
  		return Object.keys(wizardHash).map(function (text) {
  			var value = wizardHash[text];
  			return typeof value === 'string' ? { text: text, action: createFromTemplate({ study: study, path: path, url: value, templateName: text }) } : { text: text, menu: mapWizardHash(value) };
  		});
  	}

  	function refreshFile() {
  		file.content(file.sourceContent());
  		m.redraw();
  	}

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

  var DRAGOVER_CLASS = 'is-dragover';
  function dragdrop(element, options) {
  	options = options || {};

  	element.addEventListener('dragover', activate);
  	element.addEventListener('dragleave', deactivate);
  	element.addEventListener('dragend', deactivate);
  	element.addEventListener('drop', deactivate);
  	element.addEventListener('drop', update);

  	function activate(e) {
  		e.preventDefault();
  		e.stopPropagation(); // so that only the lowest level element gets focused
  		element.classList.add(DRAGOVER_CLASS);
  	}
  	function deactivate() {
  		element.classList.remove(DRAGOVER_CLASS);
  	}
  	function update(e) {
  		e.preventDefault();
  		e.stopPropagation();
  		onchange(options)(e);
  	}
  }

  var uploadConfig = function uploadConfig(ctrl) {
  	return function (element, isInitialized) {
  		if (!isInitialized) {
  			dragdrop(element, { onchange: ctrl.onchange });
  		}
  	};
  };

  var uploadBox = function uploadBox(args) {
  	return m('form.upload', { method: 'post', enctype: 'multipart/form-data', config: uploadConfig(args) }, [m('i.fa.fa-download	.fa-3x.m-b-1'), m('input.box__file', { id: 'upload', type: 'file', name: 'files[]', 'data-multiple-caption': '{count} files selected', multiple: true, onchange: onchange(args) }), m('label', { for: 'upload' }, m('strong', 'Choose a file'), m('span', ' or drag it here'))]);
  };

  // call onchange with files
  var onchange = function onchange(args) {
  	return function (e) {
  		if (typeof args.onchange == 'function') {
  			args.onchange((e.dataTransfer || e.target).files);
  		}
  	};
  };

  var node = function node(file, args) {
  	return m.component(nodeComponent, file, args);
  };

  var nodeComponent = {
  	controller: function controller(file) {
  		return {
  			isCurrent: m.route.param('fileID') === file.id
  		};
  	},
  	view: function view(ctrl, file, _ref) {
  		var folderHash = _ref.folderHash;
  		var study = _ref.study;
  		var filesVM = _ref.filesVM;

  		var vm = filesVM(file.id); // vm is created by the study component, it exposes a "isOpen" and "isChanged" properties
  		return m('li.file-node', {
  			key: file.id,
  			class: classNames({
  				open: vm.isOpen()
  			}),
  			onclick: file.isDir ? function () {
  				return vm.isOpen(!vm.isOpen());
  			} : choose(file),
  			oncontextmenu: fileContext(file, study),
  			config: file.isDir ? uploadConfig({ onchange: uploadFiles(file.path, study) }) : null
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
  		}), m('span', { class: classNames({ 'font-weight-bold': file.hasChanged() }) }, ' ' + file.name), file.isDir ? folder(file.path + '/', { folderHash: folderHash, study: study, filesVM: filesVM }) : ''])]);
  	}
  };

  var choose = function choose(file) {
  	return function (e) {
  		e.stopPropagation();
  		e.preventDefault();
  		m.route('/editor/' + file.studyId + '/file/' + encodeURIComponent(file.id));
  	};
  };

  var folder = function folder(path, args) {
  	return m.component(folderComponent, path, args);
  };

  var folderComponent = {
  	view: function view(ctrl, path, _ref) {
  		var folderHash = _ref.folderHash;
  		var study = _ref.study;
  		var filesVM = _ref.filesVM;

  		var files = folderHash[path] || [];

  		return m('.files', [m('ul', files.map(function (file) {
  			return node(file, { folderHash: folderHash, study: study, filesVM: filesVM });
  		}))]);
  	}
  };

  var currentStudy = undefined;
  var filesVM$1 = undefined;
  var filesComponent = {
  	controller: function controller() {
  		// Create new VM only if we change study name
  		var studyId = m.route.param('studyId');
  		if (!filesVM$1 || currentStudy !== studyId) {
  			currentStudy = studyId;
  			filesVM$1 = viewModelMap$1({
  				isOpen: m.prop(false),
  				isChanged: m.prop(false)
  			});
  		}

  		return { filesVM: filesVM$1, parseFiles: parseFiles };
  	},
  	view: function view(_ref, _ref2) {
  		var parseFiles = _ref.parseFiles;
  		var filesVM = _ref.filesVM;
  		var study = _ref2.study;

  		var folderHash = parseFiles(study.files());
  		var config = uploadConfig({ onchange: uploadFiles('/', study) });
  		return m('div', { config: config }, folder('/', { folderHash: folderHash, study: study, filesVM: filesVM }));
  	}
  };

  // http://lhorie.github.io/mithril-blog/mapping-view-models.html
  var viewModelMap$1 = function viewModelMap(signature) {
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

  var parseFiles = function parseFiles(files) {
  	return files.reduce(function (hash, file) {
  		var path = file.basePath;
  		if (!hash[path]) hash[path] = [];
  		hash[path].push(file);
  		return hash;
  	}, {});
  };

  var sidebarButtons = {
  	controller: function controller(_ref) {
  		var study = _ref.study;

  		var ctrl = {
  			newOpen: false,
  			toggleNew: function toggleNew() {
  				return ctrl.newOpen = !ctrl.newOpen;
  			},
  			createEmpty: createEmpty(study)
  		};

  		return ctrl;
  	},

  	view: function view(ctrl) {
  		return m('.btn-group', { class: ctrl.newOpen ? 'open' : '' }, [m('.btn.btn-sm.btn-secondary', { onclick: ctrl.createEmpty }, [m('i.fa.fa-plus'), ' New']), m('.btn.btn-sm.btn-secondary.dropdown-toggle', { onclick: ctrl.toggleNew }), m('.dropdown-menu', { onclick: ctrl.toggleNew }, [
  			//		m('a.dropdown-item', {onclick: ctrl.createPIP}, 'piPlayer'),
  			//		m('a.dropdown-item', {onclick: ctrl.createQuest}, 'piQuest'),
  			//		m('a.dropdown-item', {onclick: ctrl.createManager}, 'piManager')
  		])]);
  	}
  };

  var sidebarComponent = {
  	view: function view(ctrl, _ref) {
  		var study = _ref.study;
  		var filesVM = _ref.filesVM;

  		return m('.sidebar', [m('h5', study.id), m('p.text-muted.m-a-1', [m('small', 'Right click the file list in order to perform actions.')]),
  		//			m.component(sidebarButtons, {study}),
  		m.component(filesComponent, { study: study, filesVM: filesVM, files: study.files() || [] }), uploadBox({ onchange: uploadFiles('/', study) })]);
  	}
  };

  var study = undefined;
  var filesVM = undefined;
  var editorLayoutComponent = {
  	controller: function controller() {
  		var id = m.route.param('studyId');

  		if (!study || study.id !== id) {
  			study = studyFactory(id);
  			study.get().then(m.redraw);
  		}

  		if (!filesVM) filesVM = viewModelMap({
  			isOpen: m.prop(false),
  			isChanged: m.prop(false)
  		});

  		var ctrl = { study: study, filesVM: filesVM, onunload: onunload };

  		window.addEventListener('beforeunload', beforeunload);

  		return ctrl;

  		function hasUnsavedData() {
  			return study.files().some(function (f) {
  				return f.content() !== f.sourceContent();
  			});
  		}

  		function beforeunload(event) {
  			if (hasUnsavedData()) return event.returnValue = 'You have unsaved data are you sure you want to leave?';
  		}

  		function onunload(e) {
  			var leavingEditor = function leavingEditor() {
  				return !/^\/editor\//.test(m.route());
  			};
  			if (leavingEditor() && hasUnsavedData() && !window.confirm('You have unsaved data are you sure you want to leave?')) {
  				e.preventDefault();
  			} else {
  				window.removeEventListener('beforeunload', beforeunload);
  			}
  		}
  	},
  	view: function view(_ref) {
  		var study = _ref.study;
  		var filesVM = _ref.filesVM;

  		return m('.row.study', [study.loaded ? [m('.col-md-2', [m.component(sidebarComponent, { study: study, filesVM: filesVM })]), m('.col-md-10', [m.route.param('resource') === 'file' ? m.component(fileEditorComponent, { study: study, filesVM: filesVM }) : m.component(wizardComponent, { study: study })])] : '']);
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

  var url = '/dashboard/StudyData';

  var STATUS_RUNNING = 'R';
  var STATUS_PAUSED = 'P';
  var STATUS_STOP = 'S';

  function createStudy(study) {
  	var body = Object.assign({
  		action: 'insertRulesTable',
  		creationDate: new Date(),
  		studyStatus: STATUS_RUNNING
  	}, study);

  	return fetchJson(url, { method: 'post', body: body }).then(interceptErrors);
  }

  function updateStudy(study) {
  	var body = Object.assign({
  		action: 'updateRulesTable'
  	}, study);

  	return fetchJson(url, { method: 'post', body: body }).then(interceptErrors);
  }

  function updateStatus(study, status) {
  	var body = Object.assign({
  		action: 'updateStudyStatus'
  	}, study, { studyStatus: status });

  	return fetchJson(url, { method: 'post', body: body }).then(interceptErrors);
  }

  function getAllPoolStudies() {
  	return fetchJson(url, { method: 'post', body: { action: 'getAllPoolStudies' } }).then(interceptErrors);
  }

  function getLast100PoolUpdates() {
  	return fetchJson(url, { method: 'post', body: { action: 'getLast100PoolUpdates' } }).then(interceptErrors);
  }

  function getStudyId(study) {
  	var body = Object.assign({
  		action: 'getStudyId'
  	}, study);

  	return fetchJson(url, { method: 'post', body: body });
  }

  function resetStudy(study) {
  	return fetchJson(url, { method: 'post', body: Object.assign({ action: 'resetCompletions' }, study) }).then(interceptErrors);
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

  var spinner = {
  	display: m.prop(false),
  	show: function show(response) {
  		spinner.display(true);
  		m.redraw();
  		return response;
  	},
  	hide: function hide(response) {
  		spinner.display(false);
  		m.redraw();
  		return response;
  	},
  	view: function view() {
  		return m('.backdrop', { hidden: !spinner.display() }, // spinner.show()
  		m('.overlay'), m('.backdrop-content.spinner.icon.fa.fa-cog.fa-spin'));
  	}
  };

  /**
   * Create edit component
   * Promise editMessage({input:Object, output:Prop})
   */
  var editMessage = function editMessage(args) {
  	return messages.custom({
  		content: m.component(editComponent, Object.assign({ close: messages.close }, args)),
  		wide: true
  	});
  };

  var editComponent = {
  	controller: function controller(_ref) {
  		var input = _ref.input;
  		var output = _ref.output;
  		var close = _ref.close;

  		var study = ['rulesUrl', 'targetCompletions', 'autopauseUrl', 'userEmail'].reduce(function (study, prop) {
  			study[prop] = m.prop(input[prop] || '');
  			return study;
  		}, {});

  		// export study to calling component
  		output(study);

  		var ctrl = {
  			study: study,
  			submitAttempt: false,
  			validity: function validity() {
  				var isEmail = function isEmail(str) {
  					return (/\S+@\S+\.\S+/.test(str)
  					);
  				};
  				var isNormalInteger = function isNormalInteger(str) {
  					return (/^\+?(0|[1-9]\d*)$/.test(str)
  					);
  				};

  				var response = {
  					rulesUrl: study.rulesUrl(),
  					targetCompletions: isNormalInteger(study.targetCompletions()),
  					autopauseUrl: study.autopauseUrl(),
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

  				if (isValid) {
  					study.targetCompletions(+study.targetCompletions()); // targetCompletions should be cast as a number
  					close(true);
  				}
  			},
  			cancel: function cancel() {
  				close(null);
  			}
  		};

  		return ctrl;
  	},
  	view: function view(ctrl, _ref2) {
  		var input = _ref2.input;

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

  		return m('div', [m('h4', 'Study Editor'), m('.card-block', [m('.form-group', [m('label', 'Study ID'), m('p', [m('strong.form-control-static', input.studyId)])]), m('.form-group', [m('label', 'Study URL'), m('p', [m('strong.form-control-static', input.studyUrl)])]), m('.form-group', { class: groupClasses(validity.rulesUrl) }, [m('label', 'Rules File URL'), m('input.form-control', {
  			config: focusConfig,
  			placeholder: 'Rules file URL',
  			value: study.rulesUrl(),
  			onkeyup: m.withAttr('value', study.rulesUrl),
  			class: inputClasses(validity.rulesUrl)
  		}), m('p.text-muted.btn-toolbar', [miniButtonView(study.rulesUrl, 'Priority26', '/research/library/rules/Priority26.xml')]), validationView(validity.rulesUrl, 'This row is required')]), m('.form-group', { class: groupClasses(validity.autopauseUrl) }, [m('label', 'Auto-pause file URL'), m('input.form-control', {
  			placeholder: 'Auto pause file URL',
  			value: study.autopauseUrl(),
  			onkeyup: m.withAttr('value', study.autopauseUrl),
  			class: inputClasses(validity.autopauseUrl)
  		}), m('p.text-muted.btn-toolbar', [miniButtonView(study.autopauseUrl, 'Default', '/research/library/pausefiles/pausedefault.xml'), miniButtonView(study.autopauseUrl, 'Never', '/research/library/pausefiles/neverpause.xml'), miniButtonView(study.autopauseUrl, 'Low restrictions', '/research/library/pausefiles/pauselowrestrictions.xml')]), validationView(validity.autopauseUrl, 'This row is required')]), m('.form-group', { class: groupClasses(validity.targetCompletions) }, [m('label', 'Target number of sessions'), m('input.form-control', {
  			type: 'number',
  			placeholder: 'Target Sessions',
  			value: study.targetCompletions(),
  			onkeyup: m.withAttr('value', study.targetCompletions),
  			onclick: m.withAttr('value', study.targetCompletions),
  			class: inputClasses(validity.targetCompletions)
  		}), validationView(validity.targetCompletions, 'This row is required and has to be an integer above 0')]), m('.form-group', { class: groupClasses(validity.userEmail) }, [m('label', 'User Email'), m('input.form-control', {
  			type: 'email',
  			placeholder: 'Email',
  			value: study.userEmail(),
  			onkeyup: m.withAttr('value', study.userEmail),
  			class: inputClasses(validity.userEmail)
  		}), validationView(validity.userEmail, 'This row is required and must be a valid Email')])]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: ctrl.cancel }, 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: ctrl.ok }, 'OK')])]);
  	}
  };

  var focusConfig = function focusConfig(element, isInitialized) {
  	if (!isInitialized) element.focus();
  };

  /**
   * Create edit component
   * Promise editMessage({output:Prop})
   */
  var createMessage = function createMessage(args) {
  	return messages.custom({
  		content: m.component(createComponent, Object.assign({ close: messages.close }, args)),
  		wide: true
  	});
  };

  var createComponent = {
  	controller: function controller(_ref) {
  		var output = _ref.output;
  		var close = _ref.close;

  		var study = output({
  			studyUrl: m.prop('')
  		});

  		var ctrl = {
  			study: study,
  			submitAttempt: false,
  			validity: function validity() {
  				var response = {
  					studyUrl: study.studyUrl()
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

  		return m('div', [m('h4', 'Create Study'), m('.card-block', [m('.form-group', { class: groupClasses(validity.studyUrl) }, [m('label', 'Study URL'), m('input.form-control', {
  			config: focusConfig$1,
  			placeholder: 'Study URL',
  			value: study.studyUrl(),
  			onkeyup: m.withAttr('value', study.studyUrl),
  			class: inputClasses(validity.studyUrl)
  		}), validationView(validity.studyUrl, 'This row is required')])]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: ctrl.cancel }, 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: ctrl.ok }, 'Proceed')])]);
  	}
  };

  var focusConfig$1 = function focusConfig(element, isInitialized) {
  	if (!isInitialized) element.focus();
  };

  function play$1(study) {
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

  var edit = function edit(input) {
  	var output = m.prop();
  	return editMessage({ input: input, output: output }).then(function (response) {
  		if (response) {
  			var _ret = function () {
  				studyPending(input, true)();
  				var study = Object.assign({}, input, unPropify(output()));
  				return {
  					v: updateStudy(study).then(function () {
  						return Object.assign(input, study);
  					}) // update study in view
  					.catch(reportError('Study Editor')).then(studyPending(input, false))
  				};
  			}();

  			if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
  		}
  	});
  };

  var create = function create(list) {
  	var output = m.prop();
  	return createMessage({ output: output }).then(function (response) {
  		if (response) {
  			spinner.show();
  			getStudyId(output()).then(function (response) {
  				return Object.assign(unPropify(output()), response);
  			}) // add response data to "newStudy"
  			.then(spinner.hide).then(editNewStudy);
  		}
  	});

  	function editNewStudy(input) {
  		var output = m.prop();
  		return editMessage({ input: input, output: output }).then(function (response) {
  			if (response) {
  				var _ret2 = function () {
  					var study = Object.assign({
  						startedSessions: 0,
  						completedSessions: 0,
  						creationDate: new Date(),
  						studyStatus: STATUS_RUNNING
  					}, input, unPropify(output()));
  					return {
  						v: createStudy(study).then(function () {
  							return list().push(study);
  						}).then(m.redraw).catch(reportError('Create Study'))
  					};
  				}();

  				if ((typeof _ret2 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret2)) === "object") return _ret2.v;
  			}
  		});
  	}
  };

  var reset = function reset(study) {
  	messages.confirm({
  		header: 'Restart study',
  		content: 'Are you sure you want to restart this study? This action will reset all started and completed sessions.'
  	}).then(function (response) {
  		if (response) {
  			var _ret3 = function () {
  				var old = {
  					startedSessions: study.startedSessions,
  					completedSessions: study.completedSessions
  				};
  				study.startedSessions = study.completedSessions = 0;
  				m.redraw();
  				return {
  					v: resetStudy(study).catch(function (response) {
  						Object.assign(study, old);
  						return Promise.reject(response);
  					}).catch(reportError('Restart study'))
  				};
  			}();

  			if ((typeof _ret3 === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret3)) === "object") return _ret3.v;
  		}
  	});
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

  var loginUrl = '/dashboard/dashboard/connect';
  var logoutUrl = '/dashboard/logout';

  var authorizeState = {};

  var isLoggedIn = function isLoggedIn() {
  	return !!authorizeState.isLoggedin;
  };
  var getRole = function getRole() {
  	return authorizeState.role;
  };

  function authorize() {
  	authorizeState = getAuth();
  }

  var login = function login(username, password) {
  	return fetchJson(loginUrl, {
  		method: 'post',
  		body: { username: username, password: password }
  	});
  };

  var logout = function logout() {
  	return fetchVoid(logoutUrl, { method: 'post' }).then(getAuth);
  };

  function getAuth() {
  	var cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)PiLogin\s*\=\s*([^;]*).*$)|^.*$/, '$1'));
  	try {
  		return cookieValue ? JSON.parse(cookieValue) : {};
  	} catch (e) {
  		setTimeout(function () {
  			throw e;
  		});
  		return {};
  	}
  }

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

  var PRODUCTION_URL = 'https://implicit.harvard.edu/implicit/';
  var TABLE_WIDTH = 8;

  var poolComponent = {
  	controller: function controller() {
  		var ctrl = {
  			play: play$1,
  			pause: pause,
  			remove: remove,
  			edit: edit,
  			reset: reset,
  			create: create,
  			canCreate: function canCreate() {
  				return getRole() === 'SU';
  			},
  			list: m.prop([]),
  			globalSearch: m.prop(''),
  			sortBy: m.prop(),
  			error: m.prop('')
  		};

  		getAllPoolStudies().then(ctrl.list).catch(ctrl.error).then(m.redraw);

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var list = ctrl.list;
  		return m('.pool', [m('h2', 'Study pool'), ctrl.error() ? m('.alert.alert-warning', m('strong', 'Warning!! '), ctrl.error().message) : m('table', { class: 'table table-striped table-hover', onclick: sortTable(list, ctrl.sortBy) }, [m('thead', [m('tr', [m('th', { colspan: TABLE_WIDTH - 1 }, [m('input.form-control', { placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch) })]), m('th', [m('a.btn.btn-secondary', { href: '/pool/history', config: m.route }, [m('i.fa.fa-history'), '  History'])])]), ctrl.canCreate() ? m('tr', [m('th.text-xs-center', { colspan: TABLE_WIDTH }, [m('button.btn.btn-secondary', { onclick: ctrl.create.bind(null, list) }, [m('i.fa.fa-plus'), '  Add new study'])])]) : '', m('tr', [m('th', thConfig('studyId', ctrl.sortBy), 'ID'), m('th', thConfig('studyUrl', ctrl.sortBy), 'Study'), m('th', thConfig('rulesUrl', ctrl.sortBy), 'Rules'), m('th', thConfig('autopauseUrl', ctrl.sortBy), 'Autopause'), m('th', thConfig('completedSessions', ctrl.sortBy), 'Completion'), m('th', thConfig('creationDate', ctrl.sortBy), 'Date'), m('th', 'Status'), m('th', 'Actions')])]), m('tbody', [list().length === 0 ? m('tr.table-info', m('td.text-xs-center', { colspan: TABLE_WIDTH }, m('strong', 'Heads up! '), 'There are no pool studies yet')) : list().filter(studyFilter(ctrl)).map(function (study) {
  			return m('tr', [
  			// ### ID
  			m('td', study.studyId),

  			// ### Study url
  			m('td', [m('a', { href: PRODUCTION_URL + study.studyUrl, target: '_blank' }, 'Study')]),

  			// ### Rules url
  			m('td', [m('a', { href: PRODUCTION_URL + study.rulesUrl, target: '_blank' }, 'Rules')]),

  			// ### Autopause url
  			m('td', [m('a', { href: PRODUCTION_URL + study.autopauseUrl, target: '_blank' }, 'Autopause')]),

  			// ### Completions
  			m('td', [study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ', m('i.fa.fa-info-circle'), m('.card.info-box', [m('.card-header', 'Completion Details'), m('ul.list-group.list-group-flush', [m('li.list-group-item', [m('strong', 'Target Completions: '), study.targetCompletions]), m('li.list-group-item', [m('strong', 'Started Sessions: '), study.startedSessions]), m('li.list-group-item', [m('strong', 'Completed Sessions: '), study.completedSessions])])])]),

  			// ### Date
  			m('td', formatDate(new Date(study.creationDate))),

  			// ### Status
  			m('td', [{
  				R: m('span.label.label-success', 'Running'),
  				P: m('span.label.label-info', 'Paused'),
  				S: m('span.label.label-danger', 'Stopped')
  			}[study.studyStatus]]),

  			// ### Actions
  			m('td', [study.$pending ? m('.l', 'Loading...') : m('.btn-group', [study.canUnpause && study.studyStatus === STATUS_PAUSED ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.play.bind(null, study) }, [m('i.fa.fa-play')]) : '', study.canPause && study.studyStatus === STATUS_RUNNING ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.pause.bind(null, study) }, [m('i.fa.fa-pause')]) : '', study.canReset ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.edit.bind(null, study) }, [m('i.fa.fa-edit')]) : '', study.canReset ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.reset.bind(null, study) }, [m('i.fa.fa-refresh')]) : '', study.canStop ? m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.remove.bind(null, study, list) }, [m('i.fa.fa-close')]) : ''])])]);
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

  // import $ from 'jquery';
  var Pikaday = window.Pikaday;

  var dateRangePicker = function dateRangePicker(args) {
  	return m.component(pikadayRange, args);
  };

  var pikaday = {
  	view: function view(ctrl, _ref) {
  		var prop = _ref.prop;
  		var options = _ref.options;

  		return m('div', { config: pikaday.config(prop, options) });
  	},
  	config: function config(prop, options) {
  		return function (element, isInitialized, ctx) {
  			if (!isInitialized) {
  				ctx.picker = new Pikaday(Object.assign({
  					onSelect: prop,
  					container: element
  				}, options));

  				element.appendChild(ctx.picker.el);
  			}

  			ctx.picker.setDate(prop());
  		};
  	}
  };

  /**
   * args = {
   * 	startValue: m.prop,
   *  endValue: m.prop,
   *  options: Object // specific daterange plugin options
   * }
   */

  var pikadayRange = {
  	view: function view(ctrl, args) {
  		return m('.date-range', [m('.figure', [m('strong', 'Start Date'), m('br'), m('.figure', { config: pikadayRange.configStart(args) })]), m.trust('&nbsp;'), m('.figure', [m('strong', 'End Date'), m('br'), m('.figure', { config: pikadayRange.configEnd(args) })])]);
  	},
  	configStart: function configStart(_ref2) {
  		var startDate = _ref2.startDate;
  		var endDate = _ref2.endDate;

  		return function (element, isInitialized, ctx) {
  			var picker = ctx.picker;

  			if (!isInitialized) {
  				picker = ctx.picker = new Pikaday({
  					maxDate: new Date(),
  					onSelect: function onSelect(date) {
  						return startDate(date) && update() || m.redraw();
  					}
  				});
  				element.appendChild(picker.el);

  				ctx.onunload = picker.destroy.bind(picker);
  				picker.setDate(startDate());
  			}

  			// resset picker date only if the date has changed externaly
  			if (!datesEqual(startDate(), picker.getDate())) {
  				picker.setDate(startDate(), true);
  				update();
  			}

  			function update() {
  				picker.setStartRange(startDate());
  				picker.setEndRange(endDate());
  				picker.setMaxDate(endDate());
  			}
  		};
  	},
  	configEnd: function configEnd(_ref3) {
  		var startDate = _ref3.startDate;
  		var endDate = _ref3.endDate;

  		return function (element, isInitialized, ctx) {
  			var picker = ctx.picker;

  			if (!isInitialized) {
  				picker = ctx.picker = new Pikaday({
  					maxDate: new Date(),
  					onSelect: function onSelect(date) {
  						return endDate(date) && update() || m.redraw();
  					}
  				});
  				element.appendChild(picker.el);

  				ctx.onunload = picker.destroy.bind(picker);
  				picker.setDate(endDate());
  			}

  			// resset picker date only if the date has changed externaly
  			if (!datesEqual(endDate(), picker.getDate())) {
  				picker.setDate(endDate(), true);
  				update();
  			}

  			function update() {
  				picker.setStartRange(startDate());
  				picker.setEndRange(endDate());
  				picker.setMinDate(startDate());
  			}
  		};
  	}
  };

  var datesEqual = function datesEqual(date1, date2) {
  	return date1 instanceof Date && date2 instanceof Date && date1.getTime() === date2.getTime();
  };

  var PRODUCTION_URL$1 = 'https://implicit.harvard.edu/implicit/';
  var poolComponent$1 = {
  	controller: function controller() {
  		var ctrl = {
  			list: m.prop([]),
  			globalSearch: m.prop(''),
  			startDate: m.prop(new Date(0)),
  			endDate: m.prop(new Date()),
  			sortBy: m.prop()
  		};

  		getLast100PoolUpdates().then(ctrl.list).then(m.redraw);

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var list = ctrl.list;
  		return m('.pool', [m('h2', 'Pool history'), m('table', { class: 'table table-striped table-hover', onclick: sortTable(list, ctrl.sortBy) }, [m('thead', [m('tr', [m('th.row', { colspan: 8 }, [m('.col-sm-4', m('input.form-control', { placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch) })), m('.col-sm-8', dateRangePicker(ctrl), m('.btn-group-vertical.history-button-group', [dayButtonView(ctrl, 'Last 7 Days', 7), dayButtonView(ctrl, 'Last 30 Days', 30), dayButtonView(ctrl, 'Last 90 Days', 90), dayButtonView(ctrl, 'All times', 3650)]))])]), m('tr', [m('th', thConfig$1('studyId', ctrl.sortBy), 'ID'), m('th', thConfig$1('studyUrl', ctrl.sortBy), 'Study'), m('th', thConfig$1('rulesUrl', ctrl.sortBy), 'Rules'), m('th', thConfig$1('autopauseUrl', ctrl.sortBy), 'Autopause'), m('th', thConfig$1('creationDate', ctrl.sortBy), 'Creation Date'), m('th', thConfig$1('completedSessions', ctrl.sortBy), 'Completion'), m('th', 'New Status'), m('th', 'Old Status'), m('th', thConfig$1('updaterId', ctrl.sortBy), 'Updater')])]), m('tbody', [list().filter(studyFilter$1(ctrl)).map(function (study) {
  			return m('tr', [
  			// ### ID
  			m('td', study.studyId),

  			// ### Study url
  			m('td', [m('a', { href: PRODUCTION_URL$1 + study.studyUrl, target: '_blank' }, 'Study')]),

  			// ### Rules url
  			m('td', [m('a', { href: PRODUCTION_URL$1 + study.rulesUrl, target: '_blank' }, 'Rules')]),

  			// ### Autopause url
  			m('td', [m('a', { href: PRODUCTION_URL$1 + study.autopauseUrl, target: '_blank' }, 'Autopause')]),

  			// ### Date
  			m('td', formatDate(new Date(study.creationDate))),

  			// ### Target Completionss
  			m('td', [study.startedSessions ? (100 * study.completedSessions / study.startedSessions).toFixed(1) + '% ' : 'n/a ', m('i.fa.fa-info-circle'), m('.card.info-box', [m('.card-header', 'Completion Details'), m('ul.list-group.list-group-flush', [m('li.list-group-item', [m('strong', 'Target Completions: '), study.targetCompletions]), m('li.list-group-item', [m('strong', 'Started Sessions: '), study.startedSessions]), m('li.list-group-item', [m('strong', 'Completed Sessions: '), study.completedSessions])])])]),

  			// ### New Status
  			m('td', [{
  				R: m('span.label.label-success', 'Running'),
  				P: m('span.label.label-info', 'Paused'),
  				S: m('span.label.label-danger', 'Stopped')
  			}[study.newStatus]]),
  			// ### Old Status
  			m('td', [{
  				R: m('span.label.label-success', 'Running'),
  				P: m('span.label.label-info', 'Paused'),
  				S: m('span.label.label-danger', 'Stopped')
  			}[study.studyStatus]]), m('td', study.updaterId)]);
  		})])])]);
  	}
  };

  // @TODO: bad idiom! should change things within the object, not the object itself.
  var thConfig$1 = function thConfig(prop, current) {
  	return { 'data-sort-by': prop, class: current() === prop ? 'active' : '' };
  };

  function studyFilter$1(ctrl) {
  	return function (study) {
  		return (includes(study.studyId, ctrl.globalSearch()) || includes(study.updaterId, ctrl.globalSearch()) || includes(study.rulesUrl, ctrl.globalSearch()) || includes(study.targetCompletions, ctrl.globalSearch())) && new Date(study.creationDate).getTime() >= ctrl.startDate().getTime() && new Date(study.creationDate).getTime() <= ctrl.endDate().getTime() + 86000000;
  	}; //include the end day selected

  	function includes(val, search) {
  		return typeof val === 'string' && val.includes(search);
  	}
  }

  var dayButtonView = function dayButtonView(ctrl, name, days) {
  	return m('button.btn.btn-secondary.btn-sm', { onclick: function onclick() {
  			var d = new Date();
  			d.setDate(d.getDate() - days);
  			ctrl.startDate(d);
  			ctrl.endDate(new Date());
  		} }, name);
  };

  var url$1 = '/dashboard/DashboardData';

  var STATUS_RUNNING$1 = 'R';
  var STATUS_COMPLETE = 'C';
  var STATUS_ERROR = 'X';

  var getAllDownloads = function getAllDownloads() {
  	return fetchJson(url$1, {
  		method: 'post',
  		body: { action: 'getAllDownloads' }
  	}).then(interceptErrors$1);
  };

  var removeDownload = function removeDownload(download) {
  	return fetchVoid(url$1, {
  		method: 'post',
  		body: Object.assign({ action: 'removeDownload' }, download)
  	}).then(interceptErrors$1);
  };

  var createDownload = function createDownload(download) {
  	return fetchJson(url$1, {
  		method: 'post',
  		body: Object.assign({ action: 'download' }, download)
  	}).then(interceptErrors$1);
  };

  function interceptErrors$1(response) {
  	if (!response || !response.error) {
  		return response;
  	}

  	return Promise.reject({ message: response.msg });
  }

  var createMessage$1 = (function (args) {
  	return messages.custom({
  		content: m.component(createComponent$1, Object.assign({ close: messages.close }, args)),
  		wide: true
  	});
  })

  var createComponent$1 = {
  	controller: function controller(_ref) {
  		var output = _ref.output;
  		var close = _ref.close;

  		var download = {
  			studyId: m.prop(''),
  			db: m.prop('test'),
  			startDate: m.prop(new Date(0)),
  			endDate: m.prop(new Date())
  		};

  		// export study to calling component
  		output(download);

  		var ctrl = {
  			download: download,
  			submitAttempt: false,
  			validity: function validity() {
  				var response = {
  					studyId: download.studyId()
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
  		var download = ctrl.download;
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

  		return m('div', [m('h4', 'Request Download'), m('.card-block', [m('.form-group', { class: groupClasses(validity.studyId) }, [m('label', 'Study Id'), m('input.form-control', {
  			config: focusConfig$2,
  			placeholder: 'Study Id',
  			value: download.studyId(),
  			onkeyup: m.withAttr('value', download.studyId),
  			class: inputClasses(validity.studyId)
  		}), validationView(validity.studyId, 'The study ID is required in order to request a download.')]), m('.form-group', [m('label', 'Database'), m('select.form-control', { onchange: m.withAttr('value', download.db) }, [m('option', { value: 'test', selected: download.db() === 'test' }, 'Development'), m('option', { value: 'warehouse', selected: download.db() === 'warehouse' }, 'Production')])]), m('.form-group', [m('label', 'Date Range'), dateRangePicker(download), m('p.text-muted.btn-toolbar', [dayButtonView$1(download, 'Last 7 Days', 7), dayButtonView$1(download, 'Last 30 Days', 30), dayButtonView$1(download, 'Last 90 Days', 90), dayButtonView$1(download, 'All times', 3650)])])]), m('.text-xs-right.btn-toolbar', [m('a.btn.btn-secondary.btn-sm', { onclick: ctrl.cancel }, 'Cancel'), m('a.btn.btn-primary.btn-sm', { onclick: ctrl.ok }, 'OK')])]);
  	}
  };

  var focusConfig$2 = function focusConfig(element, isInitialized) {
  	if (!isInitialized) element.focus();
  };

  var dayButtonView$1 = function dayButtonView(download, name, days) {
  	return m('button.btn.btn-secondary.btn-sm', { onclick: function onclick() {
  			var d = new Date();
  			d.setDate(d.getDate() - days);
  			download.startDate(d);
  			download.endDate(new Date());
  		} }, name);
  };

  /**
   * Get all downloads
   */

  var recursiveGetAll = debounce(getAll, 5000);
  function getAll(_ref) {
  	var list = _ref.list;
  	var cancel = _ref.cancel;
  	var error = _ref.error;

  	return getAllDownloads().then(list).then(function (response) {
  		if (!cancel() && response.some(function (download) {
  			return download.studyStatus === STATUS_RUNNING$1;
  		})) {
  			recursiveGetAll({ list: list, cancel: cancel, error: error });
  		}
  	}).catch(error).then(m.redraw);
  }

  // debounce but call at first iteration
  function debounce(func, wait) {
  	var first = true;
  	var timeout = undefined;
  	return function () {
  		var context = this,
  		    args = arguments;
  		var later = function later() {
  			timeout = null;
  			func.apply(context, args);
  		};
  		clearTimeout(timeout);
  		timeout = setTimeout(later, wait);
  		if (first) {
  			func.apply(context, args);
  			first = false;
  		}
  	};
  }

  /**
   * Remove download
   */

  function remove$1(download, list) {
  	return messages.confirm({
  		header: 'Delete Request:',
  		content: ['Are you sure you want to delete this request from your queue?', m('.text-xs-center', m('small.muted-text', '(Don\'t worry, the data will stay on our servers and you can request it again in the future)'))]
  	}).then(function (response) {
  		if (response) return doRemove(download, list);
  	});
  }

  function doRemove(download, list) {
  	list(list().filter(function (el) {
  		return el !== download;
  	}));
  	m.redraw();
  	removeDownload(download).catch(function (err) {
  		list().push(download);
  		return messages.alert({
  			header: 'Delete Request',
  			content: err.message
  		});
  	});
  }

  /**
   * Create download
   */

  function create$1(list, cancel) {
  	var output = m.prop();
  	return createMessage$1({ output: output }).then(function (response) {
  		if (response) {
  			var download = unPropify$1(output());
  			list().unshift(Object.assign({
  				studyStatus: STATUS_RUNNING$1,
  				creationDate: new Date()
  			}, download));
  			cancel(true);
  			return createDownload(download).then(function () {
  				cancel(false);
  				getAll({ list: list, cancel: cancel });
  			}).catch(reportError$1).then(cancel.bind(null, false));
  		}
  	});
  }

  var unPropify$1 = function unPropify(obj) {
  	return Object.keys(obj).reduce(function (result, key) {
  		result[key] = obj[key]();
  		return result;
  	}, {});
  };

  var reportError$1 = function reportError(header) {
  	return function (err) {
  		return messages.alert({ header: header, content: err.message });
  	};
  };

  var TABLE_WIDTH$1 = 7;

  var downloadsComponent = {
  	controller: function controller() {
  		var list = m.prop([]);
  		var cancelDownload = m.prop(false);

  		var ctrl = {
  			list: list,
  			cancelDownload: cancelDownload,
  			create: create$1,
  			remove: remove$1,
  			globalSearch: m.prop(''),
  			sortBy: m.prop('studyId'),
  			onunload: function onunload() {
  				cancelDownload(true);
  			},

  			error: m.prop('')
  		};

  		getAll({ list: ctrl.list, cancel: cancelDownload, error: ctrl.error });

  		return ctrl;
  	},
  	view: function view(ctrl) {
  		var list = ctrl.list;
  		return m('.downloads', [m('h2', 'Downloads'), ctrl.error() ? m('.alert.alert-warning', m('strong', 'Warning!! '), ctrl.error().message) : m('table', { class: 'table table-striped table-hover', onclick: sortTable(list, ctrl.sortBy) }, [m('thead', [m('tr', [m('th', { colspan: TABLE_WIDTH$1 }, [m('input.form-control', { placeholder: 'Global Search ...', onkeyup: m.withAttr('value', ctrl.globalSearch) })])]), m('tr', [m('th.text-xs-center', { colspan: TABLE_WIDTH$1 }, [m('button.btn.btn-secondary', { onclick: ctrl.create.bind(null, list, ctrl.cancelDownload) }, [m('i.fa.fa-plus'), '  Download request'])])]), m('tr', [m('th', thConfig$2('studyId', ctrl.sortBy), 'ID'), m('th', 'Data file'), m('th', thConfig$2('db', ctrl.sortBy), 'Database'), m('th', thConfig$2('fileSize', ctrl.sortBy), 'File Size'), m('th', thConfig$2('creationDate', ctrl.sortBy), 'Date Added'), m('th', 'Status'), m('th', 'Actions')])]), m('tbody', [list().length === 0 ? m('tr.table-info', m('td.text-xs-center', { colspan: TABLE_WIDTH$1 }, m('strong', 'Heads up! '), 'There are no downloads running yet')) : list().filter(studyFilter$2(ctrl)).map(function (download) {
  			var _STATUS_COMPLETE$STAT;

  			return m('tr', [
  			// ### ID
  			m('td', download.studyId),

  			// ### Study url
  			m('td', download.studyStatus == STATUS_RUNNING$1 ? m('i.text-muted', 'Loading...') : download.fileSize ? m('a', { href: download.studyUrl, download: true, target: '_blank' }, 'Download') : m('i.text-muted', 'No Data')),

  			// ### Database
  			m('td', download.db),

  			// ### Filesize
  			m('td', download.fileSize !== 'unknown' ? download.fileSize : m('i.text-muted', 'Unknown')),

  			// ### Date Added
  			m('td', [formatDate(new Date(download.creationDate)), '  ', m('i.fa.fa-info-circle'), m('.card.info-box', [m('.card-header', 'Creation Details'), m('ul.list-group.list-group-flush', [m('li.list-group-item', [m('strong', 'Creation Date: '), formatDate(new Date(download.creationDate))]), m('li.list-group-item', [m('strong', 'Start Date: '), formatDate(new Date(download.startDate))]), m('li.list-group-item', [m('strong', 'End Date: '), formatDate(new Date(download.endDate))])])])]),

  			// ### Status
  			m('td', [(_STATUS_COMPLETE$STAT = {}, babelHelpers.defineProperty(_STATUS_COMPLETE$STAT, STATUS_COMPLETE, m('span.label.label-success', 'Complete')), babelHelpers.defineProperty(_STATUS_COMPLETE$STAT, STATUS_RUNNING$1, m('span.label.label-info', 'Running')), babelHelpers.defineProperty(_STATUS_COMPLETE$STAT, STATUS_ERROR, m('span.label.label-danger', 'Error')), _STATUS_COMPLETE$STAT)[download.studyStatus]]),

  			// ### Actions
  			m('td', [m('.btn-group', [m('button.btn.btn-sm.btn-secondary', { onclick: ctrl.remove.bind(null, download, list) }, [m('i.fa.fa-close')])])])]);
  		})])])]);
  	}
  };

  // @TODO: bad idiom! should change things within the object, not the object itself.
  var thConfig$2 = function thConfig(prop, current) {
  	return { 'data-sort-by': prop, class: current() === prop ? 'active' : '' };
  };

  function studyFilter$2(ctrl) {
  	var search = ctrl.globalSearch();
  	return function (study) {
  		return includes(study.studyId, search) || includes(study.studyUrl, search);
  	};

  	function includes(val, search) {
  		return typeof val === 'string' && val.includes(search);
  	}
  }

  var loginComponent = {
  	controller: function controller() {
  		var username = m.prop('');
  		var password = m.prop('');
  		var ctrl = {
  			username: username,
  			password: password,
  			isLoggedIn: isLoggedIn,
  			error: m.prop(''),
  			login: loginAction
  		};

  		return ctrl;

  		function loginAction() {
  			console.log('va', username(), password());
  			login(username, password).then(function () {
  				m.route('/');
  			}).catch(function (response) {
  				ctrl.error(response.message);
  				m.redraw();
  			});
  		}
  	},
  	view: function view(ctrl) {
  		return m('.login.centrify', { config: fullHeight }, [isLoggedIn() ? [m('i.fa.fa-thumbs-up.fa-5x.m-b-1'), m('h5', 'You are already logged in!')] : m('.card.card-inverse.col-md-4', [m('.card-block', [m('h4', 'Please sign in'), m('form', { onsubmit: ctrl.login }, [m('input.form-control', {
  			type: 'username',
  			placeholder: 'Username / Email',
  			value: ctrl.username(),
  			onkeyup: m.withAttr('value', ctrl.username),
  			config: getStartValue(ctrl.username)
  		}), m('input.form-control', {
  			type: 'password',
  			placeholder: 'Password',
  			value: ctrl.password(),
  			onkeyup: m.withAttr('value', ctrl.password),
  			config: getStartValue(ctrl.password)
  		})]), ctrl.error() ? m('.alert.alert-warning', m('strong', 'Warning!! '), ctrl.error()) : '', m('button.btn.btn-primary.btn-block', { onclick: ctrl.login }, 'Sign in')])])]);
  	}
  };

  // m('p.text-center',
  // 	m('a', m('small.text-muted','Lost your password?'))
  // )
  function getStartValue(prop) {
  	console.log('horrible hack to manage chrome pw autocomplete');
  	return function (element, isInit) {
  		// !isInit && prop(element.value);
  		if (!isInit) setTimeout(function () {
  			return prop(element.value);
  		}, 30);
  	};
  }

  var routes = {
  	'/login': loginComponent,
  	'/studies': mainComponent,
  	'/editor/:studyId': editorLayoutComponent,
  	'/editor/:studyId/:resource/:fileID': editorLayoutComponent,
  	'/pool': poolComponent,
  	'/pool/history': poolComponent$1,
  	'/downloads': downloadsComponent
  };

  var layout = function layout(route) {
  	return {
  		controller: function controller() {
  			authorize();
  			if (!isLoggedIn() && m.route() !== '/login') m.route('/login');

  			return { doLogout: doLogout };

  			function doLogout() {
  				logout().then(function () {
  					return m.route('/login');
  				});
  			}
  		},
  		view: function view(ctrl) {
  			return m('.dashboard-root', { class: window.top != window.self ? 'is-iframe' : '' }, [m('nav.navbar.navbar-dark.navbar-fixed-top', [m('a.navbar-brand', { href: '/dashboard/dashboard' }, 'Dashboard'), m('ul.nav.navbar-nav', [m('li.nav-item', [m('a.nav-link', { href: '/studies', config: m.route }, 'Studies')]), m('li.nav-item', [m('a.nav-link', { href: '/pool', config: m.route }, 'Pool')]), m('li.nav-item', [m('a.nav-link', { href: '/downloads', config: m.route }, 'Downloads')]), m('li.nav-item.pull-xs-right', [m('button.btn.btn-info', { onclick: ctrl.doLogout }, [m('i.fa.fa-sign-out'), '  Logout'])])])]), m('.main-content.container-fluid', [route]), m.component(contextMenuComponent), // register context menu
  			m.component(messages), // register modal
  			m.component(spinner) // register spinner
  			]);
  		}
  	};
  };

  var wrappedRoutes = mapObject(routes, layout);
  m.route(document.body, '/studies', wrappedRoutes);

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

}());
//# sourceMappingURL=main.js.map