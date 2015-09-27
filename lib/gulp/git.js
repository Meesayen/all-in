let gulp = require('gulp');
gulp.$ = require('gulp-load-plugins')();
let log = gulp.$.util.log.bind(gulp.$.util);
let colors = gulp.$.util.colors;

export function pushBranch({
  master: masterBranch='master', // jshint ignore:line
  remote: remote='origin' // jshint ignore:line
}={}) {
  return function pushBranch(cb) {
    log(colors.yellow('Checking for uncommitted changes.'));
    gulp.$.git.status({args: '--porcelain', quiet: true}, (err, stats) => {
      if (err) {
        log(colors.red('push-branch: Error during status'));
        return cb();
      }
      if (stats !== '') {
        log(colors.red('You have uncommitted changes'));
        return cb();
      }
      gulp.$.git.revParse({
        args: '--abbrev-ref HEAD',
        quiet: true
      }, (err, branch) => {
        if (err) {
          log(colors.red('push-branch: Error during revParse', err));
          return cb();
        }
        if (branch === masterBranch) {
          log(colors.red(
              'push-branch: You are not allowed to directly push to'),
            colors.magenta(masterBranch)
          );
          return cb();
        }
        log(
          colors.yellow('Checking if remote branch'),
          colors.magenta(branch),
          colors.yellow('exists.'));
        gulp.$.git.exec({
          args: `ls-remote --exit-code ${remote} ${branch}`,
          quiet: true
        }, err => {
          if (!err || err.code === 0) {
            log(
              colors.yellow('Merging with remote branch'),
              colors.magenta(branch));
            gulp.$.git.pull(remote, branch, {quiet: true}, err => {
              if (err) {
                log(colors.red(
                    'push-branch: Error pulling from branch', err));
                return cb();
              }
              log(
                colors.yellow('Merging with remote'),
                colors.magenta(masterBranch),
                colors.yellow('branch.'));
              gulp.$.git.pull(remote, masterBranch, {quiet: true}, err => {
                if (err) {
                  log(colors.red(
                      `push-branch: Error pulling from ${masterBranch}`, err));
                  return cb();
                }
                log(
                  colors.yellow('Pushing'),
                  colors.magenta(branch),
                  colors.yellow('branch.'));
                gulp.$.git.push(remote, branch, {quiet: true}, err => {
                  if (err) {
                    log(colors.red('push-branch: Error during push', err));
                  }
                  cb();
                });
              });
            });
          } else {
            log(
              colors.yellow('Branch'),
              colors.magenta(branch),
              colors.yellow('does not exist. Creating one.'));
            log(
              colors.yellow('Merging with remote'),
              colors.magenta(masterBranch),
              colors.yellow('branch.'));
            gulp.$.git.pull(remote, masterBranch, {quiet: true}, err => {
              if (err) {
                log(colors.red(
                    `push-branch: Error pulling from ${masterBranch}`, err));
                return cb();
              }
              log(
                colors.yellow('Pushing'),
                colors.magenta(branch),
                colors.yellow('branch.'));
              gulp.$.git.push(remote, branch, {quiet: true}, err => {
                if (err) {
                  log(colors.red(
                      'push-branch: Error during push', err));
                }
                cb();
              });
            });
          }
        });
      });
    });
  };
}
