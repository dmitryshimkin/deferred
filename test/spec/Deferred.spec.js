(function () {
  'use strict';

  var describe = window.describe;
  var expect = window.expect;
  var it = window.it;
  var beforeEach = window.beforeEach;

  // Deferred
  describe('Deferred', function () {
    var __log = [];

    beforeEach(function () {
      __log = [];
    });

    it('should exists', function () {
      expect(window.Deferred).toBeDefined();
    });
  });
}());