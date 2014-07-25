'use strict';

/**
 * Returns promise that will be resolved when all passed promises or deferreds are resolved
 * Promise will be rejected if at least on of passed promises or deferreds is rejected
 * @param promises {Array}
 * @returns {Promise}
 */

Deferred.all = function (promises) {
  var d = new Deferred();
  var promise;
  var index;
  var value;
  var remain = promises.length;
  var values = [];
  var uids = [];

  values.length = promises.length;

  var done = function (value) {
    var index = uids.indexOf(this.uid);
    values[index] = value;
    remain = remain - 1;
    if (remain === 0) {
      d.resolve(values);
    }
  };

  var fail = function (reason) {
    var index = uids.indexOf(this.uid);
    values[index] = reason;
    d.reject(values);
  };

  for (var i = 0, l = promises.length; i < l; i++) {
    promise = promises[i];

    if (promise instanceof Deferred) {
      promise = promise.promise;
    }

    uids.push(promise.uid);

    if (promise._state === 2) {
      index = uids.indexOf(promise.uid);
      values[index] = promise.value;
      return d.reject(values).promise;
    }

    promise
      .done(done)
      .fail(fail);
  }

  return d.promise;
};
