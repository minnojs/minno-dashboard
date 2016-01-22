import {toJSON, catchJSON, checkStatus} from 'utils/modelHelpers';
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
		return `${baseUrl}/files/${encodeURIComponent(this.studyID)}/file/${encodeURIComponent(this.id)}`;
	},

	get(){
		return fetch(this.apiUrl(), {credentials: 'same-origin'})
			.then(checkStatus)
			.then(toJSON)
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
		return fetch(this.apiUrl(), {
			credentials: 'same-origin',
			method:'put',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				content: this.content
			})
		})
			.then(checkStatus)
			.then(response => {
				this.sourceContent(this.content()); // update source content
				return response;
			})
			.catch(catchJSON);
	},

	del(){
		return fetch(this.apiUrl(), {method:'delete',credentials: 'same-origin'})
			.then(checkStatus);
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
	let url = fileObj.url;

	Object.assign(file, fileObj, {
		name			: url.substring(url.lastIndexOf('/')+1),
		type			: url.substring(url.lastIndexOf('.')+1),
		id				: fileObj.id,
		sourceContent	: m.prop(fileObj.content || ''),
		content 		: contentProvider.call(file),

		// keep track of loaded state
		loaded			: false,
		error 			: false,

		// these are defined when calling checkSyntax
		syntaxValid 	: undefined,
		syntaxData 		: undefined
	});

	file.content(fileObj.content || '');

	if (fileObj.files) file.files = fileObj.files.map(fileFactory).map(file => Object.assign(file, {studyID: fileObj.studyID}));

	return file;


	function contentProvider (store) {
		var prop = (...args) => {
			if (args.length) {
				store = args[0];
				this.checkSyntax();
			}
			return store;
		};

		prop.toJSON = () => store;

		return prop;
	}
};