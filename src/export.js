/**
 * Export
 */

var obj = 'object';

if (typeof module === obj && typeof module.exports === obj) {
  module.exports = Deferred;
} else if (typeof define === 'function' && define.amd) {
  define('Deferred', [], function () {
    return Deferred;
  });
} else if (typeof window === obj) {
  window['Deferred'] = Deferred;
}
