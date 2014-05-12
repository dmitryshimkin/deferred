describe('Promise.when', function () {

  it('done', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    var promise = Deferred.when([d1, d2.promise, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d2.resolve('foo2', obj);
    expect(promise.isPending()).toBe(true);

    d3.resolve(obj, 'bar', obj);
    expect(promise.isPending()).toBe(true);

    d1.resolve('foo1');

    expect(promise.isResolved()).toBe(true);
    expect(spy).toHaveBeenCalledWith('foo1', 'foo2', obj);
  });

  it('fail', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('fail');
    var obj = { foo: 'bar' };
    var e = new TypeError;
    var promise = Deferred.when([d1.promise, d2, d3]);

    promise.fail(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d3.resolve('foo2', 'bar', obj);
    expect(promise.isPending()).toBe(true);

    d1.reject(e, 'bar', obj);

    expect(promise.isRejected()).toBe(true);
    expect(spy).toHaveBeenCalledWith(e, 0);
  });

  it('rejected argument', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');

    d2.reject(null);

    var promise = Deferred.when([d1, d2.promise, d3]);

    promise.fail(spy);

    expect(promise.isRejected()).toBe(true);
    expect(spy).toHaveBeenCalledWith(null, 1);
  });

  it('resolved arguments', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    d2.resolve('2', 'foo');
    d1.resolve('1');
    d3.resolve('3', null);

    var promise = Deferred.when([d1, d2.promise, d3]);

    promise.done(spy);

    expect(promise.isResolved()).toBe(true);
    expect(spy).toHaveBeenCalledWith('1', '2', '3');
  });
});
