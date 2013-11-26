
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
 * Adds onResolve or onReject listener
 * @param onResolve {Function}
 * @param onReject {Function}
 * @param [ctx] {Object} Context for listeners
 * @public
 */

proto['then'] = function (onResolve, onReject, ctx) {
  var lastArg = arguments[arguments.length - 1];

  if (lastArg && typeof lastArg !== 'function') {
    ctx = lastArg;
  }

  if (typeof onResolve === 'function') {
    this.done(onResolve, ctx);
  }

  if (typeof onReject === 'function') {
    this.fail(onReject, ctx);
  }

  return this;
};