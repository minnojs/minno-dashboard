import bubel from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import includePaths from 'rollup-plugin-includepaths';
import { uglify } from 'rollup-plugin-uglify';

const production = process.env.NODE_ENV == 'production';

export default {
    input: 'src/main.js',
    output :{
        format: 'iife',
        file: 'dist/main.js',
        sourcemap: true
    },
    plugins: [
        resolve(),
        commonjs(),
        // load paths without a leading slash of src
        includePaths({
            paths: ['src']
        }),
        bubel(),
        production && uglify({output:{comments:'some' }}) // minify, but only in production
    ]
};
