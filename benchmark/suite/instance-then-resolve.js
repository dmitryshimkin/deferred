'use strict';

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var bluebird_defer = require('bluebird').defer;
var Deferred = require('../../dist/deferred');
var ES6Promise = require('es6-promise').Promise;
var kew_defer = require('kew').defer;
var jq_Deferred = require('../lib/jquery').Deferred;
var vow_defer = require('vow').defer;
var q_defer = require('q').defer;
var rsvp_defer = require('rsvp').defer;

function BluebirdSuite () {
  var dfd = bluebird_defer();
  dfd.promise.then(function () {});
  dfd.resolve(2);
}

function DeferredSuite () {
  var dfd = new Deferred();
  dfd.promise.then(function () {});
  dfd.resolve(2);
}

function ES6PromiseSuite () {
  var promise = new ES6Promise(function (resolve, reject) {
    resolve(2);
  });
  promise.then(function () {});
}

function jquerySuite () {
  var dfd = jq_Deferred();
  dfd.promise().then(function () {});
}

function kewSuite () {
  var dfd = kew_defer();
  dfd.promise.then(function () {});
  dfd.resolve(2);
}

function qSuite () {
  var dfd = q_defer();
  dfd.promise.then(function () {});
  dfd.resolve(2);
}

function rsvpSuite () {
  var dfd = rsvp_defer();
  dfd.promise.then(function () {});
  dfd.resolve(2);
}

function vowSuite () {
  var dfd = vow_defer();
  dfd.promise().then(function () {});
  dfd.resolve(2);
}

suite = suite
  .add('Deferred', DeferredSuite)
  .add('kew', kewSuite)
  .add('Bluebird', BluebirdSuite)
  .add('ES6 promise', ES6PromiseSuite)
  .add('vow', vowSuite)
  .add('RSVP', rsvpSuite)
  .add('Q', qSuite)
  .add('jQuery', jquerySuite);

module.exports = {
  name: 'Create new instance, call .then(), and call .resolve()',
  suite: suite
};
