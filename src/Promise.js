
/**
 *
 */

var Promise = function () {
  this.value = [];
  this._state = states.PENDING;
  this._callbacks = {
    done: [],
    fail: []
  };
};

var states = {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2
};

var proto = Promise.prototype;

/**
 * Adds onChangeState listener
 * @param cb {Function} Listener
 * @param [ctx] {Object} Listener context
 * @returns {Object} Instance
 * @public
 */

proto['always'] = function () {
  this.then.apply(this, arguments);
  return this;
};

/**
 * Adds onResolve listener
 * @param cb {Function} Listener
 * @param [ctx] {Object} Listener context
 * @returns {Object} Instance
 * @public
 */

proto['done'] = function (cb, ctx) {
  var state = this._state;

  if (state === states.PENDING) {
    this._callbacks.done.push({
      fn: cb,
      ctx: ctx
    });
  } else if (state === states.RESOLVED) {
    cb.apply(ctx, this.value);
  }

  return this;
};

/**
 * Adds onReject listener
 * @param cb {Function} Listener
 * @param [ctx] {Object} Listener context
 * @returns {Object} Instance
 * @public
 */

proto['fail'] = function (cb, ctx) {
  var state = this._state;

  if (state === states.PENDING) {
    this._callbacks.fail.push({
      fn: cb,
      ctx: ctx
    });
  } else if (state === states.REJECTED) {
    cb.apply(ctx, this.value);
  }
  return this;
};

/**
 * Returns true, if promise has pending state
 * @returns {Boolean}
 * @public
 */

proto['isPending'] = function () {
  return this._state === states.PENDING;
};

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */

proto['isRejected'] = function () {
  return this._state === states.REJECTED;
};

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */

proto['isResolved'] = function () {
  return this._state === states.RESOLVED;
};

/**
 * Adds onResolve or onReject listener
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
  } else if (this._state === states.RESOLVED) {
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
  } else if (this._state === states.REJECTED) {
    deferred2.reject.apply(deferred2, this.value);
  }

  return deferred2.promise;
};
