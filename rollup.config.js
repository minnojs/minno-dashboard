import bubel from 'rollup-plugin-buble';

export default {
	format: 'iife',
	entry: 'src/main.js',
	dest: 'dist/main.js',
	// any option supported by rollup can be set here, including sourceMap
	sourceMap: true,
	plugins: [
		// load paths wihtout a leading slash of src
		{resolveId: function(id, importer){
			var path = require('path');
			if (!importer) return;
			if (!/^[\.]*\//.test(id)) {
				return path.resolve( './src', id + '.js');
			}
		}},
		bubel()
	]
};
