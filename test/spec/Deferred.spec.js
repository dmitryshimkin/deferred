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

    describe('done', function () {

      it('handler', function () {
        var d = new Deferred();
        var spy = jasmine.createSpy('done');
        var resolved = false;

        d.done(spy);

        runs(function () {
          setTimeout(function () {
            d.resolve();
            resolved = true;
          }, 30);
        });

        waitsFor(function () {
          return resolved;
        }, 'timeout', 100);

        runs(function () {
          expect(spy).toHaveBeenCalled();
        });
      });

      it ('handler with context', function () {
        var d = new Deferred();
        var resolved = false;
        var ctx;
        var obj = {
          fn: function () {
            ctx = this;
          }
        };

        d.done(obj.fn, obj);

        runs(function () {
          setTimeout(function () {
            d.resolve();
            resolved = true;
          }, 30);
        });

        waitsFor(function () {
          return resolved;
        }, 'timeout', 100);

        runs(function () {
          expect(ctx).toBe(obj);
        });
      });

      it('many handlers', function () {
        var d = new Deferred();
        var resolved = false;

        var handler1 = function () {
          __log.push(1);
        };
        var handler2 = function () {
          __log.push(2);
        };
        var handler3 = function () {
          __log.push(3);
        };

        d
          .done(handler1)
          .done(handler2)
          .done(handler3);

        runs(function () {
          setTimeout(function () {
            d.resolve();
            resolved = true;
          }, 30);
        });

        waitsFor(function () {
          return resolved;
        }, 'timeout', 100);

        runs(function () {
          expect(__log.length).toBe(3);
          expect(__log[0]).toBe(1);
          expect(__log[1]).toBe(2);
          expect(__log[2]).toBe(3);
        });
      });

      it('sync call', function () {
        var d = new Deferred();
        var spy = jasmine.createSpy('done');

        d
          .done(spy)
          .resolve();

        expect(spy).toHaveBeenCalled();
      });

      it('resolved promise', function () {
        var d = new Deferred();
        var spy1 = jasmine.createSpy('done1');
        var spy2 = jasmine.createSpy('done2');
        var spy3 = jasmine.createSpy('done3');

        d
          .done(spy1)
          .resolve()
          .done(spy2)
          .done(spy3);

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);

        expect(spy3).toHaveBeenCalled();
        expect(spy3.calls.length).toBe(1);
      });

      it('nested', function () {

      });
    });

    // fail
    // describe

    // resolve (check double resolve, check resolve of rejected)

    // reject (check double reject, check reject of resolved)

    // nested subscriptions and state changing
  });
}());