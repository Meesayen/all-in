/* jshint -W079 */
var
  gulp = require('gulp'),
  gladius = require('gladius-forge'),
  server = require('./server').http;


/**
 * Here you can configure the gulp build system with custom folders, different
 * build modules, etc.
 * ------------------------------------------------------------------------- */
gladius.config(gulp, {
  modules: {
    // module to use to preprocess your stylesheets. default: less
    // possible values: less, sass, sassCompass, stylus, myth.
    styles: 'less',
    // module to use to preprocess your stylesheets. default: handlebars
    // possible values: handlebars, jade, dust, dot.
    templates: 'jade'
  },
  paths: {
    src: {
      // folder home of your source files (less, js, etc). default: src/
      base: 'src/',

      // styles sources folder. default: styles/
      styles: 'client/styles/',

      // scripts folder. default: scripts/
      scripts: 'client/scripts/',

      // file extension for es6+ scripts. default: .es6
      esnextExtension: '.js',

      // templates and partials folder: default: ../views/, partials/
      templates: '../views/',
      partials: 'partials/'
    },

    out: {
      // folder destination for built bundles. default: public/
      base: 'public/',

      // production ready styles folder. default: css/
      styles: 'css/',

      // production ready scripts folder. default: js/
      scripts: 'js/'
    }
  },
  // if the gulpfile is located in a different folder to the one which contains
  // your scripts, a force clean is required, to wipe the temp folder.
  forceClean: false,
  // express web server to use while developing.
  // port default: 3000
  // liveReloadPort default: 35729
  server: server,
  port: 3000,
  liveReloadPort: null
});




/**
 * Here you can hook extra tasks as dependency for predefined tasks (insert
 * a leading '!' to remove dependencies) or add additional sources (insert a
 * leading '!' to the path to delcare sources which should be ignored).
 * ------------------------------------------------------------------------- */
gladius.setupTasks({
  'bundle-js': {
    deps: ['copy:components'],
    src: []
  },
  'bundle-js:dev': {
    deps: ['bundle-mock-server', 'copy:components', '!lint', '!babelify'],
    src: []
  },
  'lint': {
    deps: [],
    src: [
      '!src/client/scripts/vendor/**/*',
      '!src/client/scripts/mock/lib/**/*',
    ]
  }
});


/**
 * Add extra gulp tasks below
 * ------------------------------------------------------------------------- */
var $ = gladius.getPlugins();


/* Mock server bundling */
gulp.task('bundle-mock-server', ['lint', 'babelify'], function() {
  return gulp.src(['src/temp/mock/server.js'])
  .pipe($.browserify({
    insertGlobals: false,
    debug: true
  }))
  .pipe($.rename(function (path) {
    path.basename = 'mock-server';
    path.extname = '.js';
  }))
  .pipe(gulp.dest('public/js/'));
});

// TODO: better bundling. System.js module?
gulp.task('copy:components:js', function() {
  return gulp.src([
    'src/client/components/**/*.js'
  ])
  .pipe($.jshint({
    lookup: true
  }))
  .pipe($.babel())
  .pipe(gulp.dest('public/components'));
});
gulp.task('copy:components', ['copy:components:js'], function() {
  return gulp.src([
    'src/client/components/**/*',
    '!src/client/components/**/*.js'
  ])
  .pipe(gulp.dest('public/components'));
});

gulp.task('copy:assets', function() {
  return gulp.src([
    'assets/**/*'
  ])
  .pipe(gulp.dest('public'));
});

/**
 * Add extra gulp watchers below
 * ------------------------------------------------------------------------- */

// override
gulp.task('watch', ['serve'], function () {
  gulp.watch('src/client/scripts/**/*.js', ['bundle-js:dev:clean']);
  gulp.watch('src/client/styles/**/*', ['styles']);
  gulp.watch('src/views/partials/**/*', ['tpl-reload']);
  gulp.watch('src/client/components/**/*', ['copy:components']);
});



/**
 * Here you can inject extra tasks into the main tasks. Those will be appendend
 * and concurrently run with other tasks.
 * ------------------------------------------------------------------------- */
gladius.setupMain({
  'development': [
  ],
  'test': [],
  'production': [
    'copy:assets'
  ]
});

gulp.task('post-install-development', [
  'styles',
  'bundle-js:dev:clean',
  'copy:assets',
  'tpl-precompile',
  'watch'
]);
