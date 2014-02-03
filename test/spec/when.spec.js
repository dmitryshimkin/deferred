describe('Promise.when', function () {

  it('done', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    var promise = Deferred.when([d1, d2, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d2.resolve('foo1', obj);
    expect(promise.isPending()).toBe(true);

    d3.resolve('foo2', 'bar', obj);
    expect(promise.isPending()).toBe(true);

    d1.resolve(null);

    expect(promise.isResolved()).toBe(true);
    expect(spy).toHaveBeenCalledWith([null], ['foo1', obj], ['foo2', 'bar', obj]);
  });

  it('fail', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('fail');
    var obj = { foo: 'bar' };
    var e = new TypeError;
    var promise = Deferred.when([d1, d2, d3]);

    promise.fail(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d3.resolve('foo2', 'bar', obj);
    expect(promise.isPending()).toBe(true);

    d1.reject(e);

    expect(promise.isRejected()).toBe(true);
    expect(spy).toHaveBeenCalledWith([e], [], []);
  });

  it('context', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var ctx = { foo: 'bar' };
    var e = new TypeError;
    var promise = Deferred.when([d1, d2, d3]);
    var _this;

    promise.fail(function () {
      _this = this;
    });

    d2.reject(e);

    expect(_this).toBe(ctx);
  });
});
