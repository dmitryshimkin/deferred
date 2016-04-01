/**
 * Deferred
 * Version: 1.0.1
 * Author: Dmitry Shimkin <dmitryshimkin@gmail.com>
 * License: MIT
 * https://github.com/dmitryshimkin/deferred
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Deferred = factory();
  }
}(this, function() {
  'use strict';

  /**
   * Promise constructor
   *
   * States
   *  pending:  0
   *  locked:   1
   *  resolved: 2
   *  rejected: 3
   *
   * @class
   */

  function Promise () {
    this.value = void 0;
    this._state = 0;
  }

  /**
   * Adds the given handler to be called when the promise is either resolved or rejected.
   * @TODO: test this ==== arg
   * @param {Function|Deferred} arg  Listener or another deferred
   * @param {Object}            ctx
   * @returns {Object} Instance
   * @public
   */

  Promise.prototype.always = function always (arg, ctx) {
    if (arg instanceof Deferred) {
      this
        .done(function onArgDone (value) {
          arg.resolve(value);
        })
        .fail(function onArgReject (reason) {
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
   * @param {Function|Deferred} arg    Listener or another deferred
   * @param {Object}            [ctx]  Listener context
   * @returns {Object} Instance
   * @public
   */

  Promise.prototype.done = function done (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;

    if (ctx === void 0) {
      ctx = this;
    }

    if (state === 2) {
      if (isDeferred) {
        arg.resolve(this.value);
      } else {
        arg.call(ctx, this.value);
      }
      return this;
    }

    if (state === 0) {
      if (isDeferred) {
        this.done(function onArgDone (value) {
          arg.resolve.call(arg, value);
        });
      } else {
        pushCallback(this, 1, {
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
   * @param  {Function|Deferred} arg   Listener or another deferred
   * @param  {Object}            [ctx] Listener context
   * @returns {Object} Instance
   * @public
   */

  Promise.prototype.fail = function fail (arg, ctx) {
    var state = this._state;
    var isDeferred = arg instanceof Deferred;

    if (ctx === void 0) {
      ctx = this;
    }

    if (state === 3) {
      if (isDeferred) {
        arg.reject(this.value);
      } else {
        arg.call(ctx, this.value);
      }
      return this;
    }

    if (state === 0) {
      if (isDeferred) {
        this.fail(function onArgFail (reason) {
          arg.reject(reason);
        });
      } else {
        pushCallback(this, 0, {
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

  Promise.prototype.isPending = function isPending () {
    return this._state <= 1;
  };

  /**
   * Returns true, if promise is rejected
   * @returns {Boolean}
   * @public
   */

  Promise.prototype.isRejected = function isRejected () {
    return this._state === 3;
  };

  /**
   * Returns true, if promise is resolved
   * @returns {Boolean}
   * @public
   */

  Promise.prototype.isResolved = function isResolved () {
    return this._state === 2;
  };

  /**
   * Appends fulfillment and rejection handlers to the promise,
   * and returns a new promise resolving to the return value of the called handler,
   * or to its original settled value if the promise was not handled
   * (i.e. if the relevant handler onFulfilled or onRejected is undefined).
   * @param {Function} onResolve
   * @param {Function} onReject
   * @param {Object} [argCtx]
   * @public
   */

  Promise.prototype.then = function then (onResolve, onReject, argCtx) {
    var lastArg = arguments[arguments.length - 1];
    var isResolved = this._state === 2;
    var isRejected = this._state === 3;
    var deferred2 = new Deferred();
    var func = 'function';
    var ctx;

    if (typeof lastArg !== func) {
      ctx = lastArg;
    } else {
      ctx = argCtx;
    }

    if (ctx === void 0) {
      ctx = this;
    }

    if (typeof onResolve === func) {
      this.done(function onDone (value) {
        var x;
        var error;

        try {
          x = onResolve.call(ctx, value);
        } catch (err) {
          error = err;
        }

        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
        //          promise2 must be rejected with e as the reason.
        if (error !== void 0) {
          deferred2.reject(error);
        } else {
          // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
          //          Promise Resolution Procedure [[Resolve]](promise2, x).
          deferred2.resolve(x);
        }
      });
    } else if (isResolved) {
      deferred2.resolve(this.value);
      return deferred2.promise;
    }

    // Если передан onReject, создаем вреппер rejected
    if (typeof onReject === func) {
      this.fail(function onFail (reason) {
        var x;
        var error;

        try {
          x = onReject.call(ctx, reason);
        } catch (err) {
          error = err;
        }

        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
        //          promise2 must be rejected with e as the reason.
        if (error !== void 0) {
          deferred2.reject(error);
        } else {
          // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
          //          Promise Resolution Procedure [[Resolve]](promise2, x).
          deferred2.resolve(x);
        }
      });
    } else if (isRejected) {
      deferred2.reject(this.value);
    }

    return deferred2.promise;
  };

  /**
   * Alias for Promise#then(null, fn)
   * @param {Function} onReject
   * @param {Object}   [ctx]
   * @returns {Promise}
   */

  Promise.prototype['catch'] = function _catch (onReject, ctx) {
    return this.then(null, onReject, ctx);
  };

  function pushCallback (promise, key, obj) {
    if (!promise.hasOwnProperty(key)) {
      promise[key] = [];
    }
    promise[key].push(obj);
  }

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

  'use strict';

  function indexOf (promises, promise) {
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
   * Returns a promise that resolves when all of the promises in the given array have resolved,
   * or rejects with the reason of the first passed promise that rejects.
   * @param   {Array} promises
   * @returns {Promise}
   * @public
   */

  Deferred.all = function all (promises) {
    var dfd = new Deferred();

    if (!promises) {
      return dfd.promise;
    }

    var values = new Array(promises.length);
    var pendingCount = 0;
    var i;
    var l;

    for (i = 0, l = promises.length; i < l; i++) {
      // If rejected argument found reject promise and return it
      if (promises[i].isRejected()) {
        dfd.reject(promises[i].value);
        return dfd.promise;
      }

      // If resolved argument found add its value to array of values
      if (promises[i].isResolved()) {
        values[i] = promises[i].value;
        continue;
      }

      // Increase number of pending arguments
      pendingCount++;

      // Once argument is rejected reject promise with the same reason
      promises[i].fail(function onPromiseFail (reason) {
        dfd.reject(reason);
      });

      // When argument is resolved add its value to array of values
      // and decrease number of remaining pending arguments
      promises[i].done(function onPromiseDone (value) {
        var index = indexOf(promises, this);
        values[index] = value;
        pendingCount--;

        // Resolve promise if no pending arguments left
        if (pendingCount === 0) {
          dfd.resolve(values);
        }
      }, promises[i]);
    }

    if (!pendingCount) {
      dfd.resolve(values);
      return dfd.promise;
    }

    return dfd.promise;
  };

  'use strict';

  /**
   * Returns a promise that resolves or rejects as soon as one of the promises
   * in the given array resolves or rejects, with the value or reason from that promise.
   * @param   {Array} promises
   * @returns {Promise}
   * @public
   */

  Deferred.race = function race (promises) {
    var dfd = new Deferred();

    if (!promises) {
      return dfd.promise;
    }

    var reasons = new Array(promises.length);
    var pendingCount = 0;
    var i;
    var l;

    for (i = 0, l = promises.length; i < l; i++) {
      // If resolved argument found resolve promise and return it
      if (promises[i].isResolved()) {
        dfd.resolve(promises[i].value);
        return dfd.promise;
      }

      // If rejected argument found add its reason to array of reasons
      if (promises[i].isRejected()) {
        reasons[i] = promises[i].value;
        continue;
      }

      // Increase number of pending arguments
      pendingCount++;

      // Once argument is resolved reject promise with the same reason
      promises[i].done(function onPromiseDone (value) {
        dfd.resolve(value);
      });

      // When argument is rejected add its reason to array of reasons
      // and decrease number of remaining pending arguments
      promises[i].fail(function onPromiseFail (reason) {
        var index = indexOf(promises, this);
        reasons[index] = reason;
        pendingCount--;

        // Reject promise if no pending arguments left
        if (pendingCount === 0) {
          dfd.reject(reasons);
        }
      }, promises[i]);
    }

    if (!pendingCount) {
      dfd.reject(reasons);
      return dfd.promise;
    }

    return dfd.promise;
  };

  'use strict';

  /**
   * Returns a Promise object that is rejected with the given reason.
   * @param   {*} reason
   * @returns {Promise}
   * @public
   */

  Deferred.reject = function reject (reason) {
    var dfd = new Deferred();
    dfd.reject(reason);
    return dfd.promise;
  };

  'use strict';

  /**
   * Returns a Promise object that is resolved with the given value.
   * @param   {*} [value]
   * @returns {Promise}
   * @public
   */

  Deferred.resolve = function resolve (value) {
    if (Deferred.isPromise(value)) {
      return value;
    }

    if (Deferred.isDeferred(value)) {
      return value.promise;
    }

    var dfd = new Deferred();

    if (Deferred.isThenable(value)) {
      value.then(function onValueResolve (val) {
        dfd.resolve(val);
      }, function onValueReject (reason) {
        dfd.reject(reason);
      });
    } else {
      dfd.resolve(value);
    }

    return dfd.promise;
  };

return Deferred;
}));
