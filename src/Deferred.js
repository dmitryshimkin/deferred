var slice = Array.prototype.slice;

var states = {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2
};

/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this._state = states.PENDING;
  this.value = [];
  this._callbacks = {
    done: [],
    fail: []
  };
};

var fn = Deferred.prototype;

/**
 * Adds onChangeState listener
 * @param cb {Function} Listener
 * @param [ctx] {Object} Listener context
 * @returns {Object} Instance
 * @public
 */

fn['always'] = function () {
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

fn['done'] = function (cb, ctx) {
  var state = this._state;

  if (state === states.PENDING) {
    this._callbacks['done'].push({
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

fn['fail'] = function (cb, ctx) {
  var state = this._state;

  if (state === states.PENDING) {
    this._callbacks['fail'].push({
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

fn['isPending'] = function () {
  return this._state === states.PENDING;
};

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */

fn['isRejected'] = function () {
  return this._state === states.REJECTED;
};

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */

fn['isResolved'] = function () {
  return this._state === states.RESOLVED;
};

/**
 * Adds onResolve or onReject listener
 * @param onResolve {Function}
 * @param onReject {Function}
 * @param [ctx] {Object} Context for listeners
 * @public
 */

fn['then'] = function (onResolve, onReject, ctx) {
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
    deferred2.resolve.apply(deferred2, this.value);
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
    deferred2.reject.apply(deferred2, this.value);
  }

  return deferred2;
};

/**
 * Translates promise into rejected state
 * @public
 */

fn['reject'] = function () {
  if (this._state === states.PENDING) {
    this._state = states.REJECTED;
    this.value = arguments;
    notifyFail.call(this);
  }

  return this;
};

/**
 * Translates promise into resolved state
 * @public
 */

fn['resolve'] = function (x) {
  var PENDING = states.PENDING;
  var RESOLVED = states.RESOLVED;
  var self = this;
  var value;

  // ignore non-pending promises
  if (this._state !== states.PENDING) {
    return this;
  }

  // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (x === this) {
    var e = new TypeError('Promise and argument refer to the same object');
    this.reject(e);
    return this;
  }

  var isDeferred = x instanceof Deferred;

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
  var isPending = isDeferred && x.isPending();

  // detect if we need onResolve and onReject
  if (thenable && (!isDeferred || isPending)) {
    var onResolve = function () {
      if (self._state !== PENDING) {
        return false;
      }

      if (isDeferred) {
        value = x.value;
      }

      self._state = RESOLVED;
      self.value = value || slice.call(arguments);

      notifyDone.call(self);

      return true;
    };

    var onReject = function () {
      if (self._state !== PENDING) {
        return false;
      }

      self.reject.apply(self, x.value || arguments);

      return true;
    };
  }

  if (isDeferred) {
    value = x.value;

    // 2.3.2.3. If x is rejected, reject promise with the same reason.
    if (x.isRejected()) {
      this.reject.apply(this, value);
      return this;
    }

    // 2.3.2.2. If x is fulfilled, fulfill promise with the same value.
    if (x.isResolved()) {
      this._state = RESOLVED;
      this.value = value;

      notifyDone.call(this);

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

  this._state = RESOLVED;
  this.value = arguments;

  notifyDone.call(this);

  return this;
};

/**
 * Checks whether argument is deferred instance
 * @param arg
 * @returns {boolean}
 */

Deferred.isDeferred = function (arg) {
  return arg instanceof Deferred;
};

// Private methods

var notifyFail = function () {
  notify(this._callbacks['fail'], this.value);
};

var notifyDone = function () {
  notify(this._callbacks['done'], this.value);
};

var notify = function (callbacks, args) {
  var callback;
  for (var i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.apply(callback.ctx, args);
  }
};
