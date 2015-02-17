'use strict';

/**
 * TBD
 * @param value {*}
 * @returns {Promise}
 */

Deferred.resolve = function (value) {
  var dfd = new Deferred();
  dfd.resolve(value);
  return dfd.promise;
};
