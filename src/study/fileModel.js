import {fetchVoid, fetchJson} from 'utils/modelHelpers';
export default fileFactory;
let baseUrl = '/dashboard/dashboard';

/**
 * file = {
 * 	id: #hash,
 * 	url: URL
 * }
 */

let filePrototype = {
	apiUrl(){
		return `${baseUrl}/files/${encodeURIComponent(this.studyId)}/file/${encodeURIComponent(this.id)}`;
	},

	get(){
		return fetchJson(this.apiUrl())
			.then(response => {
				this.sourceContent(response.content);
				this.content(response.content);
				this.loaded = true;
				this.error = false;
			})
			.catch(reason => {
				this.loaded = true;
				this.error = true;
				return Promise.reject(reason); // do not swallow error
			});
	},

	save(){
		return fetchJson(this.apiUrl(), {
			method:'put',
			body: {content: this.content}
		})
			.then(response => {
				this.sourceContent(this.content()); // update source content
				return response;
			});
	},

	move(path, study){
		let basePath = (path.substring(0, path.lastIndexOf('/'))) + '/';
		let folderExists = basePath === '/' || study.files().some(f => f.isDir && f.path === basePath);

		if (!folderExists) return Promise.reject({message: `Folder ${basePath} does not exist.`});
		if (study.files().some(f=>f.path === path)) return Promise.reject({message: `File ${path} already exists.`});

		let oldPath = this.path;
		this.setPath(path);
		return fetchJson(this.apiUrl() + `/move/${encodeURIComponent(path)}`, {
			method:'post'
		})
			.then(response => {
				this.id = response.id;
				this.url = response.url;
			})
			.catch(response => {
				this.setPath(oldPath);
				return Promise.reject(response);
			});
	},

	del(){
		return fetchVoid(this.apiUrl(), {method:'delete'});
	},


	hasChanged() {
		return this.sourceContent() === this.content();
	},

	define(context = window){
		var requirejs = context.requirejs;
		var name = this.url;
		var content = this.content();

		return new Promise((resolve) => {
			requirejs.undef(name);
			context.eval(content.replace(`define(`,`define('` + name + `',`));
			resolve();
		});
	},

	require(context = window){
		var requirejs = context.requirejs;
		return new Promise((resolve, reject) => {
			requirejs([this.url], resolve,reject);
		});
	},

	checkSyntax(){
		var jshint = window.JSHINT;
		this.syntaxValid = jshint(this.content(), jshintOptions);
		this.syntaxData = jshint.data();
		return this.syntaxValid;
	},

	setPath(path){
		this.path = path;
		this.name = path.substring(path.lastIndexOf('/')+1);
		this.basePath = (path.substring(0, path.lastIndexOf('/'))) + '/';
		this.type = path.substring(path.lastIndexOf('.')+1);
	}
};

var jshintOptions = {
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
};

const fileFactory = fileObj => {
	let file = Object.create(filePrototype);
	let path = decodeURIComponent(fileObj.path);


	file.setPath(path);

	Object.assign(file, fileObj, {
		id				: fileObj.id,
		sourceContent	: m.prop(fileObj.content || ''),
		content 		: contentProvider.call(file, fileObj.content || ''), // custom m.prop, alows checking syntax on change

		// keep track of loaded state
		loaded			: false,
		error 			: false,

		// these are defined when calling checkSyntax
		syntaxValid 	: undefined,
		syntaxData 		: undefined
	});

	file.content(fileObj.content || '');

	if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(file => Object.assign(file, {studyId: fileObj.studyId}));

	return file;


	function contentProvider (store) {
		var prop = (...args) => {
			if (args.length) {
				store = args[0];
				this.type === 'js' && this.checkSyntax();
			}
			return store;
		};

		prop.toJSON = () => store;

		return prop;
	}
};