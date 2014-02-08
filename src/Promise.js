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
