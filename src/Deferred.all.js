'use strict';

/**
 * Returns promise that will be resolved when all passed promises or deferreds are resolved
 * Promise will be rejected if at least on of passed promises or deferreds is rejected
 * @param promises {Iterable}
 * @returns {Promise}
 */

Deferred.all = function (promises) {
  var dfd = new Deferred();

  if (!promises) {
    return dfd.promise;
  }

  var values = new Array(promises.length);
  var pendingCount = 0;
  var i;
  var l;

  for (i = 0, l = promises.length; i < l; i++) {
    // If rejected argument found reject promise and return it
    if (promises[i].isRejected()) {
      dfd.reject(promises[i].value);
      return dfd.promise;
    }

    // If resolved argument found add its value to array of values
    if (promises[i].isResolved()) {
      values[i] = promises[i].value;
      continue;
    }

    // Increase number of pending arguments
    pendingCount++;

    // Once argument is rejected reject promise with the same reason
    promises[i].fail(function (reason) {
      dfd.reject(reason);
    });

    // When argument is resolved add its value to array of values
    // and decrease number of remaining pending arguments
    promises[i].done(function (value) {
      var index = Deferred.all.indexOf(promises, this);
      values[index] = value;
      pendingCount--;

      // Resolve promise if no pending arguments left
      if (pendingCount === 0) {
        dfd.resolve(values);
      }
    }, promises[i]);
  }

  if (!pendingCount) {
    dfd.resolve(values);
    return dfd.promise;
  }

  return dfd.promise;
};

Deferred.all.indexOf = function (promises, promise) {
  var i = promises.length;
  while (i--) {
    if (promises[i] === promise) {
      return i;
    }
  }
  /* istanbul ignore next */
  return -1;
};
