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
 * @TBD
 * @TODO: test this ==== arg
 * @param arg {Function|Deferred} Listener or another deferred
 * @param ctx {Object}
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
 * @param arg {Function|Deferred} Listener or another deferred
 * @param [ctx] {Object} Listener context
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
 * @param arg {Function|Deferred} Listener or another deferred
 * @param [ctx] {Object} Listener context
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
 * @TBD
 * @param onResolve {Function}
 * @param onReject {Function}
 * @param [argCtx] {Object} Context for listeners
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
 * @param onReject {Function}
 * @param [ctx] {Object}
 * @returns {Promise}
 */

Promise.prototype['catch'] = function _catch (onReject, ctx) {
  return this.then(null, onReject, ctx);
};

/**
 * TBD
 * @public
 */

Promise.prototype.valueOf = function valueOf () {
  return this;
};

function pushCallback (promise, key, obj) {
  if (!promise.hasOwnProperty(key)) {
    promise[key] = [];
  }
  promise[key].push(obj);
}
