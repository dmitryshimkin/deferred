'use strict';

/* istanbul ignore next */
if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = Deferred;
} else if (typeof define === 'function' && define.amd) {
  define('Deferred', [], function () {
    return Deferred;
  });
} else if (typeof window === 'object') {
  window.Deferred = Deferred;
}
