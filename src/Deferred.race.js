import Deferred from './Deferred'
import { indexOf } from './utils'

/**
 * Returns a promise that resolves or rejects as soon as one of the promises
 * in the given array resolves or rejects, with the value or reason from that promise.
 * @param   {Array} promises
 * @returns {Promise}
 * @public
 */
function race (promises) {
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
    promises[i].done(function onPromiseDone (value) {
      dfd.resolve(value);
    });

    // When argument is rejected add its reason to array of reasons
    // and decrease number of remaining pending arguments
    promises[i].fail(function onPromiseFail (reason) {
      var index = indexOf(promises, this);
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
}

export default race
