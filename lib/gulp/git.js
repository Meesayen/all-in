let gulp = require('gulp');
gulp.$ = require('gulp-load-plugins')();
let log = gulp.$.util.log.bind(gulp.$.util);
let colors = gulp.$.util.colors;


function gitPush(remote, branch) {
  log(
    colors.yellow('Pushing'),
    colors.magenta(branch),
    colors.yellow('branch.'));
  return new Promise((resolve, reject) => {
    gulp.$.git.push(remote, branch, { quiet: true }, err => {
      if (err) {
        reject(colors.red('push-branch: Error during push', err));
      } else {
        resolve();
      }
    });
  });
}

function gitPullRemoteMaster(remote, masterBranch, branch) {
  log(
    colors.yellow('Merging with remote'),
    colors.magenta(masterBranch),
    colors.yellow('branch.'));
  return new Promise((resolve, reject) => {
    gulp.$.git.pull(remote, masterBranch, { quiet: true }, err => {
      if (err) {
        reject(colors.red(
            `push-branch: Error pulling from ${masterBranch}`, err));
      } else {
        resolve(branch);
      }
    });
  });
}

function gitPullRemoteBranch(remote, branch) {
  log(
    colors.yellow('Merging with remote branch'),
    colors.magenta(branch));
  return new Promise((resolve, reject) => {
    gulp.$.git.pull(remote, branch, { quiet: true }, err => {
      if (err) {
        reject(colors.red(
            'push-branch: Error pulling from branch', err));
      } else {
        resolve(branch);
      }
    });
  });
}

function gitLsRemote(remote, branch) {
  log(
    colors.yellow('Checking if remote branch'),
    colors.magenta(branch),
    colors.yellow('exists.'));
  return new Promise((resolve) => {
    gulp.$.git.exec({
      args: `ls-remote --exit-code ${remote} ${branch}`,
      quiet: true
    }, err => {
      resolve({ branch, exists: !err || err.code === 0 });
    });
  });
}

function gitRevParse() {
  return new Promise((resolve, reject) => {
    gulp.$.git.revParse({
      args: '--abbrev-ref HEAD',
      quiet: true
    }, (err, branch) => {
      if (err) {
        reject(colors.red('push-branch: Error during revParse', err));
      } else {
        resolve(branch);
      }
    });
  });
}

function gitStatus() {
  return new Promise((resolve, reject) => {
    gulp.$.git.status({ args: '--porcelain', quiet: true }, (err, stats) => {
      if (err) {
        reject(colors.red('push-branch: Error during status'));
      } else if (stats !== '') {
        reject(colors.red('You have uncommitted changes'));
      } else {
        resolve();
      }
    });
  });
}

export function pushBranch({
  master: masterBranch='master',
  remote: remote='origin'
}={}) {
  return function _pushBranch(done) {
    log(colors.yellow('Checking for uncommitted changes.'));
    gitStatus()
      .then(gitRevParse)
      .then(branch => {
        if (branch === masterBranch) {
          throw [colors.red(
              'push-branch: You are not allowed to directly push to'),
              colors.magenta(masterBranch)]
        }
        return gitLsRemote(remote, branch);
      })
      .then(({ branch, exists }) => {
        if (exists) {
          return gitPullRemoteBranch(remote, branch);
        }
        log(
          colors.yellow('Branch'),
          colors.magenta(branch),
          colors.yellow('does not exist. Creating one.'));
        return branch;
      })
      .then(branch => {
        return gitPullRemoteMaster(remote, masterBranch, branch);
      })
      .then(branch => {
        return gitPush(remote, branch);
      })
      .then(done)
      .catch(err => {
        if (err instanceof Array) {
          log(err);
        } else {
          log.call(log, err);
        }
        done();
      });
  };
}
