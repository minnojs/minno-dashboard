/*eslint-env node*/
var gulp       = require('gulp'),
	plumber	   = require('gulp-plumber'),
	rollup     = require('gulp-rollup'),
	babel      = require('rollup-plugin-babel'),
	sourcemaps = require('gulp-sourcemaps');

//var debug = require('gulp-debug');

gulp.task('bundle', function(){
	gulp.src('src/main.js', {read: false})
		.pipe(plumber())
		.pipe(rollup({

			format: 'iife',
			// any option supported by rollup can be set here, including sourceMap
			sourceMap: true,
			plugins: [
				{resolveId: function(id, importer){
					var path = require('path');
					if (!importer) return;
					if (!/^[\.]*\//.test(id)) {
						return path.resolve( './src', id + '.js');
					}
				}},
				babel({exclude: 'node_modules/**',  'presets': [ 'es2015-rollup' ]})
			]
		}))
		.pipe(sourcemaps.write('.')) // this only works if the sourceMap option is true
		.pipe(gulp.dest('dist'));
});


gulp.task('css', function(){
	var sass = require('gulp-sass');

	gulp.src('src/style/**/*.scss')
		.pipe(plumber())
		.pipe(sass({errLogToConsole: true}))
		.pipe(gulp.dest('dist'));
});


gulp.task('watch', function () {
	gulp.watch('src/**/*', ['bundle','css']);
});