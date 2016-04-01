'use strict';

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

Promise.prototype.always = function always (arg, ctx) {
  if (arg instanceof Deferred) {
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
};

/**
 * Adds onResolve listener and returns this promise
 * @TODO: test this === arg
 * @param {Function|Deferred} arg    Listener or another deferred
 * @param {Object}            [ctx]  Listener context
 * @returns {Object} Instance
 * @public
 */

Promise.prototype.done = function done (arg, ctx) {
  var state = this._state;
  var isDeferred = arg instanceof Deferred;

  if (state === 2) {
    if (isDeferred) {
      arg.resolve(this.value);
    } else {
      arg.call(ctx, this.value);
    }
    return this;
  }

  if (state === 0) {
    if (isDeferred) {
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
};

/**
 * Adds onReject listener
 * @TODO: test this === arg
 * @param  {Function|Deferred} arg   Listener or another deferred
 * @param  {Object}            [ctx] Listener context
 * @returns {Object} Instance
 * @public
 */

Promise.prototype.fail = function fail (arg, ctx) {
  var state = this._state;
  var isDeferred = arg instanceof Deferred;

  if (state === 3) {
    if (isDeferred) {
      arg.reject(this.value);
    } else {
      arg.call(ctx, this.value);
    }
    return this;
  }

  if (state === 0) {
    if (isDeferred) {
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
};

/**
 * Returns true, if promise has pending state
 * @returns {Boolean}
 * @public
 */

Promise.prototype.isPending = function isPending () {
  return this._state <= 1;
};

/**
 * Returns true, if promise is rejected
 * @returns {Boolean}
 * @public
 */

Promise.prototype.isRejected = function isRejected () {
  return this._state === 3;
};

/**
 * Returns true, if promise is resolved
 * @returns {Boolean}
 * @public
 */

Promise.prototype.isResolved = function isResolved () {
  return this._state === 2;
};

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

Promise.prototype.then = function then (onResolve, onReject, argCtx) {
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
};

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

function processChild (parentPromise, child) {
  var x;
  var error;

  var value = parentPromise.value;

  var isResolved = parentPromise._state === 2;
  var fn = isResolved ? child.onResolve : child.onReject;

  try {
    x = fn.call(child.ctx, value);
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
 * Alias for Promise#then(null, fn)
 * @param {Function} onReject
 * @param {Object}   [ctx]
 * @returns {Promise}
 */

Promise.prototype['catch'] = function _catch (onReject, ctx) {
  return this.then(null, onReject, ctx);
};

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
