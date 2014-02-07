(function () {
  'use strict';

  var describe = window.describe;
  var expect = window.expect;
  var it = window.it;
  var beforeEach = window.beforeEach;

  // Deferred
  describe('Deferred', function () {
    var __log = [];
    var data = { foo: 'bar' };
    var d;

    beforeEach(function () {
      __log = [];
      d = new Deferred();
    });

    // constructor

    describe('constructor', function () {

      it('class', function () {
        expect(window.Deferred).toBeDefined();
      });

      it('instanceof', function () {
        expect(d instanceof Deferred).toBe(true);
      });

    });

    // done

    describe('done', function () {

      it('handler', function () {
        var spy = jasmine.createSpy('done');
        var resolved = false;
        var _this;

        d.done(function () {
          _this = this;
          spy();
        });

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
          expect(_this).toBe(d.promise);
        });
      });

      it ('handler with context', function () {
        var resolved = false;
        var _this1;
        var _this2;
        var obj = {
          fn: function () {
            _this1 = this;
          }
        };

        d
          .done(obj.fn, obj)
          .done(function () {
            _this2 = this;
          }, null);

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
          expect(_this1).toBe(obj);
          expect(_this2).toBe(null);
        });
      });

      it('many handlers', function () {
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
        var spy = jasmine.createSpy('done');

        d
          .done(spy)
          .resolve();

        expect(spy).toHaveBeenCalled();
      });

      it('resolved promise', function () {
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

      it('another deferred', function () {
        var d2 = new Deferred();

        d.done(d2);
        d.resolve('foo', data);

        expect(d2.isResolved()).toBe(true);
        expect(d2.promise.value).toEqual(['foo', data]);
      });
    });

    // fail

    describe('fail', function () {

      it('handler', function () {
        var spy = jasmine.createSpy('fail');
        var rejected = false;

        d.fail(spy);

        runs(function () {
          setTimeout(function () {
            d.reject();
            rejected = true;
          }, 30);
        });

        waitsFor(function () {
          return rejected;
        }, 'timeout', 100);

        runs(function () {
          expect(spy).toHaveBeenCalled();
        });
      });

      it ('handler with context', function () {
        var rejected = false;
        var ctx;
        var obj = {
          fn: function () {
            ctx = this;
          }
        };

        d.fail(obj.fn, obj);

        runs(function () {
          setTimeout(function () {
            d.reject();
            rejected = true;
          }, 30);
        });

        waitsFor(function () {
          return rejected;
        }, 'timeout', 100);

        runs(function () {
          expect(ctx).toBe(obj);
        });
      });

      it('many handlers', function () {
        var rejected = false;

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
          .fail(handler1)
          .fail(handler2)
          .fail(handler3);

        runs(function () {
          setTimeout(function () {
            d.reject();
            rejected = true;
          }, 30);
        });

        waitsFor(function () {
          return rejected;
        }, 'timeout', 100);

        runs(function () {
          expect(__log.length).toBe(3);
          expect(__log[0]).toBe(1);
          expect(__log[1]).toBe(2);
          expect(__log[2]).toBe(3);
        });
      });

      it('sync call', function () {
        var spy = jasmine.createSpy('fail');

        d
          .fail(spy)
          .reject();

        expect(spy).toHaveBeenCalled();
      });

      it('rejected promise', function () {
        var d = new Deferred();
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');
        var spy3 = jasmine.createSpy('fail3');

        d
          .fail(spy1)
          .reject()
          .fail(spy2)
          .fail(spy3);

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);

        expect(spy3).toHaveBeenCalled();
        expect(spy3.calls.length).toBe(1);
      });

      it('another deferred', function () {
        var d2 = new Deferred();

        d.fail(d2);
        d.reject('foo', data);

        expect(d2.isRejected()).toBe(true);
        expect(d2.promise.value).toEqual(['foo', data]);
      });
    });

    // always

    describe('always', function () {

      it('done', function () {
        var spy = jasmine.createSpy('done');
        var resolved = false;
        var _this;

        d.always(function () {
          _this = this;
          spy.apply(this, arguments);
        });

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
          expect(_this).toBe(d.promise);
        });
      });

      it('fail', function () {
        var spy = jasmine.createSpy('fail');
        var rejected = false;
        var ctx = {
          foo: 'bar'
        };
        var _this;

        d.always(function () {
          _this = this;
          spy.apply(this, arguments);
        }, ctx);

        runs(function () {
          setTimeout(function () {
            d.reject();
            rejected = true;
          }, 30);
        });

        waitsFor(function () {
          return rejected;
        }, 'timeout', 100);

        runs(function () {
          expect(spy).toHaveBeenCalled();
          expect(_this).toBe(ctx);
        });
      });

      it('many handlers', function () {
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
          .always(handler1)
          .always(handler2)
          .always(handler3);

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

      it('resolved promise', function () {
        var d = new Deferred();
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');
        var spy3 = jasmine.createSpy('fail3');

        d
          .always(spy1)
          .resolve()
          .always(spy2)
          .always(spy3);

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);

        expect(spy3).toHaveBeenCalled();
        expect(spy3.calls.length).toBe(1);
      });

      it('rejected promise', function () {
        var d = new Deferred();
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');
        var spy3 = jasmine.createSpy('fail3');

        d
          .always(spy1)
          .reject()
          .always(spy2)
          .always(spy3);

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);

        expect(spy3).toHaveBeenCalled();
        expect(spy3.calls.length).toBe(1);
      });

      it('another deferred (done)', function () {
        var d2 = new Deferred();

        d.always(d2);
        d.resolve('foo', data);

        expect(d2.isResolved()).toBe(true);
        expect(d2.promise.value).toEqual(['foo', data]);
      });

      it('another deferred (fail)', function () {
        var d2 = new Deferred();

        d.always(d2);
        d.reject('foo', data);

        expect(d2.isRejected()).toBe(true);
        expect(d2.promise.value).toEqual(['foo', data]);
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
      describe('onFulfilled is function', function () {

        // 2.2.2.1. it must be called after promise is fulfilled, with promise’s value as its first argument.
        // 2.2.1.2. If onReject is not a function, it must be ignored.
        it('fulfill', function () {
          var onFulfill = jasmine.createSpy('fulfill');

          d.then(onFulfill);
          d.resolve('foo', data);

          expect(onFulfill).toHaveBeenCalledWith('foo', data);
        });

        // 2.2.2.3. it must not be called more than once.
        it('once', function () {
          var onFulfill = jasmine.createSpy('fulfill');

          d.then(onFulfill);
          d.resolve('foo', data).resolve(true);

          expect(onFulfill).toHaveBeenCalledWith('foo', data);
          expect(onFulfill.calls.length).toBe(1);
        });

        // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
        it('async', function () {
          //
        });

        // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
        // This is shit. Context must be a promise or custom one
        describe('context', function () {
          it('promise', function () {
            var onResolved = function () {
              _this = this;
            };
            var _this;

            d.then(onResolved);
            d.resolve();

            expect(_this).toBe(d.promise);
          });

          it('custom', function () {
            var onFulfill = function () {
              _this = this;
            };
            var context = {};
            var _this;

            d.then(onFulfill, undefined, context);
            d.resolve('foo', data);

            expect(_this).toBe(context);
          });
        });

        // 2.2.6. then may be called multiple times on the same promise
        // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
        //          in the order of their originating calls to then.
        it('multiple invocations', function () {
          var log = [];

          var onFulfill1 = function () {
            log.push(1);
          };
          var onFulfill2 = function () {
            log.push(2);
          };
          var onFulfill3 = function () {
            log.push(3);
          };

          d.then(onFulfill1);
          d.then(onFulfill2);

          d.resolve('foo', data);

          d.then(onFulfill3);

          expect(log.length).toBe(3);
          expect(log.join('')).toBe('123');
        });
      });

      // 2.2.3. If onReject is a function
      describe('onReject', function () {

        // 2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
        it('fulfill', function () {
          var onReject = jasmine.createSpy('reject');

          d.then(function () {}, onReject);
          d.reject('foo', data);

          expect(onReject).toHaveBeenCalledWith('foo', data);
        });

        // 2.2.3.3. it must not be called more than once.
        // 2.2.1.1. If onFulfilled is not a function, it must be ignored.
        it('once', function () {
          var onReject = jasmine.createSpy('reject');

          d.then(undefined, onReject);
          d.reject('foo', data).reject(true);

          expect(onReject).toHaveBeenCalledWith('foo', data);
          expect(onReject.calls.length).toBe(1);
        });

        // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
        it('async', function () {
          //
        });

        // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
        // This is a piece of shit. Context must be a promise itself of custom one
        describe('context', function () {
          it('promise', function () {
            var onReject = function () {
              _this = this;
            };
            var _this;

            d.then('', onReject);
            d.reject();

            expect(_this).toBe(d.promise);
          });

          it('custom', function () {
            var onReject = function () {
              _this = this;
            };
            var context = {};
            var _this;

            d.then(function () {}, onReject, context);
            d.reject();

            expect(_this).toBe(context);
          });
        });

        // 2.2.6. then may be called multiple times on the same promise
        // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
        //          in the order of their originating calls to then.
        it('multiple invocations', function () {
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

          d.then('', onReject1);
          d.then('', onReject2);

          d.reject();

          d.then('', onReject3);

          expect(log.length).toBe(3);
          expect(log.join('')).toBe('123');
        });
      });

      // 2.2.7. then must return a promise 3.3.
      describe('return', function () {

        it('promise', function () {
          var promise2 = d.then();

          expect(Deferred.isPromise(promise2)).toBe(true);
          expect(Deferred.isDeferred(promise2)).toBe(false);
          expect(promise2).not.toBe(d.promise);
        });

        describe('resolve', function () {
          // 2.2.7.1. If either onFulfilled or onReject returns a value x, run the
          //          Promise Resolution Procedure [[Resolve]](promise2, x).
          describe('on onFulfilled/onReject call', function () {
            it('onFulfill', function () {
              var onFulfill = function () {
                return 'bar';
              };
              var promise2 = d.then(onFulfill);
              var spy = jasmine.createSpy();

              promise2.done(spy);

              expect(promise2.isPending()).toBe(true);

              d.resolve('foo');

              expect(spy).toHaveBeenCalledWith('bar');
            });

            it('onReject', function () {
              var onReject = function () {
                return 'bar';
              };
              var promise2 = d.then('', onReject);
              var spy = jasmine.createSpy();

              promise2.done(spy);

              expect(promise2.isPending()).toBe(true);

              d.reject('foo');

              expect(spy).toHaveBeenCalledWith('bar');
            });
          });

          // 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled,
          //          promise2 must be fulfilled with the same value.
          it('no onFulfilled and promise is resolved', function () {
            var spy = jasmine.createSpy('done');

            d.resolve('foo', data);

            var promise2 = d.then('', function () {});

            promise2.done(spy);

            expect(spy).toHaveBeenCalledWith('foo', data);
          });
        });

        describe('reject', function () {

          // 2.2.7.2. If either onFulfilled or onReject throws an exception e,
          //          promise2 must be rejected with e as the reason.
          describe('on exception', function () {

            it('onFulfill', function () {
              var e = new TypeError('error');
              var spy = jasmine.createSpy('');

              var promise2 = d.then(function () {
                throw e;
              });

              promise2.fail(spy);

              expect(promise2.isPending()).toBe(true);

              d.resolve();

              expect(spy).toHaveBeenCalledWith(e);
            });

            it('onReject', function () {
              var e = new TypeError('error');
              var spy = jasmine.createSpy('fail');

              var promise2 = d.then(undefined, function () {
                throw e;
              });

              promise2.fail(spy);

              expect(promise2.isPending()).toBe(true);

              d.reject();

              expect(spy).toHaveBeenCalledWith(e);
            });
          });

          // 2.2.7.4. If onReject is not a function and promise1 is rejected,
          //          promise2 must be rejected with the same reason.
          it('no onReject and promise is rejected', function () {
            var spy = jasmine.createSpy('fail');

            d.reject(data, 'foo');

            var promise2 = d.then(function () {}, 'bar');

            promise2.fail(spy);

            expect(spy).toHaveBeenCalledWith(data, 'foo');
          });
        });
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
     *   2.3.2   If x is a promise, adopt its state 3.4:
     *     2.3.2.1   If x is pending, promise must remain pending until x is fulfilled or rejected.
     *     2.3.2.2   If/when x is fulfilled, fulfill promise with the same value.
     *     2.3.2.3   If/when x is rejected, reject promise with the same reason.
     *   2.3.3.  Otherwise, if x is an object or function,
     *     2.3.3.1   Let then be x.then.
     *               (3.5 This procedure of first storing a reference to x.then, then testing that reference,
     *               and then calling that reference, avoids multiple accesses to the x.then property.
     *               Such precautions are important for ensuring consistency in the face of an accessor property,
     *               whose value could change between retrievals)
     *     2.3.3.2   If retrieving the property x.then results in a thrown exception e,
     *               reject promise with e as the reason.
     *     2.3.3.3   If then is a function, call it with x as this, first argument resolvePromise,
     *               and second argument rejectPromise, where:
     *       2.3.3.3.1   If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
     *       2.3.3.3.2   If/when rejectPromise is called with a reason r, reject promise with r.
     *       2.3.3.3.3   If both resolvePromise and rejectPromise are called, or multiple calls
     *                   to the same argument are made, the first call takes precedence,
     *                   and any further calls are ignored.
     *       2.3.3.3.4   If calling then throws an exception e,
     *         2.3.3.3.4.1   If resolvePromise or rejectPromise have been called, ignore it.
     *         2.3.3.3.4.2   Otherwise, reject promise with e as the reason.
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

      // @TODO: move from this describe
      it('isResolved', function () {
        expect(d.isPending()).toBe(true);
        d.resolve();
        expect(d.isResolved()).toBe(true);
      });

      it('already resolved', function () {
        var spy1 = jasmine.createSpy('done1');
        var spy2 = jasmine.createSpy('done2');

        d.done(spy1);
        d.resolve();
        d.done(spy2);
        d.resolve();

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);
      });

      it('already rejected', function () {
        var spy1 = jasmine.createSpy('done1');
        var spy2 = jasmine.createSpy('done2');

        d.done(spy1);
        d.reject();
        d.done(spy2);
        d.resolve();

        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });

      // 2.3.2. If x is a promise, adopt its state 3.4:
      describe('with promise', function () {

        // 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason.
        describe('the same', function () {
          it('deferred', function () {
            var x = d;
            var reason;

            d.fail(function () {
              reason = arguments[0];
            });

            d.resolve(x);

            expect(reason instanceof TypeError).toBe(true);
          });

          it('promise', function () {
            var x = d.promise;
            var reason;

            d.fail(function () {
              reason = arguments[0];
            });

            d.resolve(x);

            expect(reason instanceof TypeError).toBe(true);
          });
        });

        // 2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
        describe('fulfilled', function () {
          it('promise', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('done');

            d.done(spy);

            x.resolve('foo', data);
            d.resolve(x.promise);

            expect(spy).toHaveBeenCalledWith('foo', data);
          });

          it('deferred', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('done');

            d.done(spy);

            x.resolve('foo', data);
            d.resolve(x);

            expect(spy).toHaveBeenCalledWith('foo', data);
          });
        });

        // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
        describe('rejected', function () {
          it('promise', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('fail');

            d.fail(spy);

            x.reject('foo', data);
            d.resolve(x.promise);

            expect(spy).toHaveBeenCalledWith('foo', data);
          });

          it('deferred', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('fail');

            d.fail(spy);

            x.reject();
            d.resolve(x);

            expect(spy).toHaveBeenCalledWith();
          });
        });

        // 2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
        describe('pending', function () {

          // 2.3.2.2. If/when x is fulfilled, fulfill promise with the same value.
          it('fulfill', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('done');
            var done = false;
            var isPending;

            runs(function () {
              d.done(spy);
              d.resolve(x);

              isPending = d.isPending();

              setTimeout(function () {
                x.resolve('foo', data);
                done = true;
              }, 20);
            });

            waitsFor(function () {
              return done;
            }, 'timeout', 40);

            runs(function () {
              expect(isPending).toBe(true);
              expect(spy).toHaveBeenCalledWith('foo', data);
            });
          });

          // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
          it('reject', function () {
            var x = new Deferred();
            var spy = jasmine.createSpy('fail');
            var done = false;
            var isPending;

            runs(function () {
              d.fail(spy);
              d.resolve(x);

              isPending = d.isPending();

              setTimeout(function () {
                x.reject('foo', data);
                done = true;
              }, 20);
            });

            waitsFor(function () {
              return done;
            }, 'timeout', 40);

            runs(function () {
              expect(isPending).toBe(true);
              expect(spy).toHaveBeenCalledWith('foo', data);
            });
          });
        });
      });

      // 2.3.3. Otherwise, if x is an object or function,
      describe('with object', function () {

        // 2.3.3.2. If retrieving the property x.then results in a thrown exception e,
        //          reject promise with e as the reason.
        it('exception', function () {
          var x = {};
          var spy = jasmine.createSpy('fail');
          var e = new TypeError;

          x.__defineGetter__('then', function () {
            throw e;
          });

          d.fail(spy);
          d.resolve(x);

          expect(spy).toHaveBeenCalledWith(e);
        });

        // 2.3.3.3. If then is a function, call it with x as this, first argument resolvePromise,
        // and second argument rejectPromise, where:
        describe('has method then', function () {

          // 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
          it('resolvePromise called', function () {
            var isPending;
            var done = false;
            var spy = jasmine.createSpy('done');
            var x = {
              then: function (resolvePromise, rejectPromise) {
                setTimeout(function () {
                  resolvePromise('foo', data);
                  done = true;
                }, 20);
              }
            };

            runs(function () {
              d.done(spy);
              d.resolve(x);
              isPending = d.isPending();
            });

            waitsFor(function () {
              return done;
            }, 'timeout', 40);

            runs(function () {
              expect(isPending).toBe(true);
              expect(spy).toHaveBeenCalledWith('foo', data);
            });
          });

          // 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r.
          it('rejectPromise called', function () {
            var isPending;
            var done = false;
            var spy = jasmine.createSpy('fail');
            var x = {
              then: function (resolvePromise, rejectPromise) {
                setTimeout(function () {
                  rejectPromise('foo', data);
                  done = true;
                }, 20);
              }
            };

            runs(function () {
              d.fail(spy);
              d.resolve(x);
              isPending = d.isPending();
            });

            waitsFor(function () {
              return done;
            }, 'timeout', 40);

            runs(function () {
              expect(isPending).toBe(true);
              expect(spy).toHaveBeenCalledWith('foo', data);
            });
          });

          // 2.3.3.3.3. If both resolvePromise and rejectPromise are called, or multiple calls
          //            to the same argument are made, the first call takes precedence,
          //            and any further calls are ignored.
          it('both called', function() {
            var isPending;
            var done = false;
            var doneSpy = jasmine.createSpy('done');
            var failSpy = jasmine.createSpy('fail');
            var x = {
              then: function (resolvePromise, rejectPromise) {
                setTimeout(function () {
                  resolvePromise('foo', data);
                  rejectPromise('foo', data);
                  done = true;
                }, 20);
              }
            };

            runs(function () {
              d
                .done(doneSpy)
                .fail(failSpy)
                .resolve(x);
              isPending = d.isPending();
            });

            waitsFor(function () {
              return done;
            }, 'timeout', 40);

            runs(function () {
              expect(isPending).toBe(true);
              expect(doneSpy).toHaveBeenCalledWith('foo', data);
              expect(failSpy).not.toHaveBeenCalledWith('foo', data);
            });
          });

          // 2.3.3.3.4. If calling then throws an exception e,
          describe('exception thrown', function () {

            //2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it.
            it('after resolvePromise', function () {
              var done = false;
              var spy = jasmine.createSpy('done');
              var x = {
                then: function (resolvePromise, rejectPromise) {
                  resolvePromise('foo', data);
                  throw new Error;
                }
              };

              d.done(spy);
              d.resolve(x);

              expect(spy).toHaveBeenCalledWith('foo', data);
            });

            //2.3.3.3.4.1   If resolvePromise or rejectPromise have been called, ignore it.
            it('after rejectPromise', function () {
              var done = false;
              var spy = jasmine.createSpy('fail');
              var x = {
                then: function (resolvePromise, rejectPromise) {
                  rejectPromise('foo', data);
                  throw new Error;
                }
              };

              d.fail(spy);
              d.resolve(x);

              expect(spy).toHaveBeenCalledWith('foo', data);
            });

            // 2.3.3.3.4.2. Otherwise, reject promise with e as the reason.
            it('before resolvePromise/rejectPromise', function () {
              var done = false;
              var spy = jasmine.createSpy('fail');
              var e = new Error;
              var x = {
                then: function () {
                  throw e;
                }
              };

              d.fail(spy);
              d.resolve(x);

              expect(spy).toHaveBeenCalledWith(e);
            });
          });
        });

        // 2.3.3.4. If then is not a function, fulfill promise with x.
        it('no then', function () {
          var x = {
            then: {}
          };

          var spy = jasmine.createSpy('done');

          d.done(spy);
          d.resolve(x, 'foo', data);

          expect(spy).toHaveBeenCalledWith(x, 'foo', data);
        });
      });

      // 2.3.4. If x is not an object or function, fulfill promise with x.
      describe('with value', function () {
        var d = new Deferred();
        var x = 'foo';
        var spy = jasmine.createSpy('done');

        d.done(spy);
        d.resolve(x, data);

        expect(spy).toHaveBeenCalledWith('foo', data);
      });
    });

    // reject

    describe('reject', function () {

      it('isRejected', function () {
        expect(d.isPending()).toBe(true);
        d.reject();
        expect(d.isRejected()).toBe(true);
      });

      it('already rejected', function () {
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');

        d.fail(spy1);
        d.reject();
        d.fail(spy2);
        d.reject();

        expect(spy1).toHaveBeenCalled();
        expect(spy1.calls.length).toBe(1);

        expect(spy2).toHaveBeenCalled();
        expect(spy2.calls.length).toBe(1);
      });

      it('already resolved', function () {
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');

        d.fail(spy1);
        d.resolve();
        d.fail(spy2);
        d.reject();

        expect(spy1).not.toHaveBeenCalled();
        expect(spy2).not.toHaveBeenCalled();
      });

      it('value', function () {
        var spy1 = jasmine.createSpy('fail1');
        var spy2 = jasmine.createSpy('fail2');

        d.fail(spy1);
        d.reject('foo', 'bar', data);
        d.reject('another value');
        d.fail(spy2);

        expect(spy1).toHaveBeenCalledWith('foo', 'bar', data);
        expect(spy2).toHaveBeenCalledWith('foo', 'bar', data);
      });
    });

    // when

    xdescribe('when', function () {
      //
    });

    // any

    xdescribe('any', function () {
      //
    });

    // helpers

    xdescribe('helpers', function () {

      xit('isPromise', function () {
        //
      });

      xit('isDeferred', function () {
        //
      });

    });

    // nested subscriptions and state changing

  });
}());
