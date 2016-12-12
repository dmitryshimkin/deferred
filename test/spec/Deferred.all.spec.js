'use strict';

// todo test no arguments

var Deferred = require('../../dist/deferred');

describe('Deferred.all', function () {
  describe('all', function () {
    it('should exist', function () {
      expect(Deferred.all).toBeDefined();
    });

    it('should return promise', function () {
      var promise = Deferred.all();
      expect(Deferred.isPromise(promise)).toBe(true);
    });
  });

  describe('returned promise', function () {
    it('should be resolved if all passed promises are resolved', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.resolve();
      dfdB.resolve();
      dfdC.resolve();

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isResolved()).toBe(true);
    });

    it('should be resolved when all passed promises are resolved', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.resolve();

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.resolve();
      expect(promise.isPending()).toBe(true);

      dfdC.resolve();
      expect(promise.isResolved()).toBe(true);
    });

    it('should be rejected if at least one of passed promises is rejected', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.resolve();
      dfdB.reject();
      dfdC.resolve();

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isRejected()).toBe(true);
    });

    it('should be rejected once one of passed promises is rejected', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();

      dfdA.resolve();

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.reject();
      expect(promise.isRejected()).toBe(true);

      dfdC.resolve();
      expect(promise.isRejected()).toBe(true);
    });

    it('should be resolved with array of passed promises values', function (done) {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var value1 = {};

      dfdB.resolve(value1);

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);

      dfdC.resolve('foo');
      dfdA.resolve();

      promise.then(function (value) {
        expect(value).toEqual([undefined, value1, 'foo']);
        done();
      });
    });

    it('should be rejected with reason of passed rejected promise', function (done) {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var reason = {};

      dfdB.resolve('foo');

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);

      dfdC.reject(reason);
      dfdA.resolve();

      promise.catch(function (err) {
        expect(err).toBe(reason);
        done();
      });
    });

    it('should be resolved correctly if promise in arguments is resolved with another promise', function (done) {
      var dfdA = new Deferred();
      var dfdB = new Deferred();
      var dfdC = new Deferred();
      var d4 = new Deferred();

      dfdA.resolve(1);

      var promise = Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise]);
      expect(promise.isPending()).toBe(true);

      dfdB.resolve(d4.promise);
      expect(promise.isPending()).toBe(true);

      dfdC.resolve(3);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        d4.resolve(2);
        expect(promise.isResolved()).toBe(true);

        promise.then(function (value) {
          expect(value).toEqual([1, 2, 3]);
          done();
        });
      }, 20);
    });
  });
});
