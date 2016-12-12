import Deferred from './Deferred'

/**
 * @private
 */
export function indexOf (promises, promise) {
  var i = promises.length;
  while (i--) {
    if (promises[i] === promise) {
      return i;
    }
  }
  /* istanbul ignore next */
  return -1;
}

/**
 * Returns true if the given argument is an instance of Promise, produced by Deferred,
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
export function isDeferred (arg) {
  return arg instanceof Deferred;
}

/**
 * @inner
 */
export function processChild (parentPromise, child) {
  var x;
  var error;

  var value = parentPromise.value;

  var isResolved = parentPromise._state === 2;
  var fn = isResolved ? child.onResolve : child.onReject;
  var hasHandler = typeof fn === 'function';

  if (!hasHandler) {
    if (isResolved) {
      child.deferred.resolve(value);
    } else {
      child.deferred.reject(value);
    }
    return;
  }

  try {
    x = fn.call(child.ctx, value);
  } catch (err) {
    error = err;
  }

  if (error !== void 0) {
    // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
    //          promise2 must be rejected with e as the reason.
    child.deferred.reject(error);
  } else {
    // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
    //          Promise Resolution Procedure [[Resolve]](promise2, x).
    child.deferred.resolve(x);
  }
}
