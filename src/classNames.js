// taken from here:
// https://github.com/JedWatson/classnames/blob/master/index.js
var hasOwn = {}.hasOwnProperty;

function classNames () {
	var classes = '';

	for (var i = 0; i < arguments.length; i++) {
		var arg = arguments[i];
		if (!arg) continue;

		var argType = typeof arg;

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

export default classNames;
