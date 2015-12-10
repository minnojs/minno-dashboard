class File {
	constructor(url){
		this.url = url;

		// keep track of file content
		this.sourceContent = m.prop('');
		this.content = (store => {
			var prop = (...args) => {
				if (args.length) {
					store = args[0];
					this.checkSyntax();
				}
				return store;
			};

			prop.toJSON = () => store;

			return prop;
		})('');

		// this is set within the load function
		this.loaded = false;
		this.error = false;

		// these are defined when calling checkSyntax
		this.syntaxValid = undefined;
		this.syntaxData = undefined;
	}

	load(){
		return new Promise((resolve, reject) => {
			m
				.request({method:'GET', url:this.url,background:true, deserialize: text => text})
				.then(script => {
					m.startComputation();
					this.sourceContent(script);
					this.content(script);
					this.loaded = true;
					m.endComputation();
				}, () => {
					this.error = true;
				})
				.then(resolve, reject);
		});
	}

	save(){
		alert('Saving content: not implemented yet');
	}

	hasChanged() {
		return this.sourceContent() === this.content();
	}

	define(context){
		var requirejs = (context || window).requirejs;
		var name = this.url;
		var content = this.content();

		return new Promise((resolve) => {
			requirejs.undef(name);
			context.eval(content.replace(`define(`,`define('` + name + `',`));
			resolve();
		});
	}

	require(context){
		var requirejs = (context || window).requirejs;
		return new Promise((resolve, reject) => {
			requirejs([this.url], resolve,reject);
		});
	}

	checkSyntax(){
		var jshint = window.JSHINT;
		this.syntaxValid = jshint(this.content(), jshintOptions);
		this.syntaxData = jshint.data();
		return this.syntaxValid;
	}
}

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

export default File;