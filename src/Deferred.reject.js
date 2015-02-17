'use strict';

/**
 * TBD
 * @param reason {*}
 * @returns {Promise}
 */

Deferred.reject = function (reason) {
  var dfd = new Deferred();
  dfd.reject(reason);
  return dfd.promise;
};
