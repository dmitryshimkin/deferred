'use strict';

var buble = require('rollup-plugin-buble');
var gulp = require('gulp');
var fs = require('fs');
var rename = require('gulp-rename');
var rollup = require('rollup');
var sizereport = require('gulp-sizereport');
var uglify = require('gulp-uglify');

var pkg = require('./package.json');

function getBanner () {
  return [
    '/**',
    ' * Deferred',
    ' * Version: ' + pkg.version,
    ' * Author: ' + pkg.author,
    ' * License: MIT',
    ' * https://github.com/dmitryshimkin/deferred',
    ' */',
    ''
  ].join('\n')
}

/**
 * ----------------------------------------------------------------------------------------
 * Builds distributive version
 * ----------------------------------------------------------------------------------------
 */

gulp.task('build', function taskBuild (callback) {
  var options = {
    entry: './src/index.js',
    plugins: [
      buble()
    ]
  };

  rollup.rollup(options)
    .then(function onRollupBuildDone (bundle) {
      var result = bundle.generate({
        banner: getBanner(),
        format: 'umd',
        moduleName: 'Deferred'
      });

      fs.writeFileSync('./dist/deferred.js', result.code);

      callback(null);
    })
    .catch(callback);
});

/**
 * ----------------------------------------------------------------------------------------
 * Creates minified version
 * ----------------------------------------------------------------------------------------
 */

gulp.task('minify', function () {
  return gulp.src('./dist/deferred.js')
    .pipe(uglify({
      mangle: false,
      preserveComments: 'license'
    }))
    .pipe(rename('deferred.min.js'))
    .pipe(gulp.dest('dist/'));
});

/**
 * ----------------------------------------------------------------------------------------
 * Prints report about file size
 * ----------------------------------------------------------------------------------------
 */

gulp.task('report', function () {
  return gulp.src('dist/*')
    .pipe(sizereport({
      gzip: true,
      total: false
    }));
});

/**
 * ----------------------------------------------------------------------------------------
 * Default task
 * ----------------------------------------------------------------------------------------
 */

gulp.task('default', ['build']);
