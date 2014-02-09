;(function (undefined) {
  'use strict';

  /** promise states */
  
  var PENDING = 0;
  var RESOLVED = 1;
  var REJECTED = 2;
  
  /**
   * Promise
   * @class
   */
  
  var Promise = function () {
    this.value = [];
    this._state = PENDING;
    this._callbacks = {
      done: [],
      fail: []
    };
  };
  
  var proto = Promise.prototype;
  
  /**
   * @TBD
   * @param arg {Function|Deferred} Listener or another deferred (@TODO: test this ==== arg)
   * @returns {Object} Instance
   * @public
   */
  
  proto['always'] = function (arg) {
    if (arg instanceof Deferred) {
      this
        .done(function () {
          arg.resolve.apply(arg, arguments);
        })
        .fail(function () {
          arg.reject.apply(arg, arguments);
        });
    } else {
      this
        .done.apply(this, arguments)
        .fail.apply(this, arguments);
    }
  
    return this;
  };
  
  /**
   * Adds onResolve listener
   * @param arg {Function|Deferred} Listener of another deferred (@TODO: test this === arg)
   * @param [ctx] {Object} Listener context
   * @returns {Object} Instance
   * @public
   */
  
  proto['done'] = function (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (state === RESOLVED) {
      if (isDeferred) {
        arg.resolve.apply(arg, this.value);
      } else {
        arg.apply(ctx, this.value);
      }
      return this;
    }
  
    if (state === PENDING) {
      if (isDeferred) {
        this.done(function () {
          arg.resolve.apply(arg, arguments);
        });
      } else {
        this._callbacks.done.push({
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
  
  proto['fail'] = function (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (state === REJECTED) {
      if (isDeferred) {
        arg.reject.apply(arg, this.value);
      } else {
        arg.apply(ctx, this.value);
      }
      return this;
    }
  
    if (state === PENDING) {
      if (isDeferred) {
        this.fail(function () {
          arg.reject.apply(arg, arguments);
        });
      } else {
        this._callbacks.fail.push({
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
  
  proto['isPending'] = function () {
    return this._state === PENDING;
  };
  
  /**
   * Returns true, if promise is rejected
   * @returns {Boolean}
   * @public
   */
  
  proto['isRejected'] = function () {
    return this._state === REJECTED;
  };
  
  /**
   * Returns true, if promise is resolved
   * @returns {Boolean}
   * @public
   */
  
  proto['isResolved'] = function () {
    return this._state === RESOLVED;
  };
  
  /**
   * @TBD
   * @param onResolve {Function}
   * @param onReject {Function}
   * @param [ctx] {Object} Context for listeners
   * @public
   */
  
  proto['then'] = function (onResolve, onReject, ctx) {
    var lastArg = arguments[arguments.length - 1];
    var deferred2 = new Deferred();
    var func = 'function';
  
    if (lastArg && typeof lastArg !== func) {
      ctx = lastArg;
    }
  
    ctx = ctx !== undefined ? ctx : this;
  
    if (typeof onResolve === func) {
      this.done(function () {
        var x, error;
  
        try {
          x = onResolve.apply(ctx, arguments);
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
    } else if (this._state === RESOLVED) {
      deferred2.resolve.apply(deferred2, this.value);
    }
  
    if (typeof onReject === func) {
      this.fail(function () {
        var x, error;
  
        try {
          x = onReject.apply(ctx, arguments);
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
    } else if (this._state === REJECTED) {
      deferred2.reject.apply(deferred2, this.value);
    }
  
    return deferred2.promise;
  };
  
  var counter = 0;
  var slice = Array.prototype.slice;
  
  /**
   * Deferred class
   * @class
   */
  
  var Deferred = function () {
    this.uid = counter++;
    this['promise'] = new Promise();
    this['promise'].uid = this.uid;
  };
  
  var fn = Deferred.prototype;
  
  /**
   * Translates promise into rejected state
   * @public
   */
  
  fn['reject'] = function () {
    var promise = this.promise;
  
    // ignore non-pending promises
    if (promise._state !== PENDING) {
      return this;
    }
  
    promise._state = REJECTED;
    promise.value = arguments;
  
    var callbacks = promise._callbacks.fail;
    var callback;
  
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.apply(callback.ctx, promise.value);
    }
  
    return this;
  };
  
  /**
   * Translates promise into resolved state
   * @public
   */
  
  fn['resolve'] = function (x) {
    var promise = this.promise;
    var value, callback, callbacks, i, l;
    var func = 'function';
    var self = this;
  
    // ignore non-pending promises
    if (promise._state !== PENDING) {
      return this;
    }
  
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
        var then;
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
  
    if (isPromise) {
      isPending = x._state === PENDING;
    } else if (isDeferred) {
      isPending = x.promise._state === PENDING;
    } else {
      isPending = false;
    }
  
    // detect if we need onResolve and onReject
    if (thenable && (!isPromiseOrDeferred || isPending)) {
      var onResolve = function () {
        if (promise._state !== PENDING) {
          return false;
        }
  
        if (isPromiseOrDeferred) {
          value = isDeferred ? x.promise.value : x.value;
        }
  
        promise._state = RESOLVED;
        promise.value = value || Array.prototype.slice.call(arguments);
  
        var callback;
        var callbacks = promise._callbacks.done;
        for (i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.apply(callback.ctx, promise.value);
        }
  
        return true;
      };
  
      var onReject = function () {
        if (promise._state !== PENDING) {
          return false;
        }
  
        if (isPromiseOrDeferred) {
          value = isDeferred ? x.promise.value : x.value;
        }
  
        self.reject.apply(self, value || arguments);
  
        return true;
      };
    }
  
    if (isPromiseOrDeferred) {
      value = isDeferred ? x.promise.value : x.value;
      var xState = isDeferred ? x.promise._state : x._state;
  
      // 2.3.2.3. If x is rejected, reject promise with the same reason.
      if (xState === REJECTED) {
        this.reject.apply(this, value);
        return this;
      }
  
      // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
      if (xState === RESOLVED) {
        promise._state = RESOLVED;
        promise.value = value;
  
        callbacks = promise._callbacks.done;
        for (i = 0, l = callbacks.length; i < l; i++) {
          callback = callbacks[i];
          callback.fn.apply(callback.ctx, promise.value);
        }
  
        return this;
      }
  
      // 2.3.2.2. when x is fulfilled, fulfill promise with the same value.
      // 2.3.2.3. When x is rejected, reject promise with the same reason.
      try {
        isDeferred
          ? x.promise.then(onResolve, onReject)
          : x.then(onResolve, onReject);
      } catch (e) {
        if (this.promise._state === PENDING) {
          this.reject(e);
        }
      }
  
      return this;
    }
  
    // 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
    // 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
    if (thenable) {
      try {
        isDeferred
          ? x.promise.then(onResolve, onReject)
          : x.then(onResolve, onReject);
      } catch (e) {
        if (this.promise._state === PENDING) {
          this.reject(e);
        }
      }
      return this;
    }
  
    promise._state = RESOLVED;
    promise.value = slice.call(arguments);
  
    callbacks = promise._callbacks.done;
    for (i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.apply(callback.ctx, promise.value);
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
  
  Deferred['when'] = function (promises) {
    var d = new Deferred();
    var promise;
    var remain = promises.length;
    var values = [];
    var uids = [];
  
    var done = function () {
      var index = uids.indexOf(this.uid);
      values[index] = slice.call(arguments);
      remain = remain - 1;
      if (remain === 0) {
        d.resolve.apply(d, values);
      }
    };
  
    var fail = function () {
      var args = slice.call(arguments);
      var index = uids.indexOf(this.uid);
  
      args.push(index);
  
      d.reject.apply(d, args);
    };
  
    for (var i = 0, l = promises.length; i < l; i++) {
      promise = promises[i];
  
      if (promise instanceof Deferred) {
        promise = promise.promise;
      }
  
      uids.push(promise.uid);
  
      if (promise._state === REJECTED) {
        return d.reject.apply(d, promise.value).promise;
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
  
  Deferred['any'] = function (promises) {
    var d = new Deferred();
    var promise;
    var remain = promises.length;
    var values = [], value, index;
    var uids = [];
  
    var done = function () {
      var args = slice.call(arguments);
      var index = uids.indexOf(this.uid);
  
      args.push(index);
  
      d.resolve.apply(d, args);
    };
  
    var fail = function () {
      var index = uids.indexOf(this.uid);
      values[index] = slice.call(arguments);
      remain = remain - 1;
      if (remain === 0) {
        d.reject.apply(d, values);
      }
    };
  
    for (var i = 0, l = promises.length; i < l; i++) {
      promise = promises[i];
  
      if (promise instanceof Deferred) {
        promise = promise.promise;
      }
  
      uids.push(promise.uid);
  
      if (promise._state === RESOLVED) {
        index = uids.indexOf(promise.uid);
        value = promise.value;
        value.push(index);
  
        return d.resolve.apply(d, value).promise;
      }
  
      promise
        .done(done)
        .fail(fail);
    }
  
    return d.promise;
  };
  
  /**
   * Export
   */
  
  var obj = 'object';
  
  if (typeof module === obj && typeof module.exports === obj) {
    module.exports = Deferred;
  } else if (typeof define === 'function' && define.amd) {
    define('Deferred', [], function () {
      return Deferred;
    });
  } else if (typeof window === obj) {
    window['Deferred'] = Deferred;
  }
  
}());
