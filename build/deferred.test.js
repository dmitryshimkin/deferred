var noop = function () {};



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
  } else if (state === state.RESOLVED) {
    console.log('add done handler to resolved promise - invoke instantly');
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
    console.log('add done handler to rejected promise - invoke instantly');
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
 *
 */

proto['isRejected'] = function () {
  return this._state === Promise.state.REJECTED;
};

/**
 *
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

/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this['promise'] = new Promise();
  this.reason = void(0);
  this.value = void(0);
};

Deferred.prototype = {

  /**
   *
   */

  fail: function () {
    return this.promise.fail.apply(this['promise'], arguments);
  },

  /**
   *
   */

  done: function () {
    return this.promise.done.apply(this['promise'], arguments);
  },

  /**
   *
   */

  notify: function () {
    return this.promise['notify'].apply(this['promise'], arguments);
  },

  /**
   *
   */

  progress: function () {
    return this.promise['progress'].apply(this['promise'], arguments);
  },

  /**
   *
   */

  promise: function () {
    return this.promise;
  },

  /**
   * Translates promise into rejected state
   * @param [reason] {*} Reason
   * @public
   */

  reject: function (reason) {
    var states = Promise.state;
    var promise = this['promise'];

    if (promise._state === states.PENDING) {
      this.reason = reason;
      promise._state = states.REJECTED;
      notifyFail.call(promise);
    }
    return this;
  },

  /**
   * Translates promise into resolved state
   * @param [value] {*}
   * @public
   */

  resolve: function (value) {
    var states = Promise.state;
    var promise = this['promise'];

    if (promise._state === states.PENDING) {
      this.value = value;
      promise._state = states.RESOLVED;
      notifyDone.call(promise);
    }

    return this;
  }
};
Deferred.when = function () {

};