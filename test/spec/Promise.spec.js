describe('Promise', function () {
  describe('catch', function () {
    // 2.2.3.1. it must be called after promise is rejected, with promise’s reason as its first argument.
    it('should be called synchronously once promise is rejected', function () {
      var onReject = jasmine.createSpy();
      var d = new Deferred();

      d.promise.catch(onReject);
      d.reject(null);

      expect(onReject.calls.count()).toBe(1);
    });

    // 2.2.3.3. it must not be called more than once.
    it('should not be called more than once', function () {
      var d = new Deferred();
      var onReject = jasmine.createSpy();

      d.promise.catch(onReject);
      d.reject('foo').reject(true);

      expect(onReject.calls.count()).toBe(1);
      expect(onReject.calls.argsFor(0)).toEqual(['foo']);
    });

    // 2.2.1.1. If onFulfilled is not a function, it must be ignored.
    it('if first argument (onFullfilled) is not a function, it must be ignored', function () {
      var d = new Deferred();
      var onReject = jasmine.createSpy();

      d.promise.catch(onReject);
      d.reject();

      expect(onReject.calls.count()).toBe(1);
    });

    // 2.2.4. onFulfilled or onReject must not be called until the execution context stack contains
    // NOTE: this implementation ignores this bullshit. Use BlueBird.js if you need it

    // 2.2.5. Spec: onFulfilled and onReject must be called as functions (i.e. with no this value).
    // NOTE: This is a piece of shit. Context must be a promise itself of custom one
    describe('context', function () {
      it('should be a promise if no context specified', function () {
        var d = new Deferred();
        var onReject = jasmine.createSpy();

        d.promise.catch(onReject);
        d.reject();

        expect(onReject.calls.mostRecent().object).toBe(d.promise);
      });

      it('should be custom if it\'s specified', function () {
        var d = new Deferred();
        var onReject = jasmine.createSpy();
        var ctx = {};

        d.promise.catch(onReject, ctx);
        d.reject();

        expect(onReject.calls.mostRecent().object).toBe(ctx);
      });
    });

    // 2.2.6. then may be called multiple times on the same promise
    // 2.2.6.1. If/when promise is fulfilled, all respective onFulfilled callbacks must execute
    //          in the order of their originating calls to then.
    it('all catch handlers should be called in order they were added', function () {
      var d = new Deferred();
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

      d.promise.catch(onReject1);
      d.promise.catch(onReject2);

      d.reject('foo');

      d.promise.catch(onReject3);

      expect(log.length).toBe(3);
      expect(log.join('')).toBe('123');
    });
  });
});
