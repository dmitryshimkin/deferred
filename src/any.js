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

  var done = function () {
    var args = slice.call(arguments);
    var index = uids.indexOf(this.uid);

    args.push(index);

    d.resolve.apply(d, args);
  };

  var fail = function () {
    var index = uids.indexOf(this.uid);
    values[index] = slice.call(arguments);
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

    if (promise._state === RESOLVED) {
      index = uids.indexOf(promise.uid);
      value = promise.value;
      value.push(index);

      return d.resolve.apply(d, value).promise;
    }

    promise
      .done(done)
      .fail(fail);
  }

  return d.promise;
};
