import Promise from './Promise'

import {
  getPromiseStatus,
  getPromiseValue,
  isDeferred,
  processChild,
  setPromiseStatus,
  setPromiseValue
} from './utils'

import {
  PROMISE_PENDING,
  PROMISE_LOCKED,
  PROMISE_RESOLVED,
  PROMISE_REJECTED,
} from './constant'

/**
 * Deferred class
 * @class
 */
function Deferred () {
  this.promise = new Promise();
}

/**
 * Translates the promise into rejected state.
 * @param {*} reason
 * @returns {Deferred}
 * @public
 */
function reject (reason) {
  // ignore non-pending promises
  if (getPromiseStatus(this.promise) !== PROMISE_PENDING) {
    return this;
  }

  return rejectWithReason(this, reason);
}

/**
 * Translates the promise into resolved state.
 * @param {*} x
 * @returns {Deferred}
 * @public
 */
function resolve (x) {
  var dfd = this;
  var promise = this.promise;

  // ignore non-pending promises
  if (getPromiseStatus(promise) !== PROMISE_PENDING) {
    return dfd;
  }

  // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (x === this || x === promise) {
    return rejectWithSameArgError(dfd);
  }

  // Resolve with promise
  if (x instanceof Promise) {
    return resolveWithPromise(dfd, x);
  }

  return resolveWithValue(dfd, x);
}

/**
 * @private
 */
function rejectWithReason (dfd, reason) {
  var promise = dfd.promise;

  setPromiseStatus(promise, PROMISE_REJECTED);
  setPromiseValue(promise, reason);

  runCallbacks(promise._failCallbacks, reason);
  processChildren(dfd);
  cleanUpPromise(promise);

  return dfd;
}

/**
 * @private
 */
function rejectWithSameArgError (dfd) {
  var err = new TypeError('Promise and argument refer to the same object');
  dfd.reject(err);
  return dfd;
}

/**
 * @private
 */
function resolveWithPromise (dfd, promise) {
  // lock promise
  lockPromise(dfd.promise);

  // 2.3.2.2. if/when x is fulfilled, fulfill promise with the same value.
  // 2.3.2.3. if/When x is rejected, reject promise with the same reason.
  promise
    .done(function onValueResolve (xValue) {
      // unlock promise before resolving
      setPromiseStatus(dfd.promise, PROMISE_PENDING);
      resolveWithValue(dfd, xValue);
    })
    .fail(function onValueReject (xReason) {
      // unlock promise before resolving
      setPromiseStatus(dfd.promise, PROMISE_PENDING);
      rejectWithReason(dfd, xReason);
    });

  return dfd;
}

/**
 * @private
 */
function resolveWithValue (dfd, value) {
  setPromiseStatus(dfd.promise, PROMISE_RESOLVED);
  setPromiseValue(dfd.promise, value);

  runCallbacks(dfd.promise._doneCallbacks, value);
  processChildren(dfd);

  cleanUpPromise(dfd.promise);

  return dfd;
}

/**
 * @private
 */
function processChildren (dfd) {
  var children = dfd.promise._children;
  if (children) {
    for (var i = 0; i < children.length; i++) {
      processChild(dfd.promise, children[i]);
    }
  }
}

/**
 * @private
 */
function runCallbacks (callbacks, value) {
  if (callbacks) {
    for (var i = 0; i < callbacks.length; i++) {
      runCallback(callbacks[i], value);
    }
  }
}

/**
 * @private
 */
function runCallback (callback, value) {
  try {
    callback.fn.call(callback.ctx, value);
  } catch (err) {
    throwAsync(err);
  }
}

/**
 * @private
 */
function throwAsync (err) {
  setTimeout(function onAsyncErrorTimeout () {
    throw err;
  }, 0);
}

/**
 * Returns `true` if the given argument is an instance of Deferred, `false` if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
function isPromise (arg) {
  return arg instanceof Promise;
}

/**
 * Returns true if the given argument is a thenable object (has `then` method),
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
function isThenable (arg) {
  return arg !== null && typeof arg === 'object' && typeof arg.then === 'function';
}

/**
 * @private
 */
function cleanUpPromise (promise) {
  promise._doneCallbacks = null;
  promise._failCallbacks = null;
}

/**
 * @param {Promise} promise
 * @private
 */
function lockPromise (promise) {
  setPromiseStatus(promise, PROMISE_LOCKED);
}

Deferred.isDeferred = isDeferred;
Deferred.isPromise = isPromise;
Deferred.isThenable = isThenable;

Deferred.prototype.reject = reject;
Deferred.prototype.resolve = resolve;

export default Deferred
