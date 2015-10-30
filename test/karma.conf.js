module.exports = function (config) {
  'use strict';

  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    files: [
      // Source files
      'src/Promise.js',
      'src/Deferred.js',
      'src/Deferred.resolve.js',
      'src/Deferred.reject.js',
      'src/Deferred.all.js',
      'src/Deferred.race.js',

      // Spec
      'test/spec/*.spec.js'
    ],
    browsers: [
      'PhantomJS'
      //'Chrome'
    ],
    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher'
    ],
    singleRun: true,
    reporters: [
      'progress',
      'coverage'
    ],
    preprocessors: {
      'src/*.js': ['coverage']
    },
    htmlReporter: {
      outputDir: 'test/report/html/',
      focusOnFailures: true
    },
    usePolling: true
  });
};
