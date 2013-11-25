
/**
 * Deferred class
 * @class
 */

var Deferred = function () {
  this['promise'] = new Promise();
  this.reason = void(0);
  this.value = void(0);
};

Deferred.prototype = {

  /**
   *
   */

  fail: function () {
    return this.promise.fail.apply(this['promise'], arguments);
  },

  /**
   *
   */

  done: function () {
    return this.promise.done.apply(this['promise'], arguments);
  },

  /**
   *
   */

  notify: function () {
    return this.promise['notify'].apply(this['promise'], arguments);
  },

  /**
   *
   */

  progress: function () {
    return this.promise['progress'].apply(this['promise'], arguments);
  },

  /**
   *
   */

  promise: function () {
    return this.promise;
  },

  /**
   * Translates promise into rejected state
   * @param [reason] {*} Reason
   * @public
   */

  reject: function (reason) {
    var states = Promise.state;
    var promise = this['promise'];

    if (promise._state === states.PENDING) {
      this.reason = reason;
      promise._state = states.REJECTED;
      notifyFail.call(promise);
    }
    return this;
  },

  /**
   * Translates promise into resolved state
   * @param [value] {*}
   * @public
   */

  resolve: function (value) {
    var states = Promise.state;
    var promise = this['promise'];

    if (promise._state === states.PENDING) {
      this.value = value;
      promise._state = states.RESOLVED;
      notifyDone.call(promise);
    }

    return this;
  }
};