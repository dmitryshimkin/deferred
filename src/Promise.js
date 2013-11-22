
/**
 *
 */

var Promise = function () {
  this._state = 'PENDING';
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
  this._callbacks['done'].push({
    fn: cb,
    ctx: ctx
  });
  return this;
};

/**
 *
 */

proto['fail'] = function (cb, ctx) {
  this._callbacks['fail'].push({
    fn: cb,
    ctx: ctx
  });
  return this;
};

/**
 *
 */

proto['isRejected'] = function () {
  //
};

/**
 *
 */

proto['isResolved'] = function () {
  //
};

/**
 *
 */

proto['pipe'] = function () {
  //
};

/**
 *
 */

proto['progress'] = function () {
  //
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

var reject = function () {
  notify(this._callbacks['fail']);
};

/**
 *
 */

var resolve = function () {
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