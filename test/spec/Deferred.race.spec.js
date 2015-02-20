describe('Deferred.race', function () {
  'use strict';

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
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.reject();
      d2.reject();
      d3.resolve();

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isResolved()).toBe(true);
    });

    it('should be resolved when one of passed promises is resolved', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.reject();

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.reject();
      expect(promise.isPending()).toBe(true);

      d3.resolve();
      expect(promise.isResolved()).toBe(true);
    });

    it('should be rejected if all of passed promises are rejected', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.reject();
      d2.reject();
      d3.reject();

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isRejected()).toBe(true);
    });

    it('should be rejected when all of passed promises are rejected', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.reject();

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.reject();
      expect(promise.isPending()).toBe(true);

      d3.reject();
      expect(promise.isRejected()).toBe(true);
    });

    it('should be resolved with value of first resolved promise', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var value = {};

      d2.resolve(value);

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);

      expect(promise.value).toBe(value);
    });

    it('should be rejected with array of reasons of rejected promises', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var reason = {};

      d2.reject('foo');

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);

      d3.reject(reason);
      d1.reject();

      expect(promise.value).toEqual([undefined, 'foo', reason]);
    });

    it('should be resolved correctly if one of passed promise is resolved with another promise', function (done) {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var d4 = new Deferred();
      var value = {};

      d1.reject();

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.reject();
      expect(promise.isPending()).toBe(true);

      d3.resolve(d4.promise);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        d4.resolve(value);
        expect(promise.isResolved()).toBe(true);
        expect(promise.value).toBe(value);
        done();
      }, 20);
    });

    it('should be rejected correctly if some promises in arguments are rejected with another promise', function (done) {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var d4 = new Deferred();

      d1.reject(1);

      var promise = Deferred.race([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.resolve(d4.promise);
      expect(promise.isPending()).toBe(true);

      d3.reject(3);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        d4.reject(2);
        expect(promise.isRejected()).toBe(true);
        expect(promise.value).toEqual([1, 2, 3]);
        done();
      }, 20);
    });
  });
});
