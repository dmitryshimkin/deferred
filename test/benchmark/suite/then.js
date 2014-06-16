var Deferred = require('../../../build/deferred');
var Q        = require('../lib/q');
var kew      = require('../lib/kew');
var Bluebird = require('../lib/bluebird');
var vow      = require('../lib/vow');
var Rubaxa   = require('../lib/rubaxa-deferred');
var RSVP     = require('../lib/rsvp').RSVP;
var $        = require('../lib/jquery');

var onResolve = function () {};

module.exports = {
  name: ' *** then *** ',
  tests: {
    'Deferred': function () {
      var d = new Deferred();
      d.promise.then(onResolve);
    },

    //    'Promise': function () {
    //      var d = new Promise(function (resolve, reject) {});
    //      d.then(onResolve);
    //    },

    'Bluebird': function () {
      var d = new Bluebird(function (resolve, reject) {});
      d.then(onResolve);
    },

    '$': function () {
      var d = new $.Deferred();
      d.then(onResolve);
    },

    'Q': function () {
      var d = new Q.defer();
      d.promise.then(onResolve);
    },

    'kew': function () {
      var d = new kew.defer();
      d.promise.then(onResolve);
    },

    'vow': function () {
      var d = new vow.Deferred();
      d.promise().then(onResolve);
    },

    'Rubaxa': function () {
      var d = new Rubaxa();
      d.then(onResolve);
    },

    'RSVP': function () {
      var d = new RSVP.Promise(function (resolve, reject) {});
      d.then(onResolve);
    }
  }
};
