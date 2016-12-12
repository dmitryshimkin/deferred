import Deferred from './Deferred'

import {
  getPromiseStatus,
  getPromiseValue,
  isDeferred,
  processChild,
  setPromiseStatus,
  setPromiseValue
} from './utils'

import {
  PROMISE_PENDING,
  PROMISE_LOCKED,
  PROMISE_RESOLVED,
  PROMISE_REJECTED,
} from './constant'

let counter = 0;

/**
 * @name Promise
 * @class
 */
function Promise () {
  setPromiseValue(this, void 0);
  setPromiseStatus(this, PROMISE_PENDING);

  this.cid = `cid${counter}`;
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
  var childDeferred = new Deferred();

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

export default Promise
