var Promise = function () {
  this._callbacks = {
    done: [],
    fail: []
  };
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

fn['then'] = function () {
  console.log('then');
};

fn['valueOf'] = function () {
  console.log('valueOf');
};