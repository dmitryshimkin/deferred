'use strict';

var Deferred = require('../../dist/deferred');

describe('Deferred.race', function () {
  describe('race', function () {
    it('should exist', function () {
      expect(Deferred.race).toBeDefined();
    });

    it('should return promise', function () {
      var promise = Deferred.race();
      expect(Deferred.isPromise(promise)).toBe(true);
    });
  });

  describe('returned promise', function () {
    it('should be resolved if at least one of passed promises is resolved', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.reject();
      dfdB.reject();
      dfdC.resolve();

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isResolved()).toBe(true);
    });

    it('should be resolved when one of passed promises is resolved', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.reject();

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.reject();
      expect(promise.isPending()).toBe(true);

      dfdC.resolve();
      expect(promise.isResolved()).toBe(true);
    });

    it('should be rejected if all of passed promises are rejected', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.reject();
      dfdB.reject();
      dfdC.reject();

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isRejected()).toBe(true);
    });

    it('should be rejected when all of passed promises are rejected', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.reject();

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.reject();
      expect(promise.isPending()).toBe(true);

      dfdC.reject();
      expect(promise.isRejected()).toBe(true);
    });

    it('should be resolved with value of first resolved promise', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var value = {};

      dfdB.resolve(value);

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);

      expect(promise.value).toBe(value);
    });

    it('should be rejected with array of reasons of rejected promises', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var reason = {};

      dfdB.reject('foo');

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);

      dfdC.reject(reason);
      dfdA.reject();

      expect(promise.value).toEqual([undefined, 'foo', reason]);
    });

    it('should be resolved correctly if one of passed promise is resolved with another promise', function (done) {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var dfdD = new Deferred();
      var value = {};

      dfdA.reject();

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.reject();
      expect(promise.isPending()).toBe(true);

      dfdC.resolve(dfdD.promise);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        dfdD.resolve(value);
        expect(promise.isResolved()).toBe(true);
        expect(promise.value).toBe(value);
        done();
      }, 20);
    });

    it('should be rejected correctly if some promises in arguments are rejected with another promise', function (done) {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var dfdD = new Deferred();

      dfdA.reject(1);

      var promise = Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.resolve(dfdD.promise);
      expect(promise.isPending()).toBe(true);

      dfdC.reject(3);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        dfdD.reject(2);
        expect(promise.isRejected()).toBe(true);
        expect(promise.value).toEqual([1, 2, 3]);
        done();
      }, 20);
    });
  });
});
