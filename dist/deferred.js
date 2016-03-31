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
        this.done(function (value) {
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
   * @param arg {Function|Deferred} Listener or another deferred
   * @param [ctx] {Object} Listener context
   * @returns {Object} Instance
   * @public
   */

  Promise.prototype.fail = function (arg, ctx) {
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
        this.fail(function (reason) {
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

  Promise.prototype.isPending = function () {
    return this._state <= 1;
  };

  /**
   * Returns true, if promise is rejected
   * @returns {Boolean}
   * @public
   */

  Promise.prototype.isRejected = function () {
    return this._state === 3;
  };

  /**
   * Returns true, if promise is resolved
   * @returns {Boolean}
   * @public
   */

  Promise.prototype.isResolved = function () {
    return this._state === 2;
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
      this.done(function (value) {
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
      this.fail(function (reason) {
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
   * @param onReject {Function}
   * @param [ctx] {Object}
   * @returns {Promise}
   */

  Promise.prototype['catch'] = function (onReject, ctx) {
    return this.then(null, onReject, ctx);
  };

  /**
   * TBD
   * @public
   */

  Promise.prototype.valueOf = function () {
    return this;
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

  Deferred.isThenable = function (arg) {
    return arg !== null && typeof arg === 'object' && typeof arg.then === 'function';
  };

  'use strict';

  /**
   * Returns promise that will be resolved when all passed promises or deferreds are resolved
   * Promise will be rejected if at least on of passed promises or deferreds is rejected
   * @param promises {Array}
   * @returns {Promise}
   */

  Deferred.all = function (promises) {
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
      promises[i].fail(function (reason) {
        dfd.reject(reason);
      });

      // When argument is resolved add its value to array of values
      // and decrease number of remaining pending arguments
      promises[i].done(function (value) {
        var index = Deferred.all.indexOf(promises, this);
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

  Deferred.all.indexOf = function (promises, promise) {
    var i = promises.length;
    while (i--) {
      if (promises[i] === promise) {
        return i;
      }
    }
    /* istanbul ignore next */
    return -1;
  };

  'use strict';

  /**
   * TBD
   * @param promises {Iterable}
   * @returns {Promise}
   */

  Deferred.race = function (promises) {
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
      promises[i].done(function (value) {
        dfd.resolve(value);
      });

      // When argument is rejected add its reason to array of reasons
      // and decrease number of remaining pending arguments
      promises[i].fail(function (reason) {
        var index = Deferred.all.indexOf(promises, this);
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
   * TBD
   * @param reason {*}
   * @returns {Promise}
   */

  Deferred.reject = function (reason) {
    var dfd = new Deferred();
    dfd.reject(reason);
    return dfd.promise;
  };

  'use strict';

  /**
   * TBD
   * @param [value] {*}
   * @returns {Promise}
   */

  Deferred.resolve = function (value) {
    if (Deferred.isPromise(value)) {
      return value;
    }

    if (Deferred.isDeferred(value)) {
      return value.promise;
    }

    var dfd = new Deferred();

    if (Deferred.isThenable(value)) {
      value.then(function (val) {
        dfd.resolve(val);
      }, function (reason) {
        dfd.reject(reason);
      });
    } else {
      dfd.resolve(value);
    }

    return dfd.promise;
  };

return Deferred;
}));
