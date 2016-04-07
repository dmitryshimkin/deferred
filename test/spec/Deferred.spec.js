'use strict';

// 2.3.2.1   If x is pending, promise must remain pending until x is fulfilled or rejected.
// @TODO restrict double resolve when first resolve was using pending promise and second with value
// @TODO its not obvious what to do if promise is resolved with another promise

// @TODO pass deferreds to done/fail/always
// @TODO test promise status inside handlers

var Deferred = require('../../dist/deferred');

function getGlobal () {
  if (typeof global === 'object') {
    return global;
  } else if (typeof window === 'object') {
    return window;
  } else {
    return undefined;
  }
}

function isCalledAsFunction (spy) {
  var thisValue = spy.calls.mostRecent().object;
  return thisValue === void 0 || thisValue === getGlobal();
}

describe('Deferred', function () {
  'use strict';

  var data = {
    foo: 'bar'
  };

  /**
   * Constructor
   * --------------------------------------------------------------------------
   */

  describe('Constructor', function () {
    it('should exist', function () {
      expect(typeof Deferred).toBe('function');
    });

    it('should return instance of Deferred', function () {
      var dfd = new Deferred();
      expect(dfd instanceof Deferred).toBe(true);
    });
  });

  /**
   * Done
   * --------------------------------------------------------------------------
   */

  describe('done', function () {
    describe('function as argument', function () {
      it('handler should be called once promise is resolved', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.done(handler);

        setTimeout(function () {
          dfd.resolve();
          expect(handler).toHaveBeenCalled();
          done();
        }, 20);
      });

      it('handler should be called as functions (i.e. with no this value)', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.done(handler);

        setTimeout(function () {
          dfd.resolve();
          expect(isCalledAsFunction(handler)).toBe(true);
          done();
        }, 20);
      });

      it('handler should be called with promise value as a first argument', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var value = {};

        dfd.promise.done(handler);

        setTimeout(function () {
          dfd.resolve(value);
          expect(handler.calls.argsFor(0)).toEqual([value]);
          done();
        }, 20);
      });

      it('handler should be called in specified context', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var ctx = {};

        dfd.promise
          .done(handler, ctx)
          .done(handler, null);

        setTimeout(function () {
          dfd.resolve();
          expect(handler.calls.all()[0].object).toBe(ctx);
          //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
          done();
        }, 30);
      });

      it('should return the same promise', function () {
        var dfd = new Deferred();
        expect(dfd.promise.done()).toBe(dfd.promise);
      });

      it('should support multiple handlers', function (done) {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise
          .done(handler1)
          .done(handler2)
          .done(handler3);

        setTimeout(function () {
          dfd.resolve();
          expect(handler1.calls.count()).toBe(1);
          expect(handler2.calls.count()).toBe(1);
          expect(handler3.calls.count()).toBe(1);
          done();
        }, 20);
      });

      it('should allow to call the same handler many times', function () {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise
          .done(handler)
          .done(handler)
          .done(handler);

        dfd.resolve();

        expect(handler.calls.count()).toBe(3);
      });

      it('should call handlers in order they were added', function () {
        var dfd = new Deferred();
        var log = [];

        var handler1 = function () {
          log.push(1);
        };

        var handler2 = function () {
          log.push(2);
        };

        var handler3 = function () {
          log.push(3);
        };

        dfd.promise
          .done(handler1)
          .done(handler2)
          .done(handler3);

        dfd.resolve();

        expect(log.join('')).toBe('123');
      });

      it('should call handlers synchronously', function () {
        var dfd = new Deferred();
        var spy = jasmine.createSpy();

        dfd.promise.done(spy);
        dfd.resolve();

        expect(spy).toHaveBeenCalled();
      });

      it('should call handler synchronously if promise is already resolved', function () {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise.done(handler1);

        dfd.resolve();

        dfd.promise
          .done(handler2)
          .done(handler3);

        expect(handler1).toHaveBeenCalled();
        expect(handler1.calls.count()).toBe(1);

        expect(handler2).toHaveBeenCalled();
        expect(handler2.calls.count()).toBe(1);

        expect(handler3).toHaveBeenCalled();
        expect(handler3.calls.count()).toBe(1);
      });

      it('should resolve passed deferred once promise resolved', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();

        dfdA.promise.done(dfdB);
        dfdA.resolve(data);

        expect(dfdB.promise.isResolved()).toBe(true);
        expect(dfdB.promise.value).toEqual(data);
      });

      it('should run handler in try/catch', function () {
        var dfd = new Deferred();
        var handlerA = function () {
          throw new Error('Custom error');
        };
        var handlerB = jasmine.createSpy('handlerB');

        dfd.promise
          .done(handlerA)
          .done(handlerB);

        spyOn(getGlobal(), 'setTimeout');

        expect(function () {
          dfd.resolve();
        }).not.toThrow();

        expect(handlerB).toHaveBeenCalled();
      });

      it('should re-throw caught error asynchronously', function () {
        var dfd = new Deferred();
        var handlerA = function () {
          throw new Error('Custom error');
        };
        var handlerB = jasmine.createSpy('handlerB');
        var errorHandler;

        dfd.promise
          .done(handlerA)
          .done(handlerB);

        spyOn(getGlobal(), 'setTimeout').and.callFake(function (callback) {
          errorHandler = callback;
        });

        dfd.resolve();

        expect(function () {
          errorHandler()
        }).toThrow();
      });
    });

    describe('deferred as argument', function () {
      it('should be resolved if promise is already resolved', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var value = {};

        dfdA.resolve(value);
        dfdA.promise.done(dfdB);

        expect(dfdB.promise.isResolved()).toBe(true);
        expect(dfdB.promise.value).toBe(value);
      });

      it('should be resolved once promise is resolved', function (done) {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var value = {};

        dfdA.promise.done(dfdB);

        setTimeout(function () {
          dfdA.resolve(value);

          expect(dfdB.promise.isResolved()).toBe(true);
          expect(dfdB.promise.value).toBe(value);

          done();
        }, 20);
      });
    });
  });

  /**
   * Fail
   * --------------------------------------------------------------------------
   */

  describe('fail', function () {
    describe('function as argument', function () {
      it('handler should be called once promise is rejected', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.fail(handler);

        setTimeout(function () {
          dfd.reject();
          expect(handler).toHaveBeenCalled();
          done();
        }, 20);
      });

      it('handler should be called as functions (i.e. with no this value)', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.fail(handler);

        setTimeout(function () {
          dfd.reject();
          expect(isCalledAsFunction(handler)).toBe(true);
          done();
        }, 20);
      });

      it('handler should be called with promise reject reason as a first argument', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var reason = {};

        dfd.promise.fail(handler);

        setTimeout(function () {
          dfd.reject(reason);
          expect(handler.calls.argsFor(0)).toEqual([reason]);
          done();
        }, 20);
      });

      it('handler should be called in specified context', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var obj = {};

        dfd.promise
          .fail(handler, obj)
          .fail(handler, null);

        setTimeout(function () {
          dfd.reject();
          expect(handler.calls.all()[0].object).toBe(obj);
          //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
          done();
        }, 30);
      });

      it('should return the same promise', function () {
        var dfd = new Deferred();
        expect(dfd.promise.fail()).toBe(dfd.promise);
      });

      it('should support multiple handlers', function (done) {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise
          .fail(handler1)
          .fail(handler2)
          .fail(handler3);

        setTimeout(function () {
          dfd.reject();
          expect(handler1.calls.count()).toBe(1);
          expect(handler2.calls.count()).toBe(1);
          expect(handler3.calls.count()).toBe(1);
          done();
        }, 20);
      });

      it('should allow to call the same handler many times', function () {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise
          .fail(handler)
          .fail(handler)
          .fail(handler);

        dfd.reject();

        expect(handler.calls.count()).toBe(3);
      });

      it('should call handlers in order they were added', function () {
        var dfd = new Deferred();
        var log = [];

        var handler1 = function () {
          log.push(1);
        };

        var handler2 = function () {
          log.push(2);
        };

        var handler3 = function () {
          log.push(3);
        };

        dfd.promise
          .fail(handler1)
          .fail(handler2)
          .fail(handler3);

        dfd.reject();

        expect(log.join('')).toBe('123');
      });

      it('should call handlers synchronously', function () {
        var dfd = new Deferred();
        var spy = jasmine.createSpy();

        dfd.promise.fail(spy);
        dfd.reject();

        expect(spy).toHaveBeenCalled();
      });

      it('should call handler synchronously if promise is already rejected', function () {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise.fail(handler1);

        dfd.reject();

        dfd.promise
          .fail(handler2)
          .fail(handler3);

        expect(handler1).toHaveBeenCalled();
        expect(handler1.calls.count()).toBe(1);

        expect(handler2).toHaveBeenCalled();
        expect(handler2.calls.count()).toBe(1);

        expect(handler3).toHaveBeenCalled();
        expect(handler3.calls.count()).toBe(1);
      });

      it('should resolve passed deferred once promise is rejected', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();

        dfdA.promise.fail(dfdB);
        dfdA.reject(data);

        expect(dfdB.promise.isRejected()).toBe(true);
        expect(dfdB.promise.value).toEqual(data);
      });
    });

    describe('deferred as argument', function () {
      it('should be rejected synchronously if promise is already rejected', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var reason = {};

        dfdA.reject(reason);
        dfdA.promise.fail(dfdB);

        expect(dfdB.promise.isRejected()).toBe(true);
        expect(dfdB.promise.value).toBe(reason);
      });

      it('should be rejected once promise is rejected', function (done) {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var reason = {};

        dfdA.promise.fail(dfdB);

        setTimeout(function () {
          dfdA.reject(reason);

          expect(dfdB.promise.isRejected()).toBe(true);
          expect(dfdB.promise.value).toBe(reason);

          done();
        }, 20);
      });
    });
  });

  /**
   * Always
   * --------------------------------------------------------------------------
   */

  describe('always', function () {
    describe('function as argument', function () {
      it('handler should be called once promise is resolved', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.always(handler);

        setTimeout(function () {
          dfd.resolve();
          expect(handler).toHaveBeenCalled();
          done();
        }, 30);
      });

      it('handler should be called once promise is rejected', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.always(handler);

        setTimeout(function () {
          dfd.reject();
          expect(handler).toHaveBeenCalled();
          done();
        }, 30);
      });

      it('handler should be called as functions (i.e. with no this value)', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.always(handler);

        setTimeout(function () {
          dfd.resolve();
          expect(isCalledAsFunction(handler)).toBe(true);
          done();
        }, 30);
      });

      it('handler should be called with promise value as a first argument', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var value = {};

        dfd.promise.always(handler);

        setTimeout(function () {
          dfd.resolve(value);
          expect(handler.calls.argsFor(0)).toEqual([value]);
          done();
        }, 20);
      });

      it('handler should be called with promise reject reason as a first argument', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var reason = {};

        dfd.promise.always(handler);

        setTimeout(function () {
          dfd.reject(reason);
          expect(handler.calls.argsFor(0)).toEqual([reason]);
          done();
        }, 20);
      });

      it('should return the same promise', function () {
        var dfd = new Deferred();
        expect(dfd.promise.always()).toBe(dfd.promise);
      });

      it('handler should be called in specified context', function (done) {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();
        var obj = {};

        dfd.promise
          .always(handler, obj)
          .always(handler, null);

        setTimeout(function () {
          dfd.resolve();
          expect(handler.calls.all()[0].object).toBe(obj);
          //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
          done();
        }, 30);
      });

      it('should support multiple handlers', function (done) {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise
          .always(handler1)
          .always(handler2)
          .always(handler3);

        setTimeout(function () {
          dfd.reject();
          expect(handler1.calls.count()).toBe(1);
          expect(handler2.calls.count()).toBe(1);
          expect(handler3.calls.count()).toBe(1);
          done();
        }, 20);
      });

      it('should allow to call the same handler many times', function () {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise
          .always(handler)
          .always(handler)
          .always(handler);

        dfd.reject();

        expect(handler.calls.count()).toBe(3);
      });

      it('should call handler synchronously if promise is already resolved', function () {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise.always(handler1);

        dfd.reject();

        dfd.promise
          .always(handler2)
          .always(handler3);

        expect(handler1).toHaveBeenCalled();
        expect(handler1.calls.count()).toBe(1);

        expect(handler2).toHaveBeenCalled();
        expect(handler2.calls.count()).toBe(1);

        expect(handler3).toHaveBeenCalled();
        expect(handler3.calls.count()).toBe(1);
      });

      it('should call handler synchronously if promise is already rejected', function () {
        var dfd = new Deferred();

        var handler1 = jasmine.createSpy();
        var handler2 = jasmine.createSpy();
        var handler3 = jasmine.createSpy();

        dfd.promise.always(handler1);

        dfd.reject();

        dfd.promise
          .always(handler2)
          .always(handler3);

        expect(handler1).toHaveBeenCalled();
        expect(handler1.calls.count()).toBe(1);

        expect(handler2).toHaveBeenCalled();
        expect(handler2.calls.count()).toBe(1);

        expect(handler3).toHaveBeenCalled();
        expect(handler3.calls.count()).toBe(1);
      });

      it('should resolve passed deferred once promise is resolved', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();

        dfdA.promise.always(dfdB);
        dfdA.resolve(data);

        expect(dfdB.promise.isResolved()).toBe(true);
        expect(dfdB.promise.value).toEqual(data);
      });

      it('should reject passed deferred once promise is rejected', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();

        dfdA.promise.always(dfdB);
        dfdA.reject(data);

        expect(dfdB.promise.isRejected()).toBe(true);
        expect(dfdB.promise.value).toEqual(data);
      });
    });

    describe('deferred as argument', function () {
      it('should be resolved or rejected synchronously if promise is already resolved or rejected', function () {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var reason = {};

        dfdA.reject(reason);
        dfdA.promise.always(dfdB);

        expect(dfdB.promise.isRejected()).toBe(true);
        expect(dfdB.promise.value).toBe(reason);
      });

      it('should be resolved or rejected once promise is resolved or rejected', function (done) {
        var dfdA = new Deferred();
        var dfdB = new Deferred();
        var value = {};

        dfdA.promise.always(dfdB);

        setTimeout(function () {
          dfdA.resolve(value);

          expect(dfdB.promise.isResolved()).toBe(true);
          expect(dfdB.promise.value).toBe(value);

          done();
        }, 20);
      });
    });
  });

  /**
   * 2.2. The then Method
   *
   * A promise must provide a then method to access its current or eventual value or reason.
   * A promise’s then method accepts two arguments:
   * promise.then(onFulfilled, onReject)
   *
   * 2.2.1. Both onFulfilled and onReject are optional arguments:
   *   2.2.1.1. If onFulfilled is not a function, it must be ignored.
   *   2.2.1.2. If onReject is not a function, it must be ignored.
   * 2.2.2. If onFulfilled is a function:
   *   2.2.2.1. it must be called after promise is fulfilled, with promise’s value as its first argument.
   *   2.2.2.2. it must not be called before promise is fulfilled.
   *   2.2.2.3. it must not be called more than once.
   * 2.2.3. If onReject is a function,
   *   2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
   *   2.2.3.2. it must not be called before promise is rejected.
   *   2.2.3.3. it must not be called more than once.
   * 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
   *        only platform code. 3.1.
   *        (3.1. Here “platform code” means engine, environment, and promise implementation code.
   *        In practice, this requirement ensures that onFulfilled and onReject execute asynchronously,
   *        after the event loop turn in which then is called, and with a fresh stack.
   *        This can be implemented with either a “macro-task” mechanism such as setTimeout or setImmediate,
   *        or with a “micro-task” mechanism such as MutationObserver or process.nextTick.
   *        Since the promise implementation is considered platform code, it may itself contain
   *        a task-scheduling queue or “trampoline” in which the handlers are called.)
   * 2.2.5. onFulfilled and onReject must be called as functions (i.e. with no this value). 3.2
   * 2.2.6. then may be called multiple times on the same promise.
   *   2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
   *            in the order of their originating calls to then.
   *   2.2.6.2. If/when promise is rejected, all respective onReject callbacks must execute
   *            in the order of their originating calls to then.
   * 2.2.7. then must return a promise 3.3.
   *        promise2 = promise1.then(onFulfilled, onReject);
   *        (3.3. Implementations may allow promise2 === promise1, provided the implementation
   *        meets all requirements. Each implementation should document whether
   *        it can produce promise2 === promise1 and under what conditions.)
   *
   *   2.2.7.1. If either onFulfilled or onReject returns a value x, run the
   *            Promise Resolution Procedure [[Resolve]](promise2, x).
   *   2.2.7.2. If either onFulfilled or onReject throws an exception e,
   *            promise2 must be rejected with e as the reason.
   *   2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled,
   *            promise2 must be fulfilled with the same value.
   *   2.2.7.4. If onReject is not a function and promise1 is rejected,
   *            promise2 must be rejected with the same reason.
   */

  describe('then', function () {
    // 2.2.2. If onFulfilled is a function:
    describe('onFulfilled', function () {
      // 2.2.2.1. it must be called after promise is fulfilled, with promise’s value as its first argument.
      // 2.2.1.2. If onReject is not a function, it must be ignored.
      it('should be called synchronously once promise is resolved', function () {
        var dfd = new Deferred();
        var onFulfill = jasmine.createSpy();

        dfd.promise.then(onFulfill);
        dfd.resolve(data);

        expect(onFulfill.calls.count()).toBe(1);
        expect(onFulfill.calls.argsFor(0)).toEqual([data]);
      });

      // 2.2.2.3. it must not be called more than once.
      it('should not be called more than once', function () {
        var dfd = new Deferred();
        var onFulfill = jasmine.createSpy();

        dfd.promise.then(onFulfill);
        dfd.resolve('foo').resolve(true);

        expect(onFulfill.calls.count()).toBe(1);
        expect(onFulfill.calls.argsFor(0)).toEqual(['foo']);
      });

      // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
      // NOTE: this implementation ignores this bullshit. Use BlueBird.js if you need it

      // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
      // NOTE: This is a shit. Context must be a promise or custom one
      describe('context', function () {
        it('should be undefined if no context specified', function () {
          var dfd = new Deferred();
          var onFullfill = jasmine.createSpy();

          dfd.promise.then(onFullfill);
          dfd.resolve();

          expect(isCalledAsFunction(onFullfill)).toBe(true);
        });

        it('should be custom if it\'s specified', function () {
          var dfd = new Deferred();
          var onFullfill = jasmine.createSpy();
          var ctx = {};

          dfd.promise.then(onFullfill, ctx);
          dfd.resolve();

          expect(onFullfill.calls.mostRecent().object).toBe(ctx);
        });
      });

      // 2.2.6. then may be called multiple times on the same promise
      // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
      //          in the order of their originating calls to then.
      it('all onFullfilled handlers should be called in order they were added', function () {
        var dfd = new Deferred();
        var log = [];

        function onFulfill1 () {
          log.push(1);
        }

        function onFulfill2 () {
          log.push(2);
        }

        function onFulfill3 () {
          log.push(3);
        }

        dfd.promise.then(onFulfill1);
        dfd.promise.then(onFulfill2);

        dfd.resolve('foo');

        dfd.promise.then(onFulfill3);

        expect(log.length).toBe(3);
        expect(log.join('')).toBe('123');
      });
    });

    // 2.2.3. If onReject is a function
    describe('onRejected', function () {
      // 2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
      it('should be called synchronously once promise is rejected', function () {
        var onReject = jasmine.createSpy();
        var dfd = new Deferred();

        dfd.promise.then(function () {}, onReject);
        dfd.reject(null);

        expect(onReject.calls.count()).toBe(1);
      });

      // 2.2.3.3. it must not be called more than once.
      it('should not be called more than once', function () {
        var dfd = new Deferred();
        var onReject = jasmine.createSpy();

        dfd.promise.then(function () {}, onReject);
        dfd.reject('foo').reject(true);

        expect(onReject.calls.count()).toBe(1);
        expect(onReject.calls.argsFor(0)).toEqual(['foo']);
      });

      // 2.2.1.1. If onFulfilled is not a function, it must be ignored.
      it('if first argument (onFullfilled) is not a function, it must be ignored', function () {
        var dfd = new Deferred();
        var onReject = jasmine.createSpy();

        dfd.promise.then(null, onReject);
        dfd.reject();

        expect(onReject.calls.count()).toBe(1);
      });

      // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
      // NOTE: this implementation ignores this bullshit. Use BlueBird.js if you need it

      // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
      // NOTE: This is a piece of shit. Context must be a promise itself of custom one
      describe('context', function () {
        it('should be a promise if no context specified', function () {
          var dfd = new Deferred();
          var onReject = jasmine.createSpy();

          dfd.promise.then(null, onReject);
          dfd.reject();

          expect(onReject.calls.mostRecent().object).toBe(dfd.promise);
        });

        it('should be custom if it\'s specified', function () {
          var dfd = new Deferred();
          var onReject = jasmine.createSpy();
          var ctx = {};

          dfd.promise.then(null, onReject, ctx);
          dfd.reject();

          expect(onReject.calls.mostRecent().object).toBe(ctx);
        });
      });

      // 2.2.6. then may be called multiple times on the same promise
      // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
      //          in the order of their originating calls to then.
      it('all onRejected handlers should be called in order they were added', function () {
        var dfd = new Deferred();
        var log = [];

        var onReject1 = function () {
          log.push(1);
        };
        var onReject2 = function () {
          log.push(2);
        };
        var onReject3 = function () {
          log.push(3);
        };

        dfd.promise.then(null, onReject1);
        dfd.promise.then(null, onReject2);

        dfd.reject('foo');

        dfd.promise.then(null, onReject3);

        expect(log.length).toBe(3);
        expect(log.join('')).toBe('123');
      });
    });

    // 2.2.7. then must return a promise 3.3.
    describe('return', function () {
      it('should return a new promise', function () {
        var dfd = new Deferred();
        var promise2 = dfd.promise.then();

        expect(Deferred.isPromise(promise2)).toBe(true);
        expect(Deferred.isDeferred(promise2)).toBe(false);
        expect(promise2).not.toBe(dfd.promise);
      });

      describe('resolve', function () {
        // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
        //          Promise Resolution Procedure [[Resolve]](promise2, x).
        describe('on onFulfilled/onReject call', function () {
          it('returned promise2 should be resolved once onFullfilled handler returns a value', function () {
            var dfd = new Deferred();
            var x = {};
            var onFulfill = function () {
              return x;
            };

            var promise2 = dfd.promise.then(onFulfill);
            var handler = jasmine.createSpy();

            promise2.done(handler);

            expect(promise2.isPending()).toBe(true);

            dfd.resolve('foo');

            expect(promise2.isResolved()).toBe(true);
            expect(handler.calls.count()).toBe(1);
            expect(handler.calls.argsFor(0)[0]).toBe(x);
          });

          it('returned promise2 should be resolved once onRejected handler returns a value', function () {
            var dfd = new Deferred();
            var x = {};
            var onReject = function () {
              return x;
            };

            var promise2 = dfd.promise.then(null, onReject);
            var handler = jasmine.createSpy();

            promise2.done(handler);

            expect(promise2.isPending()).toBe(true);

            dfd.reject('foo');

            expect(promise2.isResolved()).toBe(true);
            expect(handler.calls.count()).toBe(1);
            expect(handler.calls.argsFor(0)[0]).toBe(x);
          });
        });

        // 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled,
        //          promise2 must be fulfilled with the same value.
        it('returned promise2 should be resolved if promise1 is already resolved and no onFulfilled passed to then', function () {
          var dfd = new Deferred();
          var value = {};
          var handler = jasmine.createSpy();

          dfd.resolve(value);

          var promise2 = dfd.promise.then(null, function () {});

          promise2.done(handler);

          expect(handler.calls.count(0)).toBe(1);
          expect(handler.calls.argsFor(0)[0]).toBe(value);
        });
      });

      describe('reject', function () {
        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
        //          promise2 must be rejected with e as the reason.
        describe('on exception', function () {
          it('promise2 should be rejected once onFulfill handler throws an exception', function () {
            var dfd = new Deferred();
            var e = new TypeError('error');
            var handler = jasmine.createSpy('');

            var promise2 = dfd.promise.then(function () {
              throw e;
            });

            promise2.fail(handler);

            expect(promise2.isPending()).toBe(true);

            dfd.resolve();

            expect(handler.calls.count()).toBe(1);
            expect(handler.calls.argsFor(0)[0]).toBe(e);
          });

          it('promise2 should be rejected once onRejected handler throws an exception', function () {
            var dfd = new Deferred();
            var e = new TypeError('error');
            var handler = jasmine.createSpy();

            var promise2 = dfd.promise.then(null, function () {
              throw e;
            });

            promise2.fail(handler);

            expect(promise2.isPending()).toBe(true);

            dfd.reject();

            expect(handler.calls.count()).toBe(1);
            expect(handler.calls.argsFor(0)[0]).toBe(e);
          });
        });

        // 2.2.7.4. If onReject is not a function and promise1 is rejected,
        //          promise2 must be rejected with the same reason.
        it('returned promise2 should be rejected if promise1 is already rejected and no onRejected passed to then', function () {
          var dfd = new Deferred();
          var onFail = jasmine.createSpy();
          var reason = {};

          dfd.reject(reason);

          var promise2 = dfd.promise.then(function () {}, 'bar');

          promise2.fail(onFail);

          expect(promise2.isRejected()).toBe(true);
          expect(onFail.calls.count()).toBe(1);
          expect(onFail.calls.argsFor(0)[0]).toBe(reason);
        });
      });
    });
  });

  describe('catch', function () {
    it('should call `then` method with null as a first parameter and given handler as a second parameter', function () {
      var dfd = new Deferred();
      var promise2 = {};
      var onReject = function () {};

      spyOn(dfd.promise, 'then').and.returnValue(promise2);

      expect(dfd.promise.catch(onReject)).toBe(promise2);
      expect(dfd.promise.then).toHaveBeenCalledWith(null, onReject, undefined);
    });

    it('should support context for the handler', function () {
      var dfd = new Deferred();
      var promise2 = {};
      var onReject = function () {};
      var ctx = {};

      spyOn(dfd.promise, 'then');

      dfd.promise.catch(onReject, ctx);
      expect(dfd.promise.then).toHaveBeenCalledWith(null, onReject, ctx);
    });
  });

  /**
   * The Promise Resolution Procedure
   * http://promises-aplus.github.io/promises-spec/
   *
   * The promise resolution procedure is an abstract operation taking as input a promise and a value,
   * which we denote as [[Resolve]](promise, x). If x is a thenable, it attempts to make promise adopt
   * the state of x, under the assumption that x behaves at least somewhat like a promise.
   * Otherwise, it fulfills promise with the value x.
   *
   * This treatment of thenables allows promise implementations to interoperate, as long as they expose
   * a Promises/A+-compliant then method. It also allows Promises/A+ implementations
   * to “assimilate” nonconformant implementations with reasonable then methods.
   *
   * To run [[Resolve]](promise, x), perform the following steps:
   *
   * 2.3.1   If promise and x refer to the same object, reject promise with a TypeError as the reason.
   * 2.3.2   If x is a promise, adopt its state 3.4:
   *   2.3.2.1   If x is pending, promise must remain pending until x is fulfilled or rejected.
   *   2.3.2.2   If/when x is fulfilled, fulfill promise with the same value.
   *   2.3.2.3   If/when x is rejected, reject promise with the same reason.
   * 2.3.3.  Otherwise, if x is an object or function,
   *   2.3.3.1   Let then be x.then.
   *             (3.5 This procedure of first storing a reference to x.then, then testing that reference,
   *             and then calling that reference, avoids multiple accesses to the x.then property.
   *             Such precautions are important for ensuring consistency in the face of an accessor property,
   *             whose value could change between retrievals)
   *   2.3.3.2   If retrieving the property x.then results in a thrown exception e,
   *             reject promise with e as the reason.
   *   2.3.3.3   If then is a function, call it with x as this, first argument resolvePromise,
   *             and second argument rejectPromise, where:
   *     2.3.3.3.1   If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
   *     2.3.3.3.2   If/when rejectPromise is called with a reason r, reject promise with r.
   *     2.3.3.3.3   If both resolvePromise and rejectPromise are called, or multiple calls
   *                   to the same argument are made, the first call takes precedence,
   *                   and any further calls are ignored.
   *     2.3.3.3.4   If calling then throws an exception e,
   *       2.3.3.3.4.1   If resolvePromise or rejectPromise have been called, ignore it.
   *       2.3.3.3.4.2   Otherwise, reject promise with e as the reason.
   *   2.3.3.4   If then is not a function, fulfill promise with x.
   * 2.3.4   If x is not an object or function, fulfill promise with x.
   *
   * If a promise is resolved with a thenable that participates in a circular thenable chain,
   * such that the recursive nature of [[Resolve]](promise, thenable) eventually
   * causes [[Resolve]](promise, thenable) to be called again, following the above algorithm
   * will lead to infinite recursion. Implementations are encouraged, but not required,
   * to detect such recursion and reject promise with an informative TypeError as the reason.
   */

  describe('resolve', function () {
    // 2.3.1   If promise and x refer to the same object, reject promise with a TypeError as the reason.
    it('promise should be rejected with TypeError as a reason on attempt to resolve it with itself', function () {
      var dfdA = new Deferred();
      var dfdB = new Deferred();

      dfdA.resolve(dfdA.promise);
      dfdB.resolve(dfdB.promise);

      expect(dfdA.promise.isRejected()).toBe(true);
      expect(dfdA.promise.value instanceof TypeError).toBe(true);
      expect(dfdB.promise.isRejected()).toBe(true);
      expect(dfdB.promise.value instanceof TypeError).toBe(true);
    });

    // 2.3.2. If x is a promise, adopt its state 3.4:
    describe('with promise', function () {
      describe('pending', function () {
        // 2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
        it('promise should remain pending until passed promise is resolved', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();
          var value = {};

          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isPending()).toBe(true);

          dfdB.resolve(value);

          expect(dfdA.promise.isResolved()).toBe(true);
          expect(dfdA.promise.value).toBe(value);
        });

        it('promise should remain pending until passed promise is rejected', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();
          var reason = {};

          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isPending()).toBe(true);

          dfdB.reject(reason);

          expect(dfdA.promise.isRejected()).toBe(true);
          expect(dfdA.promise.value).toBe(reason);
        });

        it('promise should be locked until passed promise is settled', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();

          dfdA.resolve(dfdB.promise);

          dfdA.resolve(1);
          dfdA.reject(2);

          expect(dfdA.promise.isPending()).toBe(true);

          dfdB.resolve(3);

          expect(dfdA.promise.isResolved()).toBe(true);
          expect(dfdA.promise.value).toBe(3);
        });
      });

      // 2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
      describe('fulfilled', function () {
        it('promise should be resolved when passed promise is fulfilled', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();

          var handler = jasmine.createSpy();
          var value = {};

          dfdA.promise.done(handler);

          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isPending()).toBe(true);

          dfdB.resolve(value);

          expect(dfdA.promise.isResolved()).toBe(true);
          expect(handler.calls.count()).toBe(1);
          expect(handler.calls.argsFor(0)[0]).toBe(value);
        });

        it('promise should be resolved if passed promise is fulfilled', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();

          var handler = jasmine.createSpy();
          var value = {};

          dfdA.promise.done(handler);

          dfdB.resolve(value);
          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isResolved()).toBe(true);
          expect(handler.calls.count()).toBe(1);
          expect(handler.calls.argsFor(0)[0]).toBe(value);
        });
      });

      // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
      describe('rejected', function () {
        it('promise should be rejected when passed promise is rejected', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();

          var handler = jasmine.createSpy();
          var reason = {};

          dfdA.promise.fail(handler);

          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isPending()).toBe(true);

          dfdB.reject(reason);

          expect(dfdA.promise.isRejected()).toBe(true);
          expect(handler.calls.count()).toBe(1);
          expect(handler.calls.argsFor(0)[0]).toBe(reason);
        });

        it('promise should be rejected if passed promise is rejected', function () {
          var dfdA = new Deferred();
          var dfdB = new Deferred();

          var handler = jasmine.createSpy();
          var reason = {};

          dfdA.promise.fail(handler);

          dfdB.reject(reason);
          dfdA.resolve(dfdB.promise);

          expect(dfdA.promise.isRejected()).toBe(true);
          expect(handler.calls.count()).toBe(1);
          expect(handler.calls.argsFor(0)[0]).toBe(reason);
        });
      });
    });

    // 2.3.3. Otherwise, if x is an object or function,
    // 2.3.3.2. If retrieving the property x.then results in a thrown exception e,
    //          reject promise with e as the reason.
    // 2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise,
    // and second argument rejectPromise, where:
    // NOTE: "thenable" objects is absolute shit. Use native Promise and polyfill if you need this
    describe('with value', function () {
      // 2.3.4. If x is not an object or function, fulfill promise with x.
      it('should be resolved with passed value', function () {
        var dfd = new Deferred();

        dfd.resolve('foo');

        expect(dfd.promise.isResolved()).toBe(true);
        expect(dfd.promise.value).toBe('foo');
      });

      it('should use `thenable` objects as usual value', function () {
        var dfd = new Deferred();
        var value = {
          then: function () {}
        };

        dfd.resolve(value);

        expect(dfd.promise.isResolved()).toBe(true);
        expect(dfd.promise.value).toBe(value);
      });

      it('the rest arguments should be ignored', function () {
        var dfd = new Deferred();
        var handler = jasmine.createSpy();

        dfd.promise.done(handler);
        dfd.resolve('foo', 'bar');

        expect(dfd.promise.isResolved()).toBe(true);
        expect(dfd.promise.value).toBe('foo');
        expect(handler.calls.argsFor(0)).toEqual(['foo']);
      });
    });
  });

  /**
   * Reject
   * --------------------------------------------------------------------------
   */

  describe('reject', function () {
    it('should translate promise to rejected state', function () {
      var dfd = new Deferred();
      expect(dfd.promise.isPending()).toBe(true);
      dfd.reject();
      expect(dfd.promise.isRejected()).toBe(true);
    });

    it('should be ignored if promise is already rejected', function () {
      var dfd = new Deferred();

      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();

      dfd.promise.fail(handler1);
      dfd.reject('foo');
      dfd.promise.fail(handler2);
      dfd.reject('bar');

      expect(handler1.calls.count()).toBe(1);
      expect(handler1.calls.argsFor(0)[0]).toBe('foo');
      expect(handler2.calls.count()).toBe(1);
      expect(handler2.calls.argsFor(0)[0]).toBe('foo');
      expect(dfd.promise.value).toBe('foo');
    });

    it('should be ignored if promise is already resolved', function () {
      var dfd = new Deferred();
      var handler = jasmine.createSpy();

      dfd.resolve('foo');
      dfd.promise.fail(handler);
      dfd.reject('bar');

      expect(dfd.promise.isResolved()).toBe(true);
      expect(handler.calls.count()).toBe(0);
      expect(dfd.promise.value).toBe('foo');
    });

    it('should set reject reason as promise value', function () {
      var dfd = new Deferred();

      dfd.reject('foo');
      dfd.reject('another reason');

      expect(dfd.promise.value).toBe('foo');
    });

    it('should ignore the rest arguments passed to reject', function () {
      var dfd = new Deferred();
      var handler = jasmine.createSpy();

      dfd.promise.fail(handler);
      dfd.reject('foo', 'bar');

      expect(dfd.promise.value).toBe('foo');
      expect(handler.calls.argsFor(0)).toEqual(['foo']);
    });
  });

  /**
   * API
   * --------------------------------------------------------------------------
   */

  describe('API', function () {
    it('isPending', function () {
      var dfd = new Deferred();
      expect(dfd.promise.isPending()).toBe(true);
      dfd.resolve();
      expect(dfd.promise.isPending()).toBe(false);

      // @TODO test locked
    });

    it('isRejected', function () {
      var dfd = new Deferred();
      expect(dfd.promise.isRejected()).toBe(false);
      dfd.reject();
      expect(dfd.promise.isRejected()).toBe(true);
    });

    it('isResolved', function () {
      var dfd = new Deferred();
      expect(dfd.promise.isResolved()).toBe(false);
      dfd.resolve();
      expect(dfd.promise.isResolved()).toBe(true);
    });

    it('isDeferred', function () {
      var dfd = new Deferred();
      expect(Deferred.isDeferred(dfd)).toBe(true);
      expect(Deferred.isDeferred(dfd.promise)).toBe(false);
    });

    it('isPromise', function () {
      var dfd = new Deferred();
      expect(Deferred.isPromise(dfd)).toBe(false);
      expect(Deferred.isPromise(dfd.promise)).toBe(true);
      expect(Deferred.isPromise({})).toBe(false);
      expect(Deferred.isPromise(undefined)).toBe(false);
      expect(Deferred.isPromise({
        then: function () {}
      })).toBe(false);
    });

    describe('valueOf', function () {
      it('should return promise itself', function () {
        var dfd = new Deferred();
        expect(dfd.promise.valueOf()).toBe(dfd.promise);
      });
    });
  });
});
