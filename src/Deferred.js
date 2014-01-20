
/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this['promise'] = new Promise();
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
 * Translates promise into rejected state
 * @public
 */

Deferred.prototype['reject'] = function () {
  var states = Promise.state;
  var promise = this['promise'];

  if (promise._state === states.PENDING) {
    promise._state = states.REJECTED;
    promise._value = arguments;
    notifyFail.call(promise);
  }

  return this;
};

/**
 * Translates promise into resolved state
 * @public
 */

Deferred.prototype['resolve'] = function (x) {
  var states = Promise.state;
  var promise = this['promise'];
  var PENDING = states.PENDING;
  var RESOLVED = states.RESOLVED;
  var self = this;
  var value;

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

      notifyDone.call(promise);

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

      notifyDone.call(promise);

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

  notifyDone.call(promise);

  return this;
};

// proxy some promise methods in deferred object

var methods = ['done', 'fail', 'isPending', 'isRejected', 'isResolved', 'then'];
var method;

var createMethod = function (method) {
  return function () {
    var promise = this.promise;
    var result = promise[method].apply(promise, arguments);
    return typeof result === 'boolean' ? result : this;
  }
};

for (var i = 0, l = methods.length; i < l; i++) {
  method = methods[i];
  Deferred.prototype[method] = createMethod(method);
}

// Private methods

var notifyFail = function () {
  notify(this._callbacks['fail'], this._value);
};

var notifyDone = function () {
  notify(this._callbacks['done'], this._value);
};

var notify = function (callbacks, args) {
  var callback;
  for (var i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.apply(callback.ctx, args);
  }
};
