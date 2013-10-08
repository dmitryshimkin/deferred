var Deferred = function () {
  this.state = this.constructor.state['PENDING'];
  this.value = void(0);
};

Deferred.prototype = {
  fail: function () {
    //
  },

  done: function () {
    //
  },

  notify: function () {
    //
  },

  progress: function () {
    //
  },

  promise: function () {
    return {
      always: function () {
        //
      },

      done: function () {
        //
      },

      fail: function () {
        //
      },

      isRejected: function () {
        //
      },

      isResolved: function () {
        //
      },

      pipe: function () {
        //
      },

      progress: function () {
        //
      },

      promise: function () {
        //
      },

      state: function () {
        //
      },

      then: function () {
        //
      },

      valueOf: function () {
        //
      }
    };
  },

  reject: function (reason) {
    if (this.state === Deferred.state['PENDING']) {
      this.reason = reason;
      this.state = Deferred.state['REJECTED'];
    }
  },

  resolve: function (value) {
    if (this.state === Deferred.state['PENDING']) {
      this.value = value;
      this.state = Deferred.state['RESOLVED'];
    }
  },

  valueOf: function () {
    //
  }
};

Deferred.state['PENDING'] = 0;
Deferred.state['RESOLVED'] = 1;
Deferred.state['REJECTED'] = 2;