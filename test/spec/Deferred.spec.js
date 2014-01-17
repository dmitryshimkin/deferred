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

      it('nested', function () {

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

      it('nested', function () {

      });
    });

    // always

    describe('always', function () {

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
        xit('fulfilled', function () {
          var x = new Deferred();
          var spy = jasmine.createSpy('done');

          d.done(spy);

          x.resolve('foo', data);
          d.resolve(x);

          expect(spy).toHaveBeenCalledWith('foo', data);
        });

        // 2.3.2.3. If/when x is rejected, reject promise with the same reason.
        xit('rejected', function () {
          var x = new Deferred();
          var spy = jasmine.createSpy('fail');

          d.fail(spy);

          x.reject('foo', data);
          d.resolve(x);

          expect(spy).toHaveBeenCalledWith('foo', data);
        });

        // 2.3.2.1. If x is pending, promise must remain pending until x is fulfilled or rejected.
        xdescribe('pending', function () {

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
      xdescribe('with object', function () {

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
          d.resolve(x);

          expect(spy).toHaveBeenCalledWith(x);
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

    // then

    describe('then', function () {
      //
    });

    // when

    describe('when', function () {
      //
    });

    // any

    describe('any', function () {
      //
    });

    // helpers

    describe('helpers', function () {

      it('isPromise', function () {
        //
      });

      it('isDeferred', function () {
        //
      });

    });

    // nested subscriptions and state changing

  });
}());
