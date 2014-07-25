;(function (undefined) {
  'use strict';

  /** promise states */
  
  //PENDING:  0;
  //RESOLVED: 1;
  //REJECTED: 2;
  
  /**
   * Promise
   * @class
   */
  
  var Promise = function () {
    this.value = void 0;
    this._state = 0;
    this._doneCallbacks = [];
    this._failCallbacks = [];
  };
  
  /**
   * @TBD
   * @param arg {Function|Deferred} Listener or another deferred (@TODO: test this ==== arg)
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
   * Adds onResolve listener
   * @param arg {Function|Deferred} Listener or another deferred (@TODO: test this === arg)
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
        arg.resolve.call(arg, this.value);
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
   * @param arg {Function|Deferred} Listener or another deferred (@TODO: test this === arg)
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
        arg.reject.call(arg, this.value);
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
   * @param [ctx] {Object} Context for listeners
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
          if (x !== undefined) {
            deferred2.resolve(x);
          }
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
          if (x !== undefined) {
            deferred2.resolve(x);
          }
        }
      });
    } else if (this._state === 2) {
      deferred2.reject(this.value);
    }
  
    return deferred2.promise;
  };
  
  var counter = 0;
  
  /**
   * Deferred class
   * @class
   */
  
  var Deferred = function () {
    this.uid = counter++;
    this.promise = new Promise();
    this.promise.uid = this.uid;
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
  
  /**
   * Returns promise that will be resolved when all passed promises or deferreds are resolved
   * Promise will be rejected if at least on of passed promises or deferreds is rejected
   * @param promises {Array}
   * @returns {Promise}
   */
  
  Deferred.all = function (promises) {
    var d = new Deferred();
    var promise;
    var index;
    var value;
    var remain = promises.length;
    var values = [];
    var uids = [];
  
    values.length = promises.length;
  
    var done = function (value) {
      var index = uids.indexOf(this.uid);
      values[index] = value;
      remain = remain - 1;
      if (remain === 0) {
        d.resolve(values);
      }
    };
  
    var fail = function (reason) {
      var index = uids.indexOf(this.uid);
      values[index] = reason;
      d.reject(values);
    };
  
    for (var i = 0, l = promises.length; i < l; i++) {
      promise = promises[i];
  
      if (promise instanceof Deferred) {
        promise = promise.promise;
      }
  
      uids.push(promise.uid);
  
      if (promise._state === 2) {
        index = uids.indexOf(promise.uid);
        values[index] = promise.value;
        return d.reject(values).promise;
      }
  
      promise
        .done(done)
        .fail(fail);
    }
  
    return d.promise;
  };
  
  /**
   * Returns promise that will be resolved once any of passed promises or deferreds is resolved
   * Promise will be rejected if all of passed promises or deferreds are rejected
   * @param promises {Array}
   * @returns {Promise}
   */
  
  Deferred.any = function (promises) {
    var d = new Deferred();
    var promise;
    var remain = promises.length;
    var values = [];
    var value;
    var index;
    var uids = [];
  
    values.length = promises.length;
  
    var done = function (value) {
      var index = uids.indexOf(this.uid);
      values[index] = value;
      d.resolve(values);
    };
  
    var fail = function (reason) {
      var index = uids.indexOf(this.uid);
      values[index] = reason;
      remain = remain - 1;
      if (remain === 0) {
        d.reject(values);
      }
    };
  
    for (var i = 0, l = promises.length; i < l; i++) {
      promise = promises[i];
  
      if (promise instanceof Deferred) {
        promise = promise.promise;
      }
  
      uids.push(promise.uid);
  
      if (promise._state === 1) {
        index = uids.indexOf(promise.uid);
        values[index] = promise.value;
        return d.resolve(values).promise;
      }
  
      promise
        .done(done)
        .fail(fail);
    }
  
    return d.promise;
  };
  
  //
  
  /** export */
  
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
