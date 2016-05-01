export default transformProp;

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
