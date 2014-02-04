/**
 *
 * @param promises {Array}
 * @returns {Promise}
 */

Deferred.when = function (promises) {
  var d = new Deferred();
  var promise, value;
  var remain = promises.length;
  var values = [];

  var done = function () {
    remain = remain - 1;
    if (remain === 0) {
      d.resolve();
    }
  };

  var fail = function (reason) {
    d.reject(reason);
  };

  for (var i = 0, l = promises.length; i < l; i++) {
    promise = promises[i];
    promise = promise.promise || promise;

    if (promise._state === REJECTED) {
      return d.reject(promise.value).promise;
    }

    promise
      .done(done)
      .fail(fail);
  }

  return d.promise;
};
