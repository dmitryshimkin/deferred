describe('Deferred', function () {
  'use strict';

//  var __log = [];
  var data = {
    foo: 'bar'
  };
  var d;

  beforeEach(function () {
//    __log = [];
    d = new Deferred();
  });

  // constructor

  describe('Constructor', function () {
    it('should exist', function () {
      expect(window.Deferred).toBeDefined();
    });

    it('should return instance of Deferred', function () {
      expect(d instanceof Deferred).toBe(true);
    });
  });

  // done

  describe('done', function () {
    it('handler should be called once promise is resolved', function (done) {
      var handler = jasmine.createSpy();

      d.promise.done(handler);

      setTimeout(function () {
        d.resolve();
        expect(handler).toHaveBeenCalled();
        expect(handler.calls.mostRecent().object).toBe(d.promise);
        done();
      }, 20);
    });

    it('handler should be called with promise value as a first argument', function (done) {
      var handler = jasmine.createSpy();
      var value = {};

      d.promise.done(handler);

      setTimeout(function () {
        d.resolve(value);
        expect(handler.calls.argsFor(0)).toEqual([value]);
        done();
      }, 20);
    });

    it('handler should be called in specified context', function (done) {
      var handler = jasmine.createSpy();
      var ctx = {};

      d.promise
        .done(handler, ctx)
        .done(handler, null);

      setTimeout(function () {
        d.resolve();
        expect(handler.calls.all()[0].object).toBe(ctx);
        //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
        done();
      }, 30);
    });

    it('should return the same promise', function () {
      expect(d.promise.done()).toBe(d.promise);
    });

    it('should support multiple handlers', function (done) {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise
        .done(handler1)
        .done(handler2)
        .done(handler3);

      setTimeout(function () {
        d.resolve();
        expect(handler1.calls.count()).toBe(1);
        expect(handler2.calls.count()).toBe(1);
        expect(handler3.calls.count()).toBe(1);
        done();
      }, 20);
    });

    xit('should call handlers in order they were added', function () {

    });

    it('should call handlers synchronously', function () {
      var spy = jasmine.createSpy();

      d.promise.done(spy);
      d.resolve();

      expect(spy).toHaveBeenCalled();
    });

    it('should call handler synchronously if promise is already resolved', function () {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise.done(handler1);

      d.resolve();

      d.promise
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
      var d2 = new Deferred();

      d.promise.done(d2);
      d.resolve(data);

      expect(d2.promise.isResolved()).toBe(true);
      expect(d2.promise.value).toEqual(data);
    });
  });

  // fail

  describe('fail', function () {
    it('handler should be called once promise is rejected', function (done) {
      var handler = jasmine.createSpy();

      d.promise.fail(handler);

      setTimeout(function () {
        d.reject();
        expect(handler).toHaveBeenCalled();
        expect(handler.calls.mostRecent().object).toBe(d.promise);
        done();
      }, 20);
    });

    it('handler should be called with promise reject reason as a first argument', function (done) {
      var handler = jasmine.createSpy();
      var reason = {};

      d.promise.fail(handler);

      setTimeout(function () {
        d.reject(reason);
        expect(handler.calls.argsFor(0)).toEqual([reason]);
        done();
      }, 20);
    });

    it('handler should be called in specified context', function (done) {
      var handler = jasmine.createSpy();
      var obj = {};

      d.promise
        .fail(handler, obj)
        .fail(handler, null);

      setTimeout(function () {
        d.reject();
        expect(handler.calls.all()[0].object).toBe(obj);
        //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
        done();
      }, 30);
    });

    it('should return the same promise', function () {
      expect(d.promise.fail()).toBe(d.promise);
    });

    it('should support multiple handlers', function (done) {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise
        .fail(handler1)
        .fail(handler2)
        .fail(handler3);

      setTimeout(function () {
        d.reject();
        expect(handler1.calls.count()).toBe(1);
        expect(handler2.calls.count()).toBe(1);
        expect(handler3.calls.count()).toBe(1);
        done();
      }, 20);
    });

    xit('should call handlers in order they were added', function () {

    });

    it('should call handlers synchronously', function () {
      var spy = jasmine.createSpy();

      d.promise.fail(spy);
      d.reject();

      expect(spy).toHaveBeenCalled();
    });

    it('should call handler synchronously if promise is already rejected', function () {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise.fail(handler1);

      d.reject();

      d.promise
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
      var d2 = new Deferred();

      d.promise.fail(d2);
      d.reject(data);

      expect(d2.promise.isRejected()).toBe(true);
      expect(d2.promise.value).toEqual(data);
    });
  });

  // always

  describe('always', function () {
    it('handler should be called once promise is resolved', function (done) {
      var handler = jasmine.createSpy();

      d.promise.always(handler);

      setTimeout(function () {
        d.resolve();
        expect(handler).toHaveBeenCalled();
        expect(handler.calls.mostRecent().object).toBe(d.promise);
        done();
      }, 30);
    });

    it('handler should be called once promise is rejected', function (done) {
      var handler = jasmine.createSpy();

      d.promise.always(handler);

      setTimeout(function () {
        d.reject();
        expect(handler).toHaveBeenCalled();
        expect(handler.calls.mostRecent().object).toBe(d.promise);
        done();
      }, 30);
    });

    it('handler should be called with promise value as a first argument', function (done) {
      var handler = jasmine.createSpy();
      var value = {};

      d.promise.always(handler);

      setTimeout(function () {
        d.resolve(value);
        expect(handler.calls.argsFor(0)).toEqual([value]);
        done();
      }, 20);
    });

    it('handler should be called with promise reject reason as a first argument', function (done) {
      var handler = jasmine.createSpy();
      var reason = {};

      d.promise.always(handler);

      setTimeout(function () {
        d.reject(reason);
        expect(handler.calls.argsFor(0)).toEqual([reason]);
        done();
      }, 20);
    });

    it('should return the same promise', function () {
      expect(d.promise.always()).toBe(d.promise);
    });

    it('handler should be called in specified context', function (done) {
      var handler = jasmine.createSpy();
      var obj = {};

      d.promise
        .always(handler, obj)
        .always(handler, null);

      setTimeout(function () {
        d.resolve();
        expect(handler.calls.all()[0].object).toBe(obj);
        //expect(handler.calls.all()[1].object).toBe(null); // jasmine bug?
        done();
      }, 30);
    });

    it('should support multiple handlers', function (done) {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise
        .always(handler1)
        .always(handler2)
        .always(handler3);

      setTimeout(function () {
        d.reject();
        expect(handler1.calls.count()).toBe(1);
        expect(handler2.calls.count()).toBe(1);
        expect(handler3.calls.count()).toBe(1);
        done();
      }, 20);
    });

    it('should call handler synchronously if promise is already resolved', function () {
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise.always(handler1);

      d.reject();

      d.promise
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
      var handler1 = jasmine.createSpy();
      var handler2 = jasmine.createSpy();
      var handler3 = jasmine.createSpy();

      d.promise.always(handler1);

      d.reject();

      d.promise
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
      var d2 = new Deferred();

      d.promise.always(d2);
      d.resolve(data);

      expect(d2.promise.isResolved()).toBe(true);
      expect(d2.promise.value).toEqual(data);
    });

    it('should reject passed deferred once promise is rejected', function () {
      var d2 = new Deferred();

      d.promise.always(d2);
      d.reject(data);

      expect(d2.promise.isRejected()).toBe(true);
      expect(d2.promise.value).toEqual(data);
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

//  describe('then', function () {
//    // 2.2.2. If onFulfilled is a function:
//    describe('onFulfilled is function', function () {
//      // 2.2.2.1. it must be called after promise is fulfilled, with promise’s value as its first argument.
//      // 2.2.1.2. If onReject is not a function, it must be ignored.
//      it('fulfill', function () {
//        var onFulfill = jasmine.createSpy('fulfill');
//
//        d.promise.then(onFulfill);
//        d.resolve(data);
//
//        expect(onFulfill).toHaveBeenCalledWith(data);
//      });
//
//      // 2.2.2.3. it must not be called more than once.
//      it('once', function () {
//        var onFulfill = jasmine.createSpy('fulfill');
//
//        d.promise.then(onFulfill);
//        d.resolve('foo').resolve(true);
//
//        expect(onFulfill).toHaveBeenCalledWith('foo');
//        expect(onFulfill.calls.count()).toBe(1);
//      });
//
//      // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
//      it('async', function () {
//        //
//      });
//
//      // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
//      // This is shit. Context must be a promise or custom one
//      describe('context', function () {
//        it('promise', function () {
//          var onResolved = function () {
//            self = this;
//          };
//          var self;
//
//          d.promise.then(onResolved);
//          d.resolve();
//
//          expect(self).toBe(d.promise);
//        });
//
//        it('custom', function () {
//          var onFulfill = function () {
//            self = this;
//          };
//          var context = {};
//          var self;
//
//          d.promise.then(onFulfill, undefined, context);
//          d.resolve('foo');
//
//          expect(self).toBe(context);
//        });
//      });
//
//      // 2.2.6. then may be called multiple times on the same promise
//      // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
//      //          in the order of their originating calls to then.
//      it('multiple invocations', function () {
//        var log = [];
//
//        var onFulfill1 = function () {
//          log.push(1);
//        };
//        var onFulfill2 = function () {
//          log.push(2);
//        };
//        var onFulfill3 = function () {
//          log.push(3);
//        };
//
//        d.promise.then(onFulfill1);
//        d.promise.then(onFulfill2);
//
//        d.resolve('foo');
//
//        d.promise.then(onFulfill3);
//
//        expect(log.length).toBe(3);
//        expect(log.join('')).toBe('123');
//      });
//    });
//
//    // 2.2.3. If onReject is a function
//    describe('onReject', function () {
//      // 2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
//      it('fulfill', function () {
//        var onReject = jasmine.createSpy('reject');
//
//        d.promise.then(function () {}, onReject);
//        d.reject(null);
//
//        expect(onReject).toHaveBeenCalledWith(null);
//      });
//
//      // 2.2.3.3. it must not be called more than once.
//      // 2.2.1.1. If onFulfilled is not a function, it must be ignored.
//      it('once', function () {
//        var onReject = jasmine.createSpy('reject');
//
//        d.promise.then(undefined, onReject);
//        d.reject(data).reject(true);
//
//        expect(onReject).toHaveBeenCalledWith(data);
//        expect(onReject.calls.count()).toBe(1);
//      });
//
//      // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
//      it('async', function () {
//        //
//      });
//
//      // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
//      // This is a piece of shit. Context must be a promise itself of custom one
//      describe('context', function () {
//        it('promise', function () {
//          var onReject = function () {
//            self = this;
//          };
//          var self;
//
//          d.promise.then('', onReject);
//          d.reject();
//
//          expect(self).toBe(d.promise);
//        });
//
//        it('custom', function () {
//          var onReject = function () {
//            self = this;
//          };
//          var context = {};
//          var self;
//
//          d.promise.then(function () {}, onReject, context);
//          d.reject();
//
//          expect(self).toBe(context);
//        });
//      });
//
//      // 2.2.6. then may be called multiple times on the same promise
//      // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
//      //          in the order of their originating calls to then.
//      it('multiple invocations', function () {
//        var log = [];
//
//        var onReject1 = function () {
//          log.push(1);
//        };
//        var onReject2 = function () {
//          log.push(2);
//        };
//        var onReject3 = function () {
//          log.push(3);
//        };
//
//        d.promise.then('', onReject1);
//        d.promise.then('', onReject2);
//
//        d.reject();
//
//        d.promise.then('', onReject3);
//
//        expect(log.length).toBe(3);
//        expect(log.join('')).toBe('123');
//      });
//    });
//
//    // 2.2.7. then must return a promise 3.3.
//    describe('return', function () {
//      it('promise', function () {
//        var promise2 = d.promise.then();
//
//        expect(Deferred.isPromise(promise2)).toBe(true);
//        expect(Deferred.isDeferred(promise2)).toBe(false);
//        expect(promise2).not.toBe(d.promise);
//      });
//
//      describe('resolve', function () {
//        // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
//        //          Promise Resolution Procedure [[Resolve]](promise2, x).
//        describe('on onFulfilled/onReject call', function () {
//          it('onFulfill', function () {
//            var onFulfill = function () {
//              return 'bar';
//            };
//            var promise2 = d.promise.then(onFulfill);
//            var spy = jasmine.createSpy();
//
//            promise2.done(spy);
//
//            expect(promise2.isPending()).toBe(true);
//
//            d.resolve('foo');
//
//            expect(spy).toHaveBeenCalledWith('bar');
//          });
//
//          it('onReject', function () {
//            var onReject = function () {
//              return 'bar';
//            };
//            var promise2 = d.promise.then('', onReject);
//            var spy = jasmine.createSpy();
//
//            promise2.done(spy);
//
//            expect(promise2.isPending()).toBe(true);
//
//            d.reject('foo');
//
//            expect(spy).toHaveBeenCalledWith('bar');
//          });
//        });
//
//        // 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled,
//        //          promise2 must be fulfilled with the same value.
//        it('no onFulfilled and promise is resolved', function () {
//          var spy = jasmine.createSpy('done-spy');
//
//          d.resolve(data);
//
//          var promise2 = d.promise.then('', function () {});
//
//          promise2.done(spy);
//
//          expect(spy).toHaveBeenCalledWith(data);
//        });
//      });
//
//      describe('reject', function () {
//        // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
//        //          promise2 must be rejected with e as the reason.
//        describe('on exception', function () {
//          it('onFulfill', function () {
//            var e = new TypeError('error');
//            var spy = jasmine.createSpy('');
//
//            var promise2 = d.promise.then(function () {
//              throw e;
//            });
//
//            promise2.fail(spy);
//
//            expect(promise2.isPending()).toBe(true);
//
//            d.resolve();
//
//            expect(spy).toHaveBeenCalledWith(e);
//          });
//
//          it('onReject', function () {
//            var e = new TypeError('error');
//            var spy = jasmine.createSpy('fail-spy');
//
//            var promise2 = d.promise.then(undefined, function () {
//              throw e;
//            });
//
//            promise2.fail(spy);
//
//            expect(promise2.isPending()).toBe(true);
//
//            d.reject();
//
//            expect(spy).toHaveBeenCalledWith(e);
//          });
//        });
//
//        // 2.2.7.4. If onReject is not a function and promise1 is rejected,
//        //          promise2 must be rejected with the same reason.
//        it('no onReject and promise is rejected', function () {
//          var spy = jasmine.createSpy('fail-spy');
//
//          d.reject('foo');
//
//          var promise2 = d.promise.then(function () {}, 'bar');
//
//          promise2.fail(spy);
//
//          expect(spy).toHaveBeenCalledWith('foo');
//        });
//      });
//    });
//  });
//
//  /**
//   * The Promise Resolution Procedure
//   * http://promises-aplus.github.io/promises-spec/
//   *
//   * The promise resolution procedure is an abstract operation taking as input a promise and a value,
//   * which we denote as [[Resolve]](promise, x). If x is a thenable, it attempts to make promise adopt
//   * the state of x, under the assumption that x behaves at least somewhat like a promise.
//   * Otherwise, it fulfills promise with the value x.
//   *
//   * This treatment of thenables allows promise implementations to interoperate, as long as they expose
//   * a Promises/A+-compliant then method. It also allows Promises/A+ implementations
//   * to “assimilate” nonconformant implementations with reasonable then methods.
//   *
//   * To run [[Resolve]](promise, x), perform the following steps:
//   *
//   * 2.3.1   If promise and x refer to the same object, reject promise with a TypeError as the reason.
//   *   2.3.2   If x is a promise, adopt its state 3.4:
//   *     2.3.2.1   If x is pending, promise must remain pending until x is fulfilled or rejected.
//   *     2.3.2.2   If/when x is fulfilled, fulfill promise with the same value.
//   *     2.3.2.3   If/when x is rejected, reject promise with the same reason.
//   *   2.3.3.  Otherwise, if x is an object or function,
//   *     2.3.3.1   Let then be x.then.
//   *               (3.5 This procedure of first storing a reference to x.then, then testing that reference,
//   *               and then calling that reference, avoids multiple accesses to the x.then property.
//   *               Such precautions are important for ensuring consistency in the face of an accessor property,
//   *               whose value could change between retrievals)
//   *     2.3.3.2   If retrieving the property x.then results in a thrown exception e,
//   *               reject promise with e as the reason.
//   *     2.3.3.3   If then is a function, call it with x as this, first argument resolvePromise,
//   *               and second argument rejectPromise, where:
//   *       2.3.3.3.1   If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
//   *       2.3.3.3.2   If/when rejectPromise is called with a reason r, reject promise with r.
//   *       2.3.3.3.3   If both resolvePromise and rejectPromise are called, or multiple calls
//   *                   to the same argument are made, the first call takes precedence,
//   *                   and any further calls are ignored.
//   *       2.3.3.3.4   If calling then throws an exception e,
//   *         2.3.3.3.4.1   If resolvePromise or rejectPromise have been called, ignore it.
//   *         2.3.3.3.4.2   Otherwise, reject promise with e as the reason.
//   *   2.3.3.4   If then is not a function, fulfill promise with x.
//   * 2.3.4   If x is not an object or function, fulfill promise with x.
//   *
//   * If a promise is resolved with a thenable that participates in a circular thenable chain,
//   * such that the recursive nature of [[Resolve]](promise, thenable) eventually
//   * causes [[Resolve]](promise, thenable) to be called again, following the above algorithm
//   * will lead to infinite recursion. Implementations are encouraged, but not required,
//   * to detect such recursion and reject promise with an informative TypeError as the reason.
//   */
//
//  describe('resolve', function () {
//    // @TODO: move from this describe
//    it('isResolved', function () {
//      expect(d.promise.isPending()).toBe(true);
//      d.resolve();
//      expect(d.promise.isResolved()).toBe(true);
//    });
//
//    it('already resolved', function () {
//      var spy1 = jasmine.createSpy('done1');
//      var spy2 = jasmine.createSpy('done2');
//
//      d.promise.done(spy1);
//      d.resolve();
//      d.promise.done(spy2);
//      d.resolve();
//
//      expect(spy1).toHaveBeenCalled();
//      expect(spy1.calls.count()).toBe(1);
//
//      expect(spy2).toHaveBeenCalled();
//      expect(spy2.calls.count()).toBe(1);
//    });
//
//    it('already rejected', function () {
//      var spy1 = jasmine.createSpy('done1');
//      var spy2 = jasmine.createSpy('done2');
//
//      d.promise.done(spy1);
//      d.reject();
//      d.promise.done(spy2);
//      d.resolve();
//
//      expect(spy1).not.toHaveBeenCalled();
//      expect(spy2).not.toHaveBeenCalled();
//    });
//
//    // 2.3.2. If x is a promise, adopt its state 3.4:
//    describe('with promise', function () {
//      // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
//      it('the same', function () {
//        var x = d.promise;
//        var reason;
//
//        d.promise.fail(function () {
//          reason = arguments[0];
//        });
//
//        d.resolve(x);
//
//        expect(reason instanceof TypeError).toBe(true);
//      });
//
//      // 2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
//      it('fulfilled', function () {
//        var x = new Deferred();
//        var spy = jasmine.createSpy('done-spy');
//
//        d.promise.done(spy);
//
//        x.resolve('foo');
//        d.resolve(x.promise);
//
//        expect(spy).toHaveBeenCalledWith('foo');
//      });
//
//      // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
//      it('rejected', function () {
//        var x = new Deferred();
//        var spy = jasmine.createSpy('fail-spy');
//
//        d.promise.fail(spy);
//
//        x.reject(data);
//        d.resolve(x.promise);
//
//        expect(spy).toHaveBeenCalledWith(data);
//      });
//
//      // 2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
//      describe('pending', function () {
//        // 2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
//        it('fulfill', function (done) {
//          var x = new Deferred();
//          var spy = jasmine.createSpy('done-spy');
//          var isPending;
//
//          d.promise.done(spy);
//          d.resolve(x);
//
//          isPending = d.promise.isPending();
//
//          setTimeout(function () {
//            x.resolve('foo');
//
//            expect(isPending).toBe(true);
//            expect(spy).toHaveBeenCalledWith('foo');
//
//            done();
//          }, 20);
//        });
//
//        // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
//        it('reject', function (done) {
//          var x = new Deferred();
//          var spy = jasmine.createSpy('fail-spy');
//          var isPending;
//
//          d.promise.fail(spy);
//          d.resolve(x);
//
//          isPending = d.promise.isPending();
//
//          setTimeout(function () {
//            x.reject('bar');
//
//            expect(isPending).toBe(true);
//            expect(spy).toHaveBeenCalledWith('bar');
//
//            done();
//          }, 20);
//        });
//      });
//    });
//
//    // 2.3.3. Otherwise, if x is an object or function,
//    describe('with object', function () {
//      // 2.3.3.2. If retrieving the property x.then results in a thrown exception e,
//      //          reject promise with e as the reason.
//      it('exception', function () {
//        var x = {};
//        var spy = jasmine.createSpy('fail-spy');
//        var e = new TypeError();
//
//        x.__defineGetter__('then', function () {
//          throw e;
//        });
//
//        d.promise.fail(spy);
//        d.resolve(x);
//
//        expect(spy).toHaveBeenCalledWith(e);
//      });
//
//      // 2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise,
//      // and second argument rejectPromise, where:
//      describe('has method then', function () {
//        // 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
//        it('resolvePromise called', function (done) {
//          var isPending;
//          var spy = jasmine.createSpy('done-spy');
//          var x = {
//            then: function (resolvePromise, rejectPromise) {
//              setTimeout(function () {
//                resolvePromise('foo');
//
//                expect(isPending).toBe(true);
//                expect(spy).toHaveBeenCalledWith('foo');
//
//                done();
//              }, 20);
//            }
//          };
//
//          d.promise.done(spy);
//          d.resolve(x);
//          isPending = d.promise.isPending();
//        });
//
//        // 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
//        it('rejectPromise called', function (done) {
//          var isPending;
//          var spy = jasmine.createSpy('fail-spy');
//          var x = {
//            then: function (resolvePromise, rejectPromise) {
//              setTimeout(function () {
//                rejectPromise('bar');
//
//                expect(isPending).toBe(true);
//                expect(spy).toHaveBeenCalledWith('bar');
//
//                done();
//              }, 20);
//            }
//          };
//
//          d.promise.fail(spy);
//          d.resolve(x);
//          isPending = d.promise.isPending();
//        });
//
//        // 2.3.3.3.3. If both resolvePromise and rejectPromise are called, or multiple calls
//        //            to the same argument are made, the first call takes precedence,
//        //            and any further calls are ignored.
//        it('both called', function (done) {
//          var isPending;
//          var doneSpy = jasmine.createSpy('done-spy');
//          var failSpy = jasmine.createSpy('fail-spy');
//          var x = {
//            then: function (resolvePromise, rejectPromise) {
//              setTimeout(function () {
//                resolvePromise('foo');
//                rejectPromise('bar');
//
//                expect(isPending).toBe(true);
//                expect(doneSpy).toHaveBeenCalledWith('foo');
//                expect(failSpy).not.toHaveBeenCalled();
//
//                done();
//              }, 20);
//            }
//          };
//
//          d.promise
//            .done(doneSpy)
//            .fail(failSpy);
//          d.resolve(x);
//          isPending = d.promise.isPending();
//        });
//
//        // 2.3.3.3.4. If calling then throws an exception e,
//        describe('exception thrown', function () {
//          //2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it.
//          it('after resolvePromise', function () {
//            var done = false;
//            var spy = jasmine.createSpy('done-spy');
//            var x = {
//              then: function (resolvePromise, rejectPromise) {
//                resolvePromise(null);
//                throw new Error();
//              }
//            };
//
//            d.promise.done(spy);
//            d.resolve(x);
//
//            expect(spy).toHaveBeenCalledWith(null);
//          });
//
//          //2.3.3.3.4.1   If resolvePromise or rejectPromise have been called, ignore it.
//          it('after rejectPromise', function () {
//            var done = false;
//            var spy = jasmine.createSpy('fail-spy');
//            var x = {
//              then: function (resolvePromise, rejectPromise) {
//                rejectPromise(null);
//                throw new Error();
//              }
//            };
//
//            d.promise.fail(spy);
//            d.resolve(x);
//
//            expect(spy).toHaveBeenCalledWith(null);
//          });
//
//          // 2.3.3.3.4.2. Otherwise, reject promise with e as the reason.
//          it('before resolvePromise/rejectPromise', function () {
//            var done = false;
//            var spy = jasmine.createSpy('fail-spy');
//            var e = new Error();
//            var x = {
//              then: function () {
//                throw e;
//              }
//            };
//
//            d.promise.fail(spy);
//            d.resolve(x);
//
//            expect(spy).toHaveBeenCalledWith(e);
//          });
//        });
//      });
//
//      // 2.3.3.4. If then is not a function, fulfill promise with x.
//      it('no then', function () {
//        var x = {
//          then: {}
//        };
//
//        var spy = jasmine.createSpy('done-spy');
//
//        d.promise.done(spy);
//        d.resolve(x);
//
//        expect(spy).toHaveBeenCalledWith(x);
//      });
//    });
//
//    // 2.3.4. If x is not an object or function, fulfill promise with x.
//    it('with value', function () {
//      var d = new Deferred();
//      var x = 'foo';
//      var spy = jasmine.createSpy('done-spy');
//
//      d.promise.done(spy);
//      d.resolve(x);
//
//      expect(spy).toHaveBeenCalledWith('foo');
//    });
//  });
//
//  // reject
//
//  describe('reject', function () {
//    it('isRejected', function () {
//      expect(d.promise.isPending()).toBe(true);
//      d.reject();
//      expect(d.promise.isRejected()).toBe(true);
//    });
//
//    it('already rejected', function () {
//      var spy1 = jasmine.createSpy('fail1');
//      var spy2 = jasmine.createSpy('fail2');
//
//      d.promise.fail(spy1);
//      d.reject();
//      d.promise.fail(spy2);
//      d.reject();
//
//      expect(spy1).toHaveBeenCalled();
//      expect(spy1.calls.count()).toBe(1);
//
//      expect(spy2).toHaveBeenCalled();
//      expect(spy2.calls.count()).toBe(1);
//    });
//
//    it('already resolved', function () {
//      var spy1 = jasmine.createSpy('fail1');
//      var spy2 = jasmine.createSpy('fail2');
//
//      d.promise.fail(spy1);
//      d.resolve();
//      d.promise.fail(spy2);
//      d.reject();
//
//      expect(spy1).not.toHaveBeenCalled();
//      expect(spy2).not.toHaveBeenCalled();
//    });
//
//    it('value', function () {
//      var spy1 = jasmine.createSpy('fail1');
//      var spy2 = jasmine.createSpy('fail2');
//
//      d.promise.fail(spy1);
//      d.reject('bar');
//      d.reject('another reason');
//      d.promise.fail(spy2);
//
//      expect(spy1).toHaveBeenCalledWith('bar');
//      expect(spy2).toHaveBeenCalledWith('bar');
//    });
//  });

  // todo ignore all but first arguments passed to resolve/reject
  // todo done, fail and always - the same handler many times
});
