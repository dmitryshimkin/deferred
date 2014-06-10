var Deferred = require('../../../build/deferred.js');
var Q        = require('../lib/q.js');
var vow      = require('../lib/vow.js');
var Rubaxa   = require('../lib/rubaxa-deferred.js');
var RSVP     = require('../lib/rsvp.js').RSVP;

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

    'Q': function () {
      var d = new Q.defer();
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
