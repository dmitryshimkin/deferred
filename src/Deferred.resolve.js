'use strict';

/**
 * TBD
 * @param [value] {*}
 * @returns {Promise}
 */

Deferred.resolve = function (value) {
  if (Deferred.isPromise(value)) {
    return value;
  }

  if (Deferred.isDeferred(value)) {
    return value.promise;
  }

  var dfd = new Deferred();

  if (Deferred.isThenable(value)) {
    value.then(function (val) {
      dfd.resolve(val);
    }, function (reason) {
      dfd.reject(reason);
    });
  } else {
    dfd.resolve(value);
  }

  return dfd.promise;
};
