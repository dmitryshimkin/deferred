describe('Deferred.all', function () {
  'use strict';

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
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.resolve();
      d2.resolve();
      d3.resolve();

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);
      expect(promise.isResolved()).toBe(true);
    });

    it('should be resolved when all passed promises are resolved', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.resolve();

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.resolve();
      expect(promise.isPending()).toBe(true);

      d3.resolve();
      expect(promise.isResolved()).toBe(true);
    });

    it('should be rejected if at least one of passed promises is rejected', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.resolve();
      d2.reject();
      d3.resolve();

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);
      expect(promise.isRejected()).toBe(true);
    });

    it('should be rejected once one of passed promises is rejected', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();

      d1.resolve();

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.reject();
      expect(promise.isRejected()).toBe(true);

      d3.resolve();
      expect(promise.isRejected()).toBe(true);
    });

    it('should be resolved with array of passed promises values', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var value1 = {};

      d2.resolve(value1);

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);

      d3.resolve('foo');
      d1.resolve();

      expect(promise.value).toEqual([undefined, value1, 'foo']);
    });

    it('should be rejected with reason of passed rejected promise', function () {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var reason = {};

      d2.resolve('foo');

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);

      d3.reject(reason);
      d1.resolve();

      expect(promise.value).toBe(reason);
    });

    it('should be resolved correctly if promise in arguments is resolved with another promise', function (done) {
      var d1 = new Deferred();
      var d2 = new Deferred();
      var d3 = new Deferred();
      var d4 = new Deferred();

      d1.resolve(1);

      var promise = Deferred.all([d1.promise, d2.promise, d3.promise]);
      expect(promise.isPending()).toBe(true);

      d2.resolve(d4.promise);
      expect(promise.isPending()).toBe(true);

      d3.resolve(3);
      expect(promise.isPending()).toBe(true);

      setTimeout(function () {
        d4.resolve(2);
        expect(promise.isResolved()).toBe(true);
        expect(promise.value).toEqual([1, 2, 3]);
        done();
      }, 20);
    });
  });
});

// todo test no arguments
