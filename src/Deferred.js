'use strict';

/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this.promise = new Promise();
};

/**
 * Translates promise into rejected state
 * @public
 */

Deferred.prototype.reject = function (reason) {
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
 * Translates promise into resolved state
 * @public
 */

Deferred.prototype.resolve = function (x) {
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
      .done(function (xValue) {
        // unlock promise before resolving
        promise._state = 0;
        dfd.resolve(xValue);
      })
      .fail(function (xReason) {
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
 * Checks whether
 * @param arg
 * @returns {boolean}
 */

Deferred.isPromise = function (arg) {
  return arg instanceof Promise;
};

Deferred.isDeferred = function (arg) {
  return arg instanceof Deferred;
};
