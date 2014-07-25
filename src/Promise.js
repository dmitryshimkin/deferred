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
