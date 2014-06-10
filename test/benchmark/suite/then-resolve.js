var Deferred = require('../../../build/deferred.js');
var Q        = require('../lib/q.js');
var vow      = require('../lib/vow.js');
var Rubaxa   = require('../lib/rubaxa-deferred.js');
var RSVP     = require('../lib/rsvp.js').RSVP;

var onResolve = function () {};

module.exports = {
  name: ' *** then and resolve *** ',
  tests: {
    //    'Deferred': function () {
    //      var d = new Deferred();
    //      d.promise.then(onResolve);
    //      d.resolve();
    //    },

    //    'Promise': function () {
    //      var d = new Promise(function (resolve, reject) {});
    //      d.then(onResolve);
    //    },

    'Q': function () {
      var d = new Q.defer();
      d.promise.then(onResolve);
      d.resolve();
    },

    'vow': function () {
      var d = new vow.Deferred();
      d.promise().then(onResolve);
      d.resolve();
    },

    'Rubaxa': function () {
      var d = new Rubaxa();
      d.then(onResolve);
      d.resolve();
    }

//      'RSVP': function () {
//        var _resolve;
//        var d = new RSVP.Promise(function (resolve, reject) {
//          _resolve = resolve;
//        });
//        d.then(onResolve);
//        _resolve();
//      }
  }
};
