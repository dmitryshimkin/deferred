var Deferred = require('../../../build/deferred.min.js');
var Q = require('../lib/q.js');
var vow = require('../lib/vow.js');
var RubaxaDeferred = require('../lib/rubaxa-deferred.js');

module.exports = {
  name: 'Create Promise instance',
  tests: {
    'Deferred': function () {
      return new Deferred();
    },

    'Q': function () {
      return new Q.defer();
    },

    'vow': function () {
      return new vow.Deferred();
    },

    'Rubaxa': function () {
      return new RubaxaDeferred();
    }
  }
};
