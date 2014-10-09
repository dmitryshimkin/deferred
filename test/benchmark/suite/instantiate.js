'use strict';

var Deferred       = require('../../../dist/deferred.min');
var Q              = require('../lib/q');
var kew            = require('../lib/kew');
var vow            = require('../lib/vow');
var Bluebird       = require('../lib/bluebird');
var RubaxaDeferred = require('../lib/rubaxa-deferred');
var RSVP           = require('../lib/rsvp').RSVP;
var $              = require('../lib/jquery');

module.exports = {
  name: ' *** instantiate *** ',
  tests: {
    Deferred: function () {
      return new Deferred();
    },

    //    'Promise': function () {
    //      var d = new Promise(function (resolve, reject) {});
    //      return new Promise();
    //    },

    /*
    $: function () {
      return new $.Deferred();
    },
    */

    Bluebird: function () {
      return new Bluebird(function (resolve, reject) {});
    },

    kew: function () {
      return new kew.defer();
    }

    /*
    Q: function () {
      return new Q.defer();
    },
    */

    /*
    vow: function () {
      return new vow.Deferred();
    },

    Rubaxa: function () {
      return new RubaxaDeferred();
    },

    RSVP: function () {
      return new RSVP.Promise(function (resolve, reject) {});
    }
    */
  }
};
