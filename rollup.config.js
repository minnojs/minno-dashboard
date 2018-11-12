import bubel from 'rollup-plugin-buble';
import { uglify } from "rollup-plugin-uglify";

const production = process.env.NODE_ENV == 'production';

export default {
    input: 'src/main.js',
    output :{
        format: 'iife',
        file: 'dist/main.js',
        sourcemap: true
    },
    plugins: [
        // load paths wihtout a leading slash of src
        {resolveId: function(id, importer){
            var path = require('path');
            if (!importer) return;
            if (!/^[\.]*\//.test(id)) {
                return path.resolve( './src', id + '.js');
            }
        }},
        bubel(),
        production && uglify({output:{comments:'some' }}) // minify, but only in production
    ]
};
