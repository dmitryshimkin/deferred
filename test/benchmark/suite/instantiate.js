var Deferred       = require('../../../build/deferred.min.js');
var Q              = require('../lib/q.js');
var kew            = require('../lib/kew.js');
var vow            = require('../lib/vow.js');
var RubaxaDeferred = require('../lib/rubaxa-deferred.js');
var RSVP           = require('../lib/rsvp.js').RSVP;
//var $              = require('../lib/jquery.js');

module.exports = {
  name: ' *** instantiate *** ',
  tests: {
    'Deferred': function () {
      return new Deferred();
    },

    //    'Promise': function () {
    //      var d = new Promise(function (resolve, reject) {});
    //      return new Promise();
    //    },

    'Q': function () {
      return new Q.defer();
    },

    'kew': function () {
      return new kew.defer();
    },

    'vow': function () {
      return new vow.Deferred();
    },

    'Rubaxa': function () {
      return new RubaxaDeferred();
    },

    'RSVP': function () {
      return new RSVP.Promise(function (resolve, reject) {});
    }
  }
};
