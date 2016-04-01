'use strict';

/**
 * Returns a Promise object that is rejected with the given reason.
 * @param   {*} reason
 * @returns {Promise}
 * @public
 */

Deferred.reject = function reject (reason) {
  var dfd = new Deferred();
  dfd.reject(reason);
  return dfd.promise;
};
