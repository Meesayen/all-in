var scriptsDefs = require('./views/scripts.json');

module.exports = function(config) {
  config.set({
    basePath: 'src/',
    frameworks: ['mocha', 'chai', 'browserify'],
    files: scriptsDefs.vendorScripts.map(function(item) {
      return ~item.url.indexOf('//') ? 'http:' + item.url : '../public' + item.url;
    }).concat([
      '../public/js/templates.js',
      'client/scripts/mock/server.js',
      'client/scripts/**/*.test.js',
      { pattern: 'client/scripts/**/*.js',
        included: false },
      { pattern: 'client/scripts/**/*.js',
        included: false }
    ]),
    preprocessors: {
      'client/scripts/mock/server.js': ['browserify'],
      'client/scripts/**/*.test.js': ['browserify']
    },
    browserify: {
      transform: ['babelify'],
      basedir: 'src/'
    },
    colors: true,
    reporters: ['mocha'],
    port: 9876,
    logLevel: config.LOG_INFO,
    // browsers: ['Chrome'],
    browsers: ['PhantomJS2'],
    singleRun: true,
    autoWatch: true
  });
};
