export default function(gulp, opts) {
  gulp.task('bundle:lib:js', () => {
    return gulp.src(opts.paths.js.lib)
      .pipe(gulp.$.babel({
        modules: 'system'
      }))
      .pipe(gulp.$.concat('lib.js'))
      .pipe(gulp.dest('dist/js'));
  });

  gulp.task('bundle:mobile:js', () => {
    return gulp.src(opts.paths.js.mobile)
      .pipe(gulp.$.babel({
        modules: 'ignore'
      }))
      .pipe(gulp.$.concat('mobile.js'))
      .pipe(gulp.dest('dist/js'));
  });

  gulp.task('bundle:desktop:js', () => {
    return gulp.src(opts.paths.js.desktop)
      .pipe(gulp.$.babel({
        modules: 'ignore'
      }))
      .pipe(gulp.$.concat('desktop.js'))
      .pipe(gulp.dest('dist/js'));
  });

  gulp.task('bundle:css', () => {
    return gulp.src(opts.paths.css)
      .pipe(gulp.$.less())
      .pipe(gulp.dest('dist/css'));
  });

  gulp.task('bundle:components:js', () => {
    return gulp.src(`${opts.paths.components}/**/*.js`)
      .pipe(gulp.$.babel({
        modules: 'system'
      }))
      .pipe(gulp.$.concat('components.js'))
      .pipe(gulp.dest('dist/js'));
  });

  gulp.task('bundle:components:css', () => {
    return gulp.src(`${opts.paths.components}/**/*.less`)
      .pipe(gulp.$.less())
      .pipe(gulp.dest('dist/components'));
  });

  gulp.task('bundle:components:html', () => {
    return gulp.src(`${opts.paths.components}/**/*.html`)
      .pipe(gulp.$.insert.transform((contents, file) => {
        let name = file.relative.replace(/\w+\//g, '').replace('.html', '');
        return `<dom-module id="${name}">
          ${contents}
        </dom-module>`;
      }))
      .pipe(gulp.$.concat('components.html'))
      .pipe(gulp.dest('dist/components'));
  });
}
