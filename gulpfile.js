require('babel/register');

var
  gulp = require('gulp'),
  run = require('run-sequence'),
  server = require('./server').http;

gulp.$ = require('gulp-load-plugins')();


// require('./lib/gulp/bundle')(gulp, {
//   paths: {
//     js: {
//       mobile: [
//         'src/client/lib/**/*.js',
//         'src/client/scripts/pages/mobile.js'
//       ],
//       desktop: [
//         'src/client/scripts/desktop/**/*.js',
//         'src/client/scripts/pages/desktop.js'
//       ],
//       lib: [
//         'src/client/lib/**/*.js'
//       ]
//     },
//     css: 'src/client/styles/**/*.less',
//     components: 'src/client/components/!(lib)'
//   }
// });

require('./lib/gulp/copy')(gulp, {});
require('./lib/gulp/compile')(gulp, {
  paths: {
    js: ['src/client/**/*.js'],
    css: ['src/client/**/*.less'],
    html: ['src/client/**/*.html']
  }
});

gulp.task('watch', ['serve'], function() {
  gulp.watch('src/client/**/*.js', ['compile:js']);
  gulp.watch('src/client/**/*.less', ['compile:css']);
  gulp.watch('src/client/**/*.html', ['compile:html']);
});

gulp.task('serve', function() {
  server.listen(3000, function() {
    console.log('Express server listening on port ' +
        3000);
  });
});

gulp.task('bundle:js', [
  'bundle:lib:js',
  'bundle:mobile:js',
  'bundle:desktop:js',
  'bundle:components:js'
]);

gulp.task('compile:all', [
  'compile:js',
  'compile:css',
  'compile:html'
]);

gulp.task('dev', function(cb) {
  run(
    'compile:all',
    ['copy:babel', 'copy:es6ml', 'copy:resources'],
    'watch',
    cb
  );
});
