'use strict';

var Deferred = require('../../dist/deferred');

describe('Deferred.reject', function () {
  describe('with value', function () {
    it('should return a promise rejected with given value as a reason', function (done) {
      var obj = {};
      Deferred.reject(obj)
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(obj);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('with no argument', function () {
    it('should return a promise rejected without value', function (done) {
      Deferred.reject()
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(void 0);
          done();
        });
    });
  });

  describe('with undefined', function () {
    it('should return a promise rejected with undefined as a reason', function (done) {
      Deferred.reject(undefined)
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(void 0);
          done();
        });
    });
  });

  describe('with a promise', function () {
    it('should return a promise rejected with given promise as a reason', function (done) {
      var dfd = new Deferred();
      Deferred.reject(dfd.promise)
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(dfd.promise);
          done();
        });
    });
  });

  describe('with deferred', function () {
    it('should return a promise rejected with given deferred as a reason', function (done) {
      var dfd = new Deferred();
      Deferred.reject(dfd)
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(dfd);
          done();
        });
    });
  });

  describe('with thenable', function () {
    it('should return a promise rejected with given thenable as a reason', function (done) {
      var thenable = {
        then: function () {}
      };

      Deferred.reject(thenable)
        .then(done.fail)
        .catch(function (value) {
          expect(value).toBe(thenable);
          done();
        });
    });
  });
});
