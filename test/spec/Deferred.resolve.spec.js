describe('Deferred.resolve', function () {
  'use strict';

  it('Exists', function () {
    expect(typeof Deferred.resolve).toBe('function');
  });

  it('with value', function (done) {
    var obj = {};
    Deferred.resolve(obj)
      .then(function (value) {
        expect(value).toBe(obj);
        done();
      });
  });

  it('with no argument', function (done) {
    Deferred.resolve()
      .then(function (value) {
        expect(value).toBe(void 0);
        done();
      });
  });

  it('with undefined', function () {
    Deferred.resolve(undefined)
      .then(function (value) {
        expect(value).toBe(void 0);
        done();
      });
  });

  it('with promise', function () {
    var dfd = new Deferred();
    expect(Deferred.resolve(dfd.promise)).toBe(dfd.promise);
  });

  it('with deferred', function () {
    var dfd = new Deferred();
    expect(Deferred.resolve(dfd)).toBe(dfd.promise);
  });

  describe('with thenable', function () {
    it('resolve', function (done) {
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

    it('reject', function (done) {
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

    it('exception before resolve', function (done) {
      var value = {};
      var err = new Error();

      var thenable = {
        then: function (onResolve) {
          setTimeout(function () {
            throw err;
            onResolve(value);
          }, 100);
        }
      };

      var promise = Deferred.resolve(thenable);

      expect(Deferred.isPromise(promise)).toBe(true);
      expect(promise.isPending()).toBe(true);

      promise
        .then(null, function (reason) {
          expect(reason).toBe(err);
          done();
        });
    });
  });
});
