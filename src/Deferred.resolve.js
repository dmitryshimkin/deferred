'use strict';

/**
 * TBD
 * @param [arg] {*}
 * @returns {Promise}
 */

Deferred.resolve = function (arg) {
  if (Deferred.isPromise(arg)) {
    return arg;
  }

  if (Deferred.isDeferred(arg)) {
    return arg.promise;
  }

  var dfd = new Deferred();

  if (Deferred.isThenable(arg)) {
    arg.then(function (value) {
      dfd.resolve(value);
    }, function (reason) {
      dfd.reject(reason);
    });
  } else {
    dfd.resolve(arg);
  }

  return dfd.promise;
};
