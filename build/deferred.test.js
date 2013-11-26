var noop = function () {};



/**
 *
 */

var Promise = function () {
  this._state = Promise.state.PENDING;
  this._value = [];
  this._callbacks = {
    done: [],
    fail: []
  };
};

Promise.state = {
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
  var states = Promise.state;

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
  var states = Promise.state;

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
  return this._state === Promise.state.PENDING;
};

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */

proto['isRejected'] = function () {
  return this._state === Promise.state.REJECTED;
};

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */

proto['isResolved'] = function () {
  return this._state === Promise.state.RESOLVED;
};

/**
 *
 * @public
 */

proto['then'] = function () {
  this['done'].apply(this, arguments);
  this['fail'].apply(this, arguments);
  return this;
};

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
Deferred.when = function () {

};