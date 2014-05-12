/**
 * Returns promise that will be resolved once any of passed promises or deferreds is resolved
 * Promise will be rejected if all of passed promises or deferreds are rejected
 * @param promises {Array}
 * @returns {Promise}
 */

Deferred['any'] = function (promises) {
  var d = new Deferred();
  var promise;
  var remain = promises.length;
  var values = [], value, index;
  var uids = [];

  var done = function (value) {
    var args = slice.call(arguments);
    var index = uids.indexOf(this.uid);
    d.resolve.call(d, value, index);
  };

  var fail = function (reason) {
    var index = uids.indexOf(this.uid);
    values[index] = reason;
    remain = remain - 1;
    if (remain === 0) {
      d.reject.apply(d, values);
    }
  };

  for (var i = 0, l = promises.length; i < l; i++) {
    promise = promises[i];

    if (promise instanceof Deferred) {
      promise = promise.promise;
    }

    uids.push(promise.uid);

    if (promise._state === 1) {
      index = uids.indexOf(promise.uid);
      value = promise.value;
      return d.resolve.call(d, promise.value, index).promise;
    }

    promise
      .done(done)
      .fail(fail);
  }

  return d.promise;
};
