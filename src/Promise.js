
/**
 *
 */

var Promise = function () {
  this._state = Promise.state.PENDING;
  this._callbacks = {
    done: [],
    fail: []
  };
};

var proto = Promise.prototype;

/**
 *
 */

proto['always'] = function () {
  this['then'].apply(this, arguments);
  return this;
};

/**
 *
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
    cb.call(ctx);
  }

  return this;
};

/**
 *
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
    cb.call(ctx);
  }
  return this;
};

/**
 *
 */

proto['isPending'] = function () {
  return this._state === Promise.state.PENDING;
};

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
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
 */

proto['then'] = function () {
  this['done'].apply(this, arguments);
  this['fail'].apply(this, arguments);
  return this;
};

/**
 *
 */

var notifyFail = function () {
  notify(this._callbacks['fail']);
};

/**
 *
 */

var notifyDone = function () {
  notify(this._callbacks['done']);
};

/**
 *
 */

var notify = function (callbacks) {
  var callback;
  for (var i = 0, l = callbacks.length; i < l; i++) {
    callback = callbacks[i];
    callback.fn.call(callback.ctx);
  }
};

Promise.state = {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2
};