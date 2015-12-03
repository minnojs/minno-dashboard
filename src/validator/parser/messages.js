export function warn(message, test){
	return {level:'warn', message: message, test:test};
}

export function error(message, test){
	return {level:'error', message: message, test:test};
}

export function row(element, testArr){
	var messages = flatten(testArr)
		.filter(msg => msg) // clean empty
		.filter(msg => typeof msg.test == 'function' ? msg.test(element) : !!msg.test); // run test...

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