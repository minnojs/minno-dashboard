import textInputComponent from './textInput';
export default arrayInput;

let arrayInput = args => {
	let identity = arg => arg;
	let fixedArgs = Object.assign(args);
	fixedArgs.prop = transformProp({
		prop: args.prop,
		output: arr => arr.map(args.fromArr || identity).join('\n'),
		input: str => str.replace(/\n*$/, '').split('\n').map(args.toArr || identity)
	});

	return m.component(textInputComponent, fixedArgs);
};

/**
 * TransformedProp transformProp(Prop prop, Map input, Map output)
 * 
 * where:
 *	Prop :: m.prop
 *	Map  :: any Function(any)
 *
 *	Creates a Transformed prop that pipes the prop through transformation functions.
 **/
let transformProp = ({prop, input, output}) => {
	let p = (...args) => {
		if (args.length) prop(input(args[0]));
		return output(prop());
	};

	p.toJSON = () => output(prop());

	return p;
};
