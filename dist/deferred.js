/**
 * Deferred
 * Version: 1.4.0
 * Author: Dmitry Shimkin <dmitryshimkin@gmail.com>
 * License: MIT
 * https://github.com/dmitryshimkin/deferred
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Deferred = factory());
}(this, (function () { 'use strict';

/**
 * Promise status property key
 * @type {String}
 */
var PROMISE_STATUS_KEY = '[[PromiseStatus]]';

/**
 * Promise value property key
 * @type {String}
 */
var PROMISE_VALUE_KEY = '[[PromiseValue]]';

/**
 * Promise locked status
 * @type {String}
 */
var PROMISE_LOCKED = 'locked';

/**
 * Promise pending status
 * @type {String}
 */
var PROMISE_PENDING = 'pending';

/**
 * Promise rejected status
 * @type {String}
 */
var PROMISE_REJECTED = 'rejected';

/**
 * Promise resolved status
 * @type {String}
 */
var PROMISE_RESOLVED = 'resolved';

/**
 * @param {Promise} promise
 * @returns {String}
 * @inner
 */
function getPromiseStatus (promise) {
  return promise[PROMISE_STATUS_KEY];
}

/**
 * @param {Promise} promise
 * @returns {String}
 * @inner
 */
function getPromiseValue (promise) {
  return promise[PROMISE_VALUE_KEY];
}

/**
 * @inner
 */
function indexOf (promises, promise) {
  var i = promises.length;
  while (i--) {
    if (promises[i] === promise) {
      return i;
    }
  }
  /* istanbul ignore next */
  return -1;
}

/**
 * Returns true if the given argument is an instance of Promise, produced by Deferred,
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
function isDeferred (arg) {
  return arg instanceof Deferred$1;
}

/**
 * @inner
 */
function processChild (parentPromise, child) {
  var x;
  var error;

  var parentValue = getPromiseValue(parentPromise);

  var isResolved = parentPromise[PROMISE_STATUS_KEY] === PROMISE_RESOLVED;
  var fn = isResolved ? child.onResolve : child.onReject;
  var hasHandler = typeof fn === 'function';

  if (!hasHandler) {
    if (isResolved) {
      child.deferred.resolve(parentValue);
    } else {
      child.deferred.reject(parentValue);
    }
    return;
  }

  try {
    x = fn.call(child.ctx, parentValue);
  } catch (err) {
    error = err;
  }

  if (error !== void 0) {
    // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
    //          promise2 must be rejected with e as the reason.
    child.deferred.reject(error);
  } else {
    // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
    //          Promise Resolution Procedure [[Resolve]](promise2, x).
    child.deferred.resolve(x);
  }
}

/**
 * @param {Promise} promise
 * @param {String} status
 * @inner
 */
function setPromiseStatus (promise, status) {
  promise[PROMISE_STATUS_KEY] = status;
}

/**
 * @param {Promise} promise
 * @param {String} value
 * @inner
 */
function setPromiseValue (promise, value) {
  promise[PROMISE_VALUE_KEY] = value;
}

var counter = 0;

/**
 * @name Promise
 * @class
 */
function Promise () {
  setPromiseValue(this, void 0);
  setPromiseStatus(this, PROMISE_PENDING);

  this.cid = "cid" + counter;
  counter++;
}

/**
 * Adds the given handler to be called when the promise is either resolved or rejected.
 * @TODO: test this ==== arg
 * @param {Function|Deferred} arg  Listener or another deferred
 * @param {Object}            ctx
 * @returns {Object} Instance
 * @public
 */
function always (arg, ctx) {
  if (isDeferred(arg)) {
    this
      .done(function onArgDone (value) {
        arg.resolve(value);
      })
      .fail(function onArgReject (reason) {
        arg.reject(reason);
      });
  } else {
    this
      .done(arg, ctx)
      .fail(arg, ctx);
  }

  return this;
}

/**
 * Adds onResolve listener and returns this promise
 * @TODO: test this === arg
 * @param {Function|Deferred} arg    Listener or another deferred
 * @param {Object}            [ctx]  Listener context
 * @returns {Object} Instance
 * @public
 */
function done (arg, ctx) {
  var status = getPromiseStatus(this);
  var isDfd = isDeferred(arg);

  if (status === PROMISE_RESOLVED) {
    if (isDfd) {
      arg.resolve(getPromiseValue(this));
    } else {
      arg.call(ctx, getPromiseValue(this));
    }
    return this;
  }

  if (status === PROMISE_PENDING) {
    if (isDfd) {
      this.done(function onDone (value) {
        arg.resolve.call(arg, value);
      });
    } else {
      addCallback(this, '_doneCallbacks', {
        fn: arg,
        ctx: ctx
      });
    }
  }

  return this;
}

/**
 * Adds onReject listener
 * @TODO: test this === arg
 * @param  {Function|Deferred} arg   Listener or another deferred
 * @param  {Object}            [ctx] Listener context
 * @returns {Object} Instance
 * @public
 */
function fail (arg, ctx) {
  var status = getPromiseStatus(this);
  var isDfd = isDeferred(arg);

  if (status === PROMISE_REJECTED) {
    if (isDfd) {
      arg.reject(getPromiseValue(this));
    } else {
      arg.call(ctx, getPromiseValue(this));
    }
    return this;
  }

  if (status === PROMISE_PENDING) {
    if (isDfd) {
      this.fail(function onFail (reason) {
        arg.reject(reason);
      });
    } else {
      addCallback(this, '_failCallbacks', {
        fn: arg,
        ctx: ctx
      });
    }
  }

  return this;
}

/**
 * Returns true, if promise has pending status
 * @returns {Boolean}
 * @public
 */
function isPending () {
  var status = getPromiseStatus(this);
  return status === PROMISE_PENDING || status === PROMISE_LOCKED;
}

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */
function isRejected () {
  return getPromiseStatus(this) === PROMISE_REJECTED;
}

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */
function isResolved () {
  return getPromiseStatus(this) === PROMISE_RESOLVED;
}

/**
 * Appends fulfillment and rejection handlers to the promise,
 * and returns a new promise resolving to the return value of the called handler,
 * or to its original settled value if the promise was not handled
 * (i.e. if the relevant handler onFulfilled or onRejected is void 0).
 * @param   {Function}  onResolve
 * @param   {Function}  onReject
 * @param   {Object}    [argCtx]
 * @returns {Function}
 * @public
 */
function then (onResolve, onReject, argCtx) {
  var argsCount = arguments.length;
  if (argsCount === 2) {
    if (typeof onReject === 'object') {
      argCtx = onReject;
      onReject = null;
    } else {
      argCtx = this;
    }
  }
  return _then(this, onResolve, onReject, argCtx);
}

/**
 * Method `.then` with normalized arguments
 * @param  {Promise}   parentPromise
 * @param  {Function}  onResolve
 * @param  {Function}  onReject
 * @param  {Object}    ctx
 * @private
 */
function _then (parentPromise, onResolve, onReject, ctx) {
  var childDeferred = new Deferred$1();

  if (parentPromise.isResolved() && typeof onResolve !== 'function') {
    childDeferred.resolve(getPromiseValue(parentPromise));
    return childDeferred.promise;
  }

  if (parentPromise.isRejected() && typeof onReject !== 'function') {
    childDeferred.reject(getPromiseValue(parentPromise));
    return childDeferred.promise;
  }

  var child = new ChildPromise(childDeferred, onResolve, onReject, ctx);

  if (parentPromise.isPending()) {
     addChild(parentPromise, child);
  } else {
     processChild(parentPromise, child);
  }

  return childDeferred.promise;
}

function ChildPromise (dfd, onResolve, onReject, ctx) {
  this.deferred = dfd;
  this.onResolve = onResolve;
  this.onReject = onReject;
  this.ctx = ctx;
}

function addChild (parentPromise, child) {
  if (!parentPromise._children) {
    parentPromise._children = [child];
  } else {
    parentPromise._children.push(child);
  }
}

/**
 * Alias for Promise#then(null, fn)
 * @param {Function} onReject
 * @param {Object}   [ctx]
 * @returns {Promise}
 */
function _catch (onReject, ctx) {
  return this.then(null, onReject, ctx);
}

/**
 * @param {Promise} promise
 * @param {String}  key
 * @param {Object}  obj
 * @private
 */
function addCallback (promise, key, obj) {
  if (!promise[key]) {
    promise[key] = [obj];
  } else {
    promise[key].push(obj);
  }
}

Promise.prototype.always = always;
Promise.prototype.done = done;
Promise.prototype.fail = fail;
Promise.prototype['catch'] = _catch;
Promise.prototype.isPending = isPending;
Promise.prototype.isResolved = isResolved;
Promise.prototype.isRejected = isRejected;
Promise.prototype.then = then;

/**
 * Deferred class
 * @class
 */
function Deferred$1 () {
  this.promise = new Promise();
}

/**
 * Translates the promise into rejected state.
 * @param {*} reason
 * @returns {Deferred}
 * @public
 */
function reject (reason) {
  // ignore non-pending promises
  if (getPromiseStatus(this.promise) !== PROMISE_PENDING) {
    return this;
  }

  return rejectWithReason(this, reason);
}

/**
 * Translates the promise into resolved state.
 * @param {*} x
 * @returns {Deferred}
 * @public
 */
function resolve (x) {
  var dfd = this;
  var promise = this.promise;

  // ignore non-pending promises
  if (getPromiseStatus(promise) !== PROMISE_PENDING) {
    return dfd;
  }

  // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
  if (x === this || x === promise) {
    return rejectWithSameArgError(dfd);
  }

  // Resolve with promise
  if (x instanceof Promise) {
    return resolveWithPromise(dfd, x);
  }

  return resolveWithValue(dfd, x);
}

/**
 * @private
 */
function rejectWithReason (dfd, reason) {
  var promise = dfd.promise;

  setPromiseStatus(promise, PROMISE_REJECTED);
  setPromiseValue(promise, reason);

  runCallbacks(promise._failCallbacks, reason);
  processChildren(dfd);
  cleanUpPromise(promise);

  return dfd;
}

/**
 * @private
 */
function rejectWithSameArgError (dfd) {
  var err = new TypeError('Promise and argument refer to the same object');
  dfd.reject(err);
  return dfd;
}

/**
 * @private
 */
function resolveWithPromise (dfd, promise) {
  // lock promise
  lockPromise(dfd.promise);

  // 2.3.2.2. if/when x is fulfilled, fulfill promise with the same value.
  // 2.3.2.3. if/When x is rejected, reject promise with the same reason.
  promise
    .done(function onValueResolve (xValue) {
      // unlock promise before resolving
      setPromiseStatus(dfd.promise, PROMISE_PENDING);
      resolveWithValue(dfd, xValue);
    })
    .fail(function onValueReject (xReason) {
      // unlock promise before resolving
      setPromiseStatus(dfd.promise, PROMISE_PENDING);
      rejectWithReason(dfd, xReason);
    });

  return dfd;
}

/**
 * @private
 */
function resolveWithValue (dfd, value) {
  setPromiseStatus(dfd.promise, PROMISE_RESOLVED);
  setPromiseValue(dfd.promise, value);

  runCallbacks(dfd.promise._doneCallbacks, value);
  processChildren(dfd);

  cleanUpPromise(dfd.promise);

  return dfd;
}

/**
 * @private
 */
function processChildren (dfd) {
  var children = dfd.promise._children;
  if (children) {
    for (var i = 0; i < children.length; i++) {
      processChild(dfd.promise, children[i]);
    }
  }
}

/**
 * @private
 */
function runCallbacks (callbacks, value) {
  if (callbacks) {
    for (var i = 0; i < callbacks.length; i++) {
      runCallback(callbacks[i], value);
    }
  }
}

/**
 * @private
 */
function runCallback (callback, value) {
  try {
    callback.fn.call(callback.ctx, value);
  } catch (err) {
    throwAsync(err);
  }
}

/**
 * @private
 */
function throwAsync (err) {
  setTimeout(function onAsyncErrorTimeout () {
    throw err;
  }, 0);
}

/**
 * Returns `true` if the given argument is an instance of Deferred, `false` if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
function isPromise (arg) {
  return arg instanceof Promise;
}

/**
 * Returns true if the given argument is a thenable object (has `then` method),
 * false if it is not.
 * @param {*} arg
 * @returns {Boolean}
 * @public
 */
function isThenable (arg) {
  return arg !== null && typeof arg === 'object' && typeof arg.then === 'function';
}

/**
 * @private
 */
function cleanUpPromise (promise) {
  promise._doneCallbacks = null;
  promise._failCallbacks = null;
}

/**
 * @param {Promise} promise
 * @private
 */
function lockPromise (promise) {
  setPromiseStatus(promise, PROMISE_LOCKED);
}

Deferred$1.isDeferred = isDeferred;
Deferred$1.isPromise = isPromise;
Deferred$1.isThenable = isThenable;

Deferred$1.prototype.reject = reject;
Deferred$1.prototype.resolve = resolve;

/**
 * Returns a promise that resolves when all of the promises in the given array have resolved,
 * or rejects with the reason of the first passed promise that rejects.
 * @param   {Array} promises
 * @returns {Promise}
 * @public
 */
function all (promises) {
  var dfd = new Deferred$1();

  if (!promises) {
    return dfd.promise;
  }

  var values = new Array(promises.length);
  var pendingCount = 0;
  var i;
  var l;

  for (i = 0, l = promises.length; i < l; i++) {
    // If rejected argument found reject promise and return it
    if (promises[i].isRejected()) {
      dfd.reject(getPromiseValue(promises[i]));
      return dfd.promise;
    }

    // If resolved argument found add its value to array of values
    if (promises[i].isResolved()) {
      values[i] = getPromiseValue(promises[i]);
      continue;
    }

    // Increase number of pending arguments
    pendingCount++;

    // Once argument is rejected reject promise with the same reason
    promises[i].fail(function onPromiseFail (reason) {
      dfd.reject(reason);
    });

    // When argument is resolved add its value to array of values
    // and decrease number of remaining pending arguments
    promises[i].done(function onPromiseDone (value) {
      var index = indexOf(promises, this);
      values[index] = value;
      pendingCount--;

      // Resolve promise if no pending arguments left
      if (pendingCount === 0) {
        dfd.resolve(values);
      }
    }, promises[i]);
  }

  if (!pendingCount) {
    dfd.resolve(values);
    return dfd.promise;
  }

  return dfd.promise;
}

/**
 * Returns a promise that resolves or rejects as soon as one of the promises
 * in the given array resolves or rejects, with the value or reason from that promise.
 * @param   {Array} promises
 * @returns {Promise}
 * @public
 */
function race (promises) {
  var dfd = new Deferred$1();

  if (!promises) {
    return dfd.promise;
  }

  var reasons = new Array(promises.length);
  var pendingCount = 0;
  var i;
  var l;

  for (i = 0, l = promises.length; i < l; i++) {
    // If resolved argument found resolve promise and return it
    if (promises[i].isResolved()) {
      dfd.resolve(getPromiseValue(promises[i]));
      return dfd.promise;
    }

    // If rejected argument found add its reason to array of reasons
    if (promises[i].isRejected()) {
      reasons[i] = getPromiseValue(promises[i]);
      continue;
    }

    // Increase number of pending arguments
    pendingCount++;

    // Once argument is resolved reject promise with the same reason
    promises[i].done(function onPromiseDone (value) {
      dfd.resolve(value);
    });

    // When argument is rejected add its reason to array of reasons
    // and decrease number of remaining pending arguments
    promises[i].fail(function onPromiseFail (reason) {
      var index = indexOf(promises, this);
      reasons[index] = reason;
      pendingCount--;

      // Reject promise if no pending arguments left
      if (pendingCount === 0) {
        dfd.reject(reasons);
      }
    }, promises[i]);
  }

  if (!pendingCount) {
    dfd.reject(reasons);
    return dfd.promise;
  }

  return dfd.promise;
}

/**
 * Returns a Promise object that is rejected with the given reason.
 * @param   {*} reason
 * @returns {Promise}
 * @public
 */
function reject$1 (reason) {
  var dfd = new Deferred$1();
  dfd.reject(reason);
  return dfd.promise;
}

/**
 * Returns a Promise object that is resolved with the given value.
 * @param   {*} [x]
 * @returns {Promise}
 * @public
 */
function resolve$1 (x) {
  if (Deferred$1.isPromise(x)) {
    return x;
  }

  if (Deferred$1.isDeferred(x)) {
    return x.promise;
  }

  var dfd = new Deferred$1();

  if (Deferred$1.isThenable(x)) {
    x.then(function onArgResolve (val) {
      dfd.resolve(val);
    }, function onValueReject (reason) {
      dfd.reject(reason);
    });
  } else {
    dfd.resolve(x);
  }

  return dfd.promise;
}

Deferred$1.all = all;
Deferred$1.race = race;
Deferred$1.reject = reject$1;
Deferred$1.resolve = resolve$1;

return Deferred$1;

})));
