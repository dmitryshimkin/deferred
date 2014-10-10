;(function (undefined) {
  'use strict';

  /**
   * Promise constructor
   *
   * States
   *  pending:  0
   *  resolved: 1
   *  rejected: 2
   *
   * @class
   */
  
  var Promise = function () {
    this.value = void 0;
    this._state = 0;
  };
  
  /**
   * @TBD
   * @TODO: test this ==== arg
   * @param arg {Function|Deferred} Listener or another deferred
   * @param ctx {Object}
   * @returns {Object} Instance
   * @public
   */
  
  Promise.prototype.always = function (arg, ctx) {
    if (arg instanceof Deferred) {
      this
        .done(function (value) {
          arg.resolve(value);
        })
        .fail(function (reason) {
          arg.reject(reason);
        });
    } else {
      this
        .done(arg, ctx)
        .fail(arg, ctx);
    }
  
    return this;
  };
  
  /**
   * Adds onResolve listener and returns this promise
   * @TODO: test this === arg
   * @param arg {Function|Deferred} Listener or another deferred
   * @param [ctx] {Object} Listener context
   * @returns {Object} Instance
   * @public
   */
  
  Promise.prototype.done = function (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (state === 1) {
      if (isDeferred) {
        arg.resolve(this.value);
      } else {
        arg.call(ctx, this.value);
      }
      return this;
    }
  
    if (state === 0) {
      if (isDeferred) {
        this.done(function (value) {
          arg.resolve.call(arg, value);
        });
      } else {
        if (!this.hasOwnProperty('_doneCallbacks')) {
          this._doneCallbacks = [];
        }
        this._doneCallbacks.push({
          fn: arg,
          ctx: ctx
        });
      }
    }
  
    return this;
  };
  
  /**
   * Adds onReject listener
   * @TODO: test this === arg
   * @param arg {Function|Deferred} Listener or another deferred
   * @param [ctx] {Object} Listener context
   * @returns {Object} Instance
   * @public
   */
  
  Promise.prototype.fail = function (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (state === 2) {
      if (isDeferred) {
        arg.reject(this.value);
      } else {
        arg.call(ctx, this.value);
      }
      return this;
    }
  
    if (state === 0) {
      if (isDeferred) {
        this.fail(function (reason) {
          arg.reject(reason);
        });
      } else {
        if (!this.hasOwnProperty('_failCallbacks')) {
          this._failCallbacks = [];
        }
        this._failCallbacks.push({
          fn: arg,
          ctx: ctx
        });
      }
    }
  
    return this;
  };
  
  /**
   * Returns true, if promise has pending state
   * @returns {Boolean}
   * @public
   */
  
  Promise.prototype.isPending = function () {
    return this._state === 0;
  };
  
  /**
   * Returns true, if promise is rejected
   * @returns {Boolean}
   * @public
   */
  
  Promise.prototype.isRejected = function () {
    return this._state === 2;
  };
  
  /**
   * Returns true, if promise is resolved
   * @returns {Boolean}
   * @public
   */
  
  Promise.prototype.isResolved = function () {
    return this._state === 1;
  };
  
  /**
   * @TBD
   * @param onResolve {Function}
   * @param onReject {Function}
   * @param [argCtx] {Object} Context for listeners
   * @public
   */
  
  Promise.prototype.then = function (onResolve, onReject, argCtx) {
    var lastArg = arguments[arguments.length - 1];
    var deferred2 = new Deferred();
    var func = 'function';
    var ctx;
  
    if (typeof lastArg !== func) {
      ctx = lastArg;
    } else {
      ctx = argCtx;
    }
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (typeof onResolve === func) {
      this.done(function (value) {
        var x;
        var error;
  
        try {
          x = onResolve.call(ctx, value);
        } catch (e) {
          error = e;
        }
  
        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
        //          promise2 must be rejected with e as the reason.
        if (error !== undefined) {
          deferred2.reject(error);
        } else {
          // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
          //          Promise Resolution Procedure [[Resolve]](promise2, x).
          deferred2.resolve(x);
        }
      });
    } else if (this._state === 1) {
      deferred2.resolve(this.value);
    }
  
    if (typeof onReject === func) {
      this.fail(function (reason) {
        var x;
        var error;
  
        try {
          x = onReject.call(ctx, reason);
        } catch (e) {
          error = e;
        }
  
        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
        //          promise2 must be rejected with e as the reason.
        if (error !== undefined) {
          deferred2.reject(error);
        } else {
          // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
          //          Promise Resolution Procedure [[Resolve]](promise2, x).
          deferred2.resolve(x);
        }
      });
    } else if (this._state === 2) {
      deferred2.reject(this.value);
    }
  
    return deferred2.promise;
  };
  
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
      var onResolve = function (argValue) {
        if (promise._state !== 0) {
          return false;
        }
  
        // set value and state
        promise._state = 1;
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
  
        return true;
      };
  
      var onReject = function (reason) {
        // ignore settled promises
        if (promise._state !== 0) {
          return false;
        }
  
        // set reason and state
        promise._state = 2;
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
  
        return true;
      };
  
      try {
        x
          .done(onResolve)
          .fail(onReject);
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
  
  /* istanbul ignore next */
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = Deferred;
  } else if (typeof define === 'function' && define.amd) {
    define('Deferred', [], function () {
      return Deferred;
    });
  } else if (typeof window === 'object') {
    window.Deferred = Deferred;
  }
  
}());
