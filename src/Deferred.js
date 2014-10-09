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

  for (var i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.call(callback.ctx, promise.value);
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

  var func = 'function';
  var self = this;
  var then;

  // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (x === this || x === promise) {
    var e = new TypeError('Promise and argument refer to the same object');
    this.reject(e);
    return this;
  }

  var isDeferred = x instanceof Deferred;
  var isPromise = x instanceof Promise;
  var isPromiseOrDeferred = isDeferred || isPromise;

  var xType = typeof x;

  // 2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason
  if (x !== null && (xType === 'object' || xType === func)) {
    try {
      if (isDeferred) {
        then = x.promise.then;
      } else {
        then = x.then;
      }
    } catch (e) {
      this.reject(e);
      return this;
    }
  }

  var thenable = typeof then === func;
  var isPending;
  var onResolve;
  var onReject;

  if (isPromise) {
    isPending = x._state === 0;
  } else if (isDeferred) {
    isPending = x.promise._state === 0;
  } else {
    isPending = false;
  }

  // detect if we need onResolve and onReject
  // !!! comment this
  if (thenable && (!isPromiseOrDeferred || isPending)) {
    onResolve = function (argValue) {
      if (promise._state !== 0) {
        return false;
      }

      if (isPromiseOrDeferred) {
        value = isDeferred ? x.promise.value : x.value;
      }

      promise._state = 1;
      promise.value = value || argValue;

      var callback;
      var callbacks = promise._doneCallbacks;
      for (i = 0, l = callbacks.length; i < l; i++) {
        callback = callbacks[i];
        callback.fn.call(callback.ctx, promise.value);
      }

      return true;
    };

    onReject = function (reason) {
      if (promise._state !== 0) {
        return false;
      }

      if (isPromiseOrDeferred) {
        value = isDeferred ? x.promise.value : x.value;
      }

      self.reject(value || reason);

      return true;
    };
  }

  if (isPromiseOrDeferred) {
    value = isDeferred ? x.promise.value : x.value;
    var xState = isDeferred ? x.promise._state : x._state;

    // 2.3.2.3. If x is rejected, reject promise with the same reason.
    if (xState === 2) {
      this.reject(value);
      return this;
    }

    // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
    if (xState === 1) {
      promise._state = 1;
      promise.value = value;

      callbacks = promise._doneCallbacks;
      for (i = 0, l = callbacks.length; i < l; i++) {
        callback = callbacks[i];
        callback.fn.call(callback.ctx, promise.value);
      }

      return this;
    }

    // 2.3.2.2. when x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. When x is rejected, reject promise with the same reason.
    try {
      if (isDeferred) {
        x.promise.then(onResolve, onReject);
      } else {
        x.then(onResolve, onReject);
      }
    } catch (e) {
      if (this.promise._state === 0) {
        this.reject(e);
      }
    }

    onResolve = null;
    onReject = null;

    return this;
  }

  // 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
  // 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
  if (thenable) {
    try {
      if (isDeferred) {
        x.promise.then(onResolve, onReject);
      } else {
        x.then(onResolve, onReject);
      }
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
  for (i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.call(callback.ctx, promise.value);
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
