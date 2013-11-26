
/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this['promise'] = new Promise();
};

/**
 * Translates promise into rejected state
 * @param [reason] {*} Reason
 * @public
 */

Deferred.prototype['reject'] = function (reason) {
  var states = Promise.state;
  var promise = this['promise'];

  if (promise._state === states.PENDING) {
    this.reason = reason;
    promise._state = states.REJECTED;
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

var methods = ['done', 'fail', 'isPending', 'isRejected', 'isResolved'];
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
  notify(this._callbacks['fail']);
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