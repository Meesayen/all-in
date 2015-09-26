let gulp = require('gulp');
gulp.$ = require('gulp-load-plugins')();

let indexOf = (str, part) => {
  let i = str.indexOf(part);
  if (~i) {
    return i;
  }
  return false;
};

export let scripts = (src, dest) => {
  return function scripts() {
    return gulp.src(src, {since: gulp.lastRun(scripts)})
      .pipe(gulp.$.babel({
        externalHelpers: true,
        modules: 'system'
      }))
      .pipe(gulp.dest(dest))
      .pipe(gulp.$.livereload());
  };
};

export let styles = (src, dest) => {
  return function styles() {
    return gulp.src(src, {since: gulp.lastRun(styles)})
      .pipe(gulp.$.less())
      .pipe(gulp.dest(dest))
      .pipe(gulp.$.livereload());
  };
};

export let html = (src, dest) => {
  return function html() {
    return gulp.src(src, {since: gulp.lastRun(html)})
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
      .pipe(gulp.dest(dest))
      .pipe(gulp.$.livereload());
  };
};
