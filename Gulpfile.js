'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var header = require('gulp-header');
var indent = require('gulp-indent');
var rename = require('gulp-rename');
var sizereport = require('gulp-sizereport');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap');

var umd = [
  ';(function(root, factory) {',
  '  /* istanbul ignore next */',
  '  if (typeof define === \'function\' && define.amd) {',
  '    define([], factory);',
  '  } else if (typeof exports === \'object\') {',
  '    module.exports = factory();',
  '  } else {',
  '    root.Deferred = factory();',
  '  }',
  '}(this, function() {',
  '<%= contents %>',
  '  return Deferred;',
  '}));'
].join('\n');

var pkg = require('./package.json');

function getBanner () {
  return [
    '/**',
    ' * Deferred',
    ' * Version: <%= version %>',
    ' * Author: <%= author %>',
    ' * License: MIT',
    ' * https://github.com/dmitryshimkin/deferred',
    ' */',
    ''
  ].join('\n')
}

var JS_FILES = [
  'src/Promise.js',
  'src/Deferred.js',
  'src/Deferred.all.js',
  'src/Deferred.race.js',
  'src/Deferred.reject.js',
  'src/Deferred.resolve.js'
];

/**
 * Builds distributive version
 * -------------------------------------------
 */

gulp.task('build', function () {
  return gulp.src(JS_FILES)
    .pipe(concat('deferred.js'))
    .pipe(indent())
    .pipe(wrap(umd))
    .pipe(header(getBanner(), pkg))
    .pipe(gulp.dest('dist/'));
});

/**
 * Creates minified version
 * -------------------------------------------
 */

gulp.task('minify', function () {
  return gulp.src('./dist/deferred.js')
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(rename('deferred.min.js'))
    .pipe(gulp.dest('dist/'));
});

/**
 * Prints report about file size
 * -------------------------------------------
 */

gulp.task('report', function () {
  return gulp.src('dist/*')
    .pipe(sizereport({
      gzip: true,
      total: false
    }));
});

/**
 * Default task
 * -------------------------------------------
 */

gulp.task('default', ['build']);
