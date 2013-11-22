var noop = function () {};


var Promise = function () {

};

var fn = Promise.prototype;

fn['always'] = function () {
  console.log('always');
};

fn['done'] = function () {
  console.log('done');
};

fn['fail'] = function () {
  console.log('fail');
};

fn['isRejected'] = function () {
  console.log('isRejected');
};

fn['isResolved'] = function () {
  console.log('isResolved');
};

fn['pipe'] = function () {
  console.log('pipe');
};

fn['progress'] = function () {
  console.log('progress');
};

//state: function () {
  //
//},

fn['then'] = function () {
  console.log('then');
};

fn['valueOf'] = function () {
  console.log('valueOf');
};
var Deferred = function () {
  this.state = Deferred.state['PENDING'];
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
    return new Promise();
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

Deferred.state = {};

Deferred.state['PENDING'] = 0;
Deferred.state['RESOLVED'] = 1;
Deferred.state['REJECTED'] = 2;
Deferred.when = function () {

};