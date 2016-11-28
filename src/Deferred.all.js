import Deferred from './Deferred'
import { indexOf } from './utils'

/**
 * Returns a promise that resolves when all of the promises in the given array have resolved,
 * or rejects with the reason of the first passed promise that rejects.
 * @param   {Array} promises
 * @returns {Promise}
 * @public
 */
function all (promises) {
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
    promises[i].fail(function onPromiseFail (reason) {
      dfd.reject(reason);
    });

    // When argument is resolved add its value to array of values
    // and decrease number of remaining pending arguments
    promises[i].done(function onPromiseDone (value) {
      var index = indexOf(promises, this);
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
}

export default all
