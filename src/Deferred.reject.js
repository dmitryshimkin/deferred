import Deferred from './Deferred'

/**
 * Returns a Promise object that is rejected with the given reason.
 * @param   {*} reason
 * @returns {Promise}
 * @public
 */
function reject (reason) {
  var dfd = new Deferred();
  dfd.reject(reason);
  return dfd.promise;
}

export default reject
