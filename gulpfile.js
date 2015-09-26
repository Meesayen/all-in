'use strict';

require('babel/register', {
  only: 'es6.modules'
});

var
  gulp = require('gulp'),
  s = gulp.series.bind(gulp),
  p = gulp.parallel.bind(gulp),
  livereload = require('gulp-livereload'),
  server = require('./server').http,
  compile = require('./lib/gulp/compile'),
  copy = require('./lib/gulp/copy');


let paths = {
  base: 'src/client/',
  get js() {
    return `${this.base}**/*.js`;
  },
  get css() {
    return `${this.base}**/*.less`;
  },
  get html() {
    return `${this.base}**/*.html`;
  },
  dist: 'dist/'
};

// Compilers
let compileScripts = compile.scripts(paths.js, paths.dist);
let compileStyles = compile.styles(paths.css, paths.dist);
let compileHtml = compile.html(paths.html, paths.dist);

let compileAll = p(
  compileScripts,
  compileStyles,
  compileHtml
);

// Copy tasks
let copyAll = p(
  copy.es6ml,
  copy.babel,
  copy.resources
);

// Awesome incremental rebuild
function watch(done) {
  var opts = {ignoreInitial: true};
  livereload.listen();
  gulp.watch('src/client/**/*.js', opts, compileScripts);
  gulp.watch('src/client/**/*.less', opts, compileStyles);
  gulp.watch('src/client/**/*.html', opts, compileHtml);
  done();
}

// Server run
function serve(done) {
  server.listen(3000, function() {
    console.log('Express server listening on port ' +
        3000);
  });
  done();
}

// Development task (default)
gulp.task('default', s(
  compileAll,
  copyAll,
  p(watch, serve)
));

// Production task
gulp.task('production', s(
  compileAll,
  copyAll
));
