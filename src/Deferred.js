
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
  return typeof arg === 'object' && typeof arg['then'] === 'function';
};

Deferred.isDeferred = function (arg) {
  return this.isPromise(arg) && typeof arg['resolve'] === 'function' && typeof arg['reject'] === 'function';
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

Deferred.prototype['resolve'] = function () {
  var states = Promise.state;
  var promise = this['promise'];

  if (promise._state === states.PENDING) {
    promise._state = states.RESOLVED;
    promise._value = arguments;
    notifyDone.call(promise);
  }

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