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

  promise._state = 2;
  promise.value = reason;

  var callbacks = promise._failCallbacks;
  var callback;

  if (callbacks) {
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.call(callback.ctx, promise.value);
    }
  }

  return this;
};

/**
 * Translates promise into resolved state
 * @public
 */

Deferred.prototype.resolve = function (x) {
  var promise = this.promise;
  var value;
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

  var isPromise = x instanceof Promise;
  var onResolve;
  var onReject;

  // Detect if we need onResolve and onReject
  if (isPromise) {
    var xState = x._state;

    // 2.3.2.3. If x is rejected, reject promise with the same reason.
    if (xState === 2) {
      this.reject(x.value);
      return this;
    }

    // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
    if (xState === 1) {
      promise._state = 1;
      promise.value = x.value;

      callbacks = promise._doneCallbacks;
      if (callbacks) {
        for (i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.call(callback.ctx, promise.value);
        }
      }

      return this;
    }

    // 2.3.2.2. when x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. When x is rejected, reject promise with the same reason.
    var deferred = this;

    onResolve = function (argValue) {
      if (promise._state !== 0) {
        return false;
      }

      if (isPromise) {
        value = x.value;
      }

      promise._state = 1;
      promise.value = value || argValue;

      var callback;
      var callbacks = promise._doneCallbacks;

      if (callbacks) {
        for (i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.call(callback.ctx, promise.value);
        }
      }

      return true;
    };

    onReject = function (reason) {
      if (promise._state !== 0) {
        return false;
      }
      if (isPromise) {
        value = x.value;
      }
      deferred.reject(value || reason);
      return true;
    };

    try {
      x.then(onResolve, onReject);
    } catch (e) {
      if (this.promise._state === 0) {
        this.reject(e);
      }
    }

    onResolve = null;
    onReject = null;

    return this;
  }

  promise._state = 1;
  promise.value = x;

  callbacks = promise._doneCallbacks;

  if (callbacks) {
    for (i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.call(callback.ctx, promise.value);
    }
  }

  return this;
};

/**
 * Checks whether
 * @param arg
 * @returns {boolean}
 */

Deferred.isPromise = function (arg) {
  return arg instanceof Promise || arg instanceof Deferred;
};

Deferred.isDeferred = function (arg) {
  return arg instanceof Deferred;
};
