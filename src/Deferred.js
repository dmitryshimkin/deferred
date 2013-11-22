var Deferred = function () {
  this['promise'] = new Promise();
  this._state = Deferred.state.PENDING;
  this._value = void(0);
};

Deferred.prototype = {
  fail: function () {
    return this.promise.fail.apply(this['promise'], arguments);
  },

  done: function () {
    return this.promise.done.apply(this['promise'], arguments);
  },

  notify: function () {
    return this.promise['notify'].apply(this['promise'], arguments);
  },

  progress: function () {
    return this.promise['progress'].apply(this['promise'], arguments);
  },

  promise: function () {
    return this.promise;
  },

  reject: function (reason) {
    if (this.state === Deferred.state.PENDING) {
      this.reason = reason;
      this.state = Deferred.state.REJECTED;
    }
  },

  resolve: function (value) {
    if (this.state === Deferred.state.PENDING) {
      this._value = value;
      this._state = Deferred.state.RESOLVED;
    }
  },

  valueOf: function () {
    return this.promise.valueOf.apply(this.promise, arguments);
  }
};

Deferred.state = {};

Deferred.state.PENDING = 0;
Deferred.state.RESOLVED = 1;
Deferred.state.REJECTED = 2;