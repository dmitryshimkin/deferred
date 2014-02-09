describe('any', function () {

  it('done', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    var promise = Deferred.any([d1, d2.promise, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d2.resolve('foo1', obj);

    expect(promise.isResolved()).toBe(true);
    expect(spy).toHaveBeenCalledWith('foo1', obj);
  });

  it('fail and done', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    var promise = Deferred.any([d1, d2.promise, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d3.reject('foo1', obj);
    expect(promise.isPending()).toBe(true);

    d2.reject(null);
    expect(promise.isPending()).toBe(true);

    d1.resolve(null, 'bar', obj);
    expect(promise.isResolved()).toBe(true);

    expect(spy).toHaveBeenCalledWith(null, 'bar', obj);
  });

  it('all fail', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    var promise = Deferred.any([d1, d2.promise, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isPending()).toBe(true);

    d3.reject('foo1', obj);
    expect(promise.isPending()).toBe(true);

    d2.reject(null);
    expect(promise.isPending()).toBe(true);

    d1.reject('bar');
    expect(promise.isRejected()).toBe(true);

    expect(spy).toHaveBeenCalledWith('bar');
  });

  it('with resolved argument', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    d3.resolve(obj, 'foo');

    var promise = Deferred.any([d1, d2.promise, d3]);

    promise.done(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isResolved()).toBe(true);
    expect(spy).toHaveBeenCalledWith(obj, 'foo');
  });

  it('with rejected arguments', function () {
    var d1 = new Deferred();
    var d2 = new Deferred();
    var d3 = new Deferred();
    var spy = jasmine.createSpy('done');
    var obj = { foo: 'bar' };

    d2.reject('2');
    d1.reject('1');
    d3.reject('3');

    var promise = Deferred.any([d1, d2.promise, d3]);

    promise.fail(spy);

    expect(Deferred.isPromise(promise)).toBe(true);
    expect(promise.isRejected()).toBe(true);
    expect(spy).toHaveBeenCalledWith('1');
  });
});
