let gulp = require('gulp');
gulp.$ = require('gulp-load-plugins')();

export let es6ml = () => {
  return gulp.src('node_modules/es6-micro-loader/dist/system-polyfill.min.js')
    .pipe(gulp.$.rename('es6ml.js'))
    .pipe(gulp.dest('dist/vendor/'));
};

export let babel = () => {
  return gulp.src('node_modules/babel-core/external-helpers.min.js')
    .pipe(gulp.$.rename('babel.js'))
    .pipe(gulp.dest('dist/vendor/'));
};

export let resources = () => {
  return gulp.src('src/client/resources/**/*')
    .pipe(gulp.dest('dist/'));
};
