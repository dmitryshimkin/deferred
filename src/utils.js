import Deferred from './Deferred'

import {
  PROMISE_RESOLVED,
  PROMISE_STATUS_KEY,
  PROMISE_VALUE_KEY
} from './constant'

/**
 * @param {Promise} promise
 * @returns {String}
 * @inner
 */
export function getPromiseStatus (promise) {
  return promise[PROMISE_STATUS_KEY];
}

/**
 * @param {Promise} promise
 * @returns {String}
 * @inner
 */
export function getPromiseValue (promise) {
  return promise[PROMISE_VALUE_KEY];
}

/**
 * @inner
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

  var parentValue = getPromiseValue(parentPromise);

  var isResolved = parentPromise[PROMISE_STATUS_KEY] === PROMISE_RESOLVED;
  var fn = isResolved ? child.onResolve : child.onReject;
  var hasHandler = typeof fn === 'function';

  if (!hasHandler) {
    if (isResolved) {
      child.deferred.resolve(parentValue);
    } else {
      child.deferred.reject(parentValue);
    }
    return;
  }

  try {
    x = fn.call(child.ctx, parentValue);
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

/**
 * @param {Promise} promise
 * @param {String} status
 * @inner
 */
export function setPromiseStatus (promise, status) {
  promise[PROMISE_STATUS_KEY] = status;
}

/**
 * @param {Promise} promise
 * @param {String} value
 * @inner
 */
export function setPromiseValue (promise, value) {
  promise[PROMISE_VALUE_KEY] = value;
}
