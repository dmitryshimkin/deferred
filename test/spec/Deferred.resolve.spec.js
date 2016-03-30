'use strict';

var Deferred = require('../../dist/deferred');

describe('Deferred.resolve', function () {
  describe('with value', function () {
    it('should return a promise resolved with given value', function (done) {
      var obj = {};
      Deferred.resolve(obj)
        .then(function (value) {
          expect(value).toBe(obj);
          done();
        });
    });
  });

  describe('with no argument', function () {
    it('should return a promise resolved without value', function (done) {
      Deferred.resolve()
        .then(function (value) {
          expect(value).toBe(void 0);
          done();
        });
    });
  });

  describe('with undefined', function () {
    it('should return a promise resolved with undefined', function () {
      Deferred.resolve(undefined)
        .then(function (value) {
          expect(value).toBe(void 0);
          done();
        });
    });
  });

  describe('with a promise', function () {
    it('should return given promise itself', function () {
      var dfd = new Deferred();
      expect(Deferred.resolve(dfd.promise)).toBe(dfd.promise);
    });
  });

  describe('with deferred', function () {
    it('should return a promise of given deferred', function () {
      var dfd = new Deferred();
      expect(Deferred.resolve(dfd)).toBe(dfd.promise);
    });
  });

  describe('with thenable', function () {
    it('should return a pending promise that will be resolved once given thenable object is resolved', function (done) {
      var value = {};

      var thenable = {
        then: function (onResolve) {
          setTimeout(function () {
            onResolve(value);
          }, 100);
        }
      };

      var promise = Deferred.resolve(thenable);

      expect(Deferred.isPromise(promise)).toBe(true);
      expect(promise.isPending()).toBe(true);

      promise
        .then(function () {
          expect(arguments[0]).toBe(value);
          done();
        });
    });

    it('should return a pending promise that will be rejected once given thenable object is rejected', function (done) {
      var reason = {};
      var thenable = {
        then: function (onResolve, onReject) {
          setTimeout(function () {
            onReject(reason);
          }, 100);
        }
      };

      var promise = Deferred.resolve(thenable);

      expect(Deferred.isPromise(promise)).toBe(true);
      expect(promise.isPending()).toBe(true);

      promise
        .then(null, function () {
          expect(arguments[0]).toBe(reason);
          done();
        });
    });
  });
});
