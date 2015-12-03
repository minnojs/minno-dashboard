/*eslint-env node*/
var gulp       = require('gulp'),
	rollup     = require('gulp-rollup'),
	sourcemaps = require('gulp-sourcemaps');

gulp.task('bundle', function(){
	gulp.src('src/main.js', {read: false})
		.pipe(rollup({
			format: 'iife',
			// any option supported by rollup can be set here, including sourceMap
			sourceMap: true
		}))
		.pipe(sourcemaps.write('.')) // this only works if the sourceMap option is true
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
	gulp.watch('src/**/*.js', ['bundle']);
});