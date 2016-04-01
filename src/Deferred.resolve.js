'use strict';

/**
 * Returns a Promise object that is resolved with the given value.
 * @param   {*} [value]
 * @returns {Promise}
 * @public
 */

Deferred.resolve = function resolve (value) {
  if (Deferred.isPromise(value)) {
    return value;
  }

  if (Deferred.isDeferred(value)) {
    return value.promise;
  }

  var dfd = new Deferred();

  if (Deferred.isThenable(value)) {
    value.then(function onValueResolve (val) {
      dfd.resolve(val);
    }, function onValueReject (reason) {
      dfd.reject(reason);
    });
  } else {
    dfd.resolve(value);
  }

  return dfd.promise;
};
