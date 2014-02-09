/**
 * Returns promise that will be resolved when all passed promises or deferreds are resolved
 * Promise will be rejected if at least on of passed promises or deferreds is rejected
 * @param promises {Array}
 * @returns {Promise}
 */

Deferred['when'] = function (promises) {
  var d = new Deferred();
  var promise;
  var remain = promises.length;
  var values = [];
  var uids = [];

  var done = function () {
    var index = uids.indexOf(this.uid);
    values[index] = arguments;
    remain = remain - 1;
    if (remain === 0) {
      d.resolve.apply(d, values);
    }
  };

  var fail = function () {
    var args = slice.call(arguments);
    var index = uids.indexOf(this.uid);

    args.push(index);

    d.reject.apply(d, args);
  };

  for (var i = 0, l = promises.length; i < l; i++) {
    promise = promises[i];

    if (promise instanceof Deferred) {
      promise = promise.promise;
    }

    uids.push(promise.uid);

    if (promise._state === REJECTED) {
      return d.reject.apply(d, promise.value).promise;
    }

    promise
      .done(done)
      .fail(fail);
  }

  return d.promise;
};
