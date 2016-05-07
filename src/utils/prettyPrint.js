const END_LINE = '\n';
const TAB = '\t';
export let indent = (str, tab = TAB) => str.replace(/^/gm, tab);

export let print = obj => {
	switch (typeof obj) {
		case 'boolean': return obj ? 'true' : 'false';
		case 'string' : return printString(obj); 
		case 'number' : return obj + '';
		case 'function': 
			if (obj.toJSON) return print(obj()); // Support m.prop
			else return obj.toString();
	}

	if (Array.isArray(obj)) return printArray(obj);
	
	return printObj(obj);

	function printString(str){
		return str === '' ? str : str
			// escape string
			.replace(/[\\"']/g, '\\$&')
			.replace(/\u0000/g, '\\0')
			// manage rows separately
			.split(END_LINE)
			.map(str => `'${str}'`)
			.join(` +${END_LINE}${TAB}`);
	}
	
	function printArray(arr){
		let isShort = arr.every(element => ['string', 'number', 'boolean'].includes(typeof element) && (element.length === undefined || element.length < 15) );
		let content = arr
			.map(value => print(value))
			.join(isShort ? ', ' : ',\n');

		return isShort
			? `[${content}]`
			: `[\n${indent(content)}\n]`;
	}

	function printObj(obj){
		let content = Object.keys(obj)
			.map(key => `${key} : ${print(obj[key])}`)
			.map(row => indent(row))
			.join(',' + END_LINE);
		return `{\n${content}\n}`;
	}
};
