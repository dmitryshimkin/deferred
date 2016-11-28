import Deferred from './Deferred'

/**
 * Returns a Promise object that is resolved with the given value.
 * @param   {*} [x]
 * @returns {Promise}
 * @public
 */
function resolve (x) {
  if (Deferred.isPromise(x)) {
    return x;
  }

  if (Deferred.isDeferred(x)) {
    return x.promise;
  }

  var dfd = new Deferred();

  if (Deferred.isThenable(x)) {
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

export default resolve
