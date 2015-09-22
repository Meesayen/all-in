export default function(gulp, opts) {
  let indexOf = (str, part) => {
    let i = str.indexOf(part);
    if (~i) {
      return i;
    }
    return false;
  };

  gulp.task('compile:js', () => {
    return gulp.src(opts.paths.js, {since: gulp.lastRun('compile:js')})
      .pipe(gulp.$.babel({
        externalHelpers: true,
        modules: 'system'
      }))
      .pipe(gulp.dest('dist/'))
      .pipe(gulp.$.livereload());
  });

  gulp.task('compile:css', () => {
    return gulp.src(opts.paths.css, {since: gulp.lastRun('compile:css')})
      .pipe(gulp.$.less())
      .pipe(gulp.dest('dist/'))
      .pipe(gulp.$.livereload());
  });

  gulp.task('compile:html', () => {
    return gulp.src(opts.paths.html, {since: gulp.lastRun('compile:html')})
      .pipe(gulp.$.insert.transform((contents, file) => {
        let imports = '';
        if (~contents.indexOf('link rel="import"')) {
          let index = indexOf(contents, '<style') ||
              indexOf(contents, '<template') ||
              indexOf(contents, '<script');
          imports = contents.substr(0, index || undefined);
          contents = contents.substr(index || -1);
        }
        let name = file.relative.replace(/\w+\//g, '').replace('.html', '');
        let scriptPath = file.relative.replace('.html', '');
        return `${imports}
        <dom-module id="${name}">
          ${contents}
          <script>System.import('${scriptPath}')</script>
        </dom-module>`;
      }))
      .pipe(gulp.dest('dist/'))
      .pipe(gulp.$.livereload());
  });
}
