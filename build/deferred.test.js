
/**
 *
 */

var Promise = function () {
  this._state = states.PENDING;
  this._value = [];
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
  this['then'].apply(this, arguments);
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
    this._callbacks['done'].push({
      fn: cb,
      ctx: ctx
    });
  } else if (state === states.RESOLVED) {
    cb.apply(ctx, this._value);
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
    this._callbacks['fail'].push({
      fn: cb,
      ctx: ctx
    });
  } else if (state === states.REJECTED) {
    cb.apply(ctx, this._value);
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

  if (lastArg && typeof lastArg !== 'function') {
    ctx = lastArg;
  }

  if (typeof onResolve === 'function') {
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
    deferred2.resolve.apply(deferred2, this._value);
  }

  if (typeof onReject === 'function') {
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
    deferred2.reject.apply(deferred2, this._value);
  }

  return deferred2.promise;
};


/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this['promise'] = new Promise();
};

var fn = Deferred.prototype;

/**
 * Translates promise into rejected state
 * @public
 */

fn['reject'] = function () {
  var promise = this['promise'];

  if (promise._state === states.PENDING) {
    promise._state = states.REJECTED;
    promise._value = arguments;

    var callbacks = promise._callbacks['fail'];
    var callback;
    for (var i = 0, l = callbacks.length; i < l; i++) {
      callback = callbacks[i];
      callback.fn.apply(callback.ctx, promise._value);
    }
  }

  return this;
};

/**
 * Translates promise into resolved state
 * @public
 */

fn['resolve'] = function (x) {
  var promise = this['promise'];
  var PENDING = states.PENDING;
  var RESOLVED = states.RESOLVED;
  var self = this;
  var value, callback, callbacks, i, l;

  // ignore non-pending promises
  if (promise._state !== states.PENDING) {
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
  if (x !== null && (xType === 'object' || xType === 'function')) {
    try {
      var then = x.then;
    } catch (e) {
      this.reject(e);
      return this;
    }
  }

  var thenable = typeof then === 'function';
  var isPending = isPromiseOrDeferred && x.isPending();

  // detect if we need onResolve and onReject
  if (thenable && (!isPromiseOrDeferred || isPending)) {
    var onResolve = function () {
      if (promise._state !== PENDING) {
        return false;
      }

      if (isPromiseOrDeferred) {
        value = isDeferred ? x.promise._value : x._value;
      }

      promise._state = RESOLVED;
      promise._value = value || Array.prototype.slice.call(arguments);

      var callback;
      var callbacks = promise._callbacks['done'];
      for (i = 0, l = callbacks.length; i < l; i++) {
        callback = callbacks[i];
        callback.fn.apply(callback.ctx, promise._value);
      }

      return true;
    };

    var onReject = function () {
      if (promise._state !== PENDING) {
        return false;
      }

      if (isPromiseOrDeferred) {
        value = isDeferred ? x.promise._value : x._value;
      }

      self.reject.apply(self, value || arguments);

      return true;
    };
  }

  if (isPromiseOrDeferred) {
    value = isDeferred ? x.promise._value : x._value;

    // 2.3.2.3. If x is rejected, reject promise with the same reason.
    if (x.isRejected()) {
      this.reject.apply(this, value);
      return this;
    }

    // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
    if (x.isResolved()) {
      promise._state = RESOLVED;
      promise._value = value;

      callbacks = promise._callbacks['done'];
      for (var i = 0, l = callbacks.length; i < l; i++) {
        callback = callbacks[i];
        callback.fn.apply(callback.ctx, promise._value);
      }

      return this;
    }

    // 2.3.2.2. when x is fulfilled, fulfill promise with the same value.
    // 2.3.2.3. When x is rejected, reject promise with the same reason.
    try {
      x.then(onResolve, onReject);
    } catch (e) {
      if (this.isPending()) {
        this.reject(e);
      }
    }

    return this;
  }

  // 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
  // 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
  if (thenable) {
    try {
      x.then(onResolve, onReject);
    } catch (e) {
      if (this.isPending()) {
        this.reject(e);
      }
    }
    return this;
  }

  promise._state = RESOLVED;
  promise._value = arguments;

  callbacks = promise._callbacks['done'];
  for (i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.apply(callback.ctx, promise._value);
  }

  return this;
};

/**
 *
 * @public
 */

fn['done'] = function () {
  var promise = this.promise;
  promise.done.apply(promise, arguments);
  return this;
};

/**
 *
 * @public
 */

fn['fail'] = function () {
  var promise = this.promise;
  promise.fail.apply(promise, arguments);
  return this;
};

/**
 *
 * @public
 */

fn['isPending'] = function () {
  return this.promise._state === states.PENDING;
};

/**
 *
 * @public
 */

fn['isRejected'] = function () {
  return this.promise._state === states.REJECTED;
};

/**
 *
 * @public
 */

fn['isResolved'] = function () {
  return this.promise._state === states.RESOLVED;
};

/**
 *
 * @public
 */

fn['then'] = function () {
  var promise = this.promise;
  return promise.then.apply(promise, arguments);
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

Deferred.when = function () {

};
