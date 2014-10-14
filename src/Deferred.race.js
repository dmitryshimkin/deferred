'use strict';

/**
 * TBD
 * @param promises {Iterable}
 * @returns {Promise}
 */

Deferred.race = function (promises) {
  var dfd = new Deferred();

  if (!promises) {
    return dfd.promise;
  }

  var reasons = new Array(promises.length);
  var pendingCount = 0;
  var i;
  var l;

  for (i = 0, l = promises.length; i < l; i++) {
    // If resolved argument found resolve promise and return it
    if (promises[i].isResolved()) {
      dfd.resolve(promises[i].value);
      return dfd.promise;
    }

    // If rejected argument found add its reason to array of reasons
    if (promises[i].isRejected()) {
      reasons[i] = promises[i].value;
      continue;
    }

    // Increase number of pending arguments
    pendingCount++;

    // Once argument is resolved reject promise with the same reason
    promises[i].done(function (value) {
      dfd.resolve(value);
    });

    // When argument is rejected add its reason to array of reasons
    // and decrease number of remaining pending arguments
    promises[i].fail(function (reason) {
      var index = Deferred.all.indexOf(promises, this);
      reasons[index] = reason;
      pendingCount--;

      // Reject promise if no pending arguments left
      if (pendingCount === 0) {
        dfd.reject(reasons);
      }
    }, promises[i]);
  }

  if (!pendingCount) {
    dfd.reject(reasons);
    return dfd.promise;
  }

  return dfd.promise;
};
