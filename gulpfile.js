require('babel/register');

var
  gulp = require('gulp'),
  s = gulp.series.bind(gulp),
  p = gulp.parallel.bind(gulp),
  server = require('./server').http;

gulp.$ = require('gulp-load-plugins')();

require('./lib/gulp/copy')(gulp, {});
require('./lib/gulp/compile')(gulp, {
  paths: {
    js: ['src/client/**/*.js'],
    css: ['src/client/**/*.less'],
    html: ['src/client/**/*.html']
  }
});

gulp.task('watch', function() {
  gulp.$.livereload.listen();
  gulp.watch('src/client/**/*.js', p('compile:js'));
  gulp.watch('src/client/**/*.less', p('compile:css'));
  gulp.watch('src/client/**/*.html', p('compile:html'));
});

gulp.task('serve', function() {
  server.listen(3000, function() {
    console.log('Express server listening on port ' +
        3000);
  });
});

gulp.task('compile:all', p(
  'compile:js',
  'compile:css',
  'compile:html'
));

gulp.task('dev', s(
  'compile:all',
  p('copy:babel', 'copy:es6ml', 'copy:resources'),
  p('watch', 'serve')
));
