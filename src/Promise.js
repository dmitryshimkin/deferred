import Deferred from './Deferred'
import { isDeferred, processChild } from './utils'

/**
 * Promise constructor
 *
 * States
 *  pending:  0
 *  locked:   1
 *  resolved: 2
 *  rejected: 3
 *
 * @class
 */
function Promise () {
  this.value = void 0;
  this._state = 0;
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
  var state = this._state;
  var isDfd = isDeferred(arg);

  if (state === 2) {
    if (isDfd) {
      arg.resolve(this.value);
    } else {
      arg.call(ctx, this.value);
    }
    return this;
  }

  if (state === 0) {
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
  var state = this._state;
  var isDfd = isDeferred(arg);

  if (state === 3) {
    if (isDfd) {
      arg.reject(this.value);
    } else {
      arg.call(ctx, this.value);
    }
    return this;
  }

  if (state === 0) {
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
 * Returns true, if promise has pending state
 * @returns {Boolean}
 * @public
 */
function isPending () {
  return this._state <= 1;
}

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */
function isRejected () {
  return this._state === 3;
}

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */
function isResolved () {
  return this._state === 2;
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
    childDeferred.resolve(parentPromise.value);
    return childDeferred.promise;
  }

  if (parentPromise.isRejected() && typeof onReject !== 'function') {
    childDeferred.reject(parentPromise.value);
    return childDeferred.promise;
  }

  var child = new Child(childDeferred, onResolve, onReject, ctx);

  if (parentPromise.isPending()) {
     addChild(parentPromise, child);
  } else {
     processChild(parentPromise, child);
  }

  return childDeferred.promise;
}

function Child (dfd, onResolve, onReject, ctx) {
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
