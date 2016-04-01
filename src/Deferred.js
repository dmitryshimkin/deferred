'use strict';

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

Deferred.prototype.reject = function reject (reason) {
  // ignore non-pending promises
  if (this.promise._state !== 0) {
    return this;
  }

  this.promise._state = 3;
  this.promise.value = reason;

  runCallbacks(this.promise[0] /** fail callbacks */, reason);
  cleanUp(this.promise);

  return this;
};

/**
 * Translates the promise into resolved state.
 * @param {*} x
 * @returns {Deferred}
 * @public
 */

Deferred.prototype.resolve = function resolve (x) {
  var dfd = this;
  var promise = this.promise;

  // ignore non-pending promises
  if (promise._state !== 0) {
    return this;
  }

  // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (x === this || x === promise) {
    var e = new TypeError('Promise and argument refer to the same object');
    this.reject(e);
    return this;
  }

  // Resolve with promise
  if (x instanceof Promise) {
    // lock promise
    promise._state = 1;

    // 2.3.2.2. if/when x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. if/When x is rejected, reject promise with the same reason.
    x
      .done(function onValueResolve (xValue) {
        // unlock promise before resolving
        promise._state = 0;
        dfd.resolve(xValue);
      })
      .fail(function onValueReject (xReason) {
        // unlock promise before resolving
        promise._state = 0;
        dfd.reject(xReason);
      });

    return this;
  }

  // Resolve with value
  promise._state = 2;
  promise.value = x;

  runCallbacks(promise[1], promise.value);
  cleanUp(promise);

  return this;
};

function cleanUp (promise) {
  promise[0] = null;
  promise[1] = null;
}

function runCallbacks (callbacks, value) {
  var callback;
  if (callbacks) {
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.call(callback.ctx, value);
    }
  }
}

/**
 * Returns `true` if the given argument is an instance of Deferred, `false` if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */

Deferred.isPromise = function isPromise (arg) {
  return arg instanceof Promise;
};

/**
 * Returns true if the given argument is an instance of Promise, produced by Deferred,
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */

Deferred.isDeferred = function isDeferred (arg) {
  return arg instanceof Deferred;
};

/**
 * Returns true if the given argument is a thenable object (has `then` method),
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */

Deferred.isThenable = function isThenable (arg) {
  return arg !== null && typeof arg === 'object' && typeof arg.then === 'function';
};
