export default jshintOptions;
let jshintOptions = {
    // JSHint Default Configuration File (as on JSHint website)
    // See http://jshint.com/docs/ for more details

    'curly'         : false,    // true: Require {} for every new block or scope
    'latedef'       : 'nofunc', // true: Require variables/functions to be defined before being used
    'undef'         : true,     // true: Require all non-global variables to be declared (prevents global leaks)
    'unused'        : 'vars',   // Unused variables:
    'strict'        : false,    // true: Requires all functions run in ES5 Strict Mode

    'browser'       : true,     // Web Browser (window, document, etc)
    'devel'         : true,     // Development/debugging (alert, confirm, etc)

    esversion   : 3,        // Require es3 syntax for backward compatibility

    // Custom Globals
    predef: ['piGlobal','define','require','requirejs','angular']
};
