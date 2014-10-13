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
  var promise = this.promise;

  // ignore non-pending promises
  if (promise._state !== 0) {
    return this;
  }

  promise._state = 3;
  promise.value = reason;

  var callbacks = promise._failCallbacks;
  var callback;

  if (callbacks) {
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.call(callback.ctx, promise.value);
    }
  }

  promise._doneCallbacks = null;
  promise._failCallbacks = null;

  return this;
};

/**
 * Translates promise into resolved state
 * @public
 */

Deferred.prototype.resolve = function (x) {
  var promise = this.promise;
  var callback;
  var callbacks;
  var i;
  var l;

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
    var xState = x._state;

    // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. If x is rejected, reject promise with the same reason.
    if (xState > 1) {
      promise._state = xState;
      promise.value = x.value;

      if (xState === 2) {
        callbacks = promise._doneCallbacks;
      } else {
        callbacks = promise._failCallbacks;
      }

      for (i = 0, l = callbacks.length; i < l; i++) {
        callback = callbacks[i];
        callback.fn.call(callback.ctx, promise.value);
      }

      promise._doneCallbacks = null;
      promise._failCallbacks = null;

      return this;
    }

    // 2.3.2.2. when x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. When x is rejected, reject promise with the same reason.
    var onResolve = function (argValue) {
      // set value and state
      promise._state = 2;
      promise.value = argValue;

      // notify subscribers
      var callbacks = promise._doneCallbacks;
      if (callbacks) {
        var callback;
        for (i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.call(callback.ctx, promise.value);
        }
      }

      promise._doneCallbacks = null;
      promise._failCallbacks = null;

      return true;
    };

    var onReject = function (reason) {
      // set reason and state
      promise._state = 3;
      promise.value = reason;

      // notify subscribers
      var callbacks = promise._failCallbacks;

      if (callbacks) {
        var callback;
        for (var i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.call(callback.ctx, promise.value);
        }
      }

      promise._doneCallbacks = null;
      promise._failCallbacks = null;

      return true;
    };

    // Set locked state
    promise._state = 1;

    x
      .done(onResolve)
      .fail(onReject);

    onResolve = null;
    onReject = null;

    return this;
  }

  // Resolve with value
  promise._state = 2;
  promise.value = x;

  callbacks = promise._doneCallbacks;

  if (callbacks) {
    for (i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.call(callback.ctx, promise.value);
    }
  }

  promise._doneCallbacks = null;
  promise._failCallbacks = null;

  return this;
};

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
