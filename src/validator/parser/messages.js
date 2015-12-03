export function warn(message, test){
	return {level:'warn', message: message, test:test};
}

export function error(message, test){
	return {level:'error', message: message, test:test};
}

export function row(element, testArr){

	var messages = testArr
		.reduce((previous, current)=>previous.concat(current), []) // concatAll
		.filter(msg => msg) // clean empty
		.filter(msg => typeof msg.test == 'function' ? msg.test(element) : !!msg.test); // run test...

	return !messages.length ? null : {
		element: element,
		messages: messages
	};
}
