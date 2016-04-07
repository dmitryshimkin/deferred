# Deferred

The [fastest](#performance) Promises/A+ implementation
with synchronous calls and context support.

Based on Deferred pattern.

## Features

- Cross-browser
- Sync calls when it's possible
- Support context for the handlers
- Small size: 1.4 KB (min and gzipped)
- No dependencies
- Performance


## Browser support

Any ES3 compliant browser.


## Table of content

- [Install](#install)
- [Usage](#usage)
- [API](#api)
  - [Deferred](#deferred)
    - [Create instance](#deferred-instance)
    - [Static methods](#deferred-static)
      - [.resolve()](#deferred-resolve)
      - [.reject()](#deferred-reject)
      - [.all()](#deferred-all)
      - [.race()](#deferred-race)
      - [.isDeferred()](#deferred-isdeferred)
      - [.isPromise()](#deferred-ispromise)
      - [.isThanable()](#deferred-isthenable)
    - [Instance methods](#deferred-instance-methods)
      - [.resolve()](#deferred-instance-resolve)
      - [.reject()](#deferred-instance-resolve)
    - [Instance properties](#deferred-instance-props)
      - [.promise](#deferred-promise)
  - [Promise](#promise-instance)
    - [.then()](#promise-instance-then)
    - [.catch()](#promise-instance-catch)
    - [.done()](#promise-instance-done)
    - [.fail()](#promise-instance-fail)
    - [.always()](#promise-instance-always)
- [Performance](#performance)
- [License](#license)

<a name="install">
## Install

```
npm install deferred2
```

<a name="usage">
## Usage

As a script tag:

```html
<script src="path/to/deferred.js"></script>
<script>
  // window.Deferred is available here
</script>
```

As a CommonJS module:

```javascript
const Deferred = require('deferred2');

// Deferred is available here
```

As an AMD module:

```javascript
define(['Deferred'], function (Deferred) {
  // Deferred is available here
});
```

As an ES2015 module:

```javascript
import {Deferred} from 'deferred2'

// Deferred is available here
```

<a name="api">
## API


<a name="deferred">
### Deferred

A new instance of Deferred can be created by calling Deferred as a constructor
(e.g. with a `new` keyword):

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();
```

<a name="deferred-static">
### Static methods

<a name="deferred-resolve">
#### Deferred.resolve()

Returns a Promise object that is resolved with the given value.

If the value is a thenable (i.e. has a then method),
the returned promise will "follow" that thenable, adopting its eventual state;
otherwise the returned promise will be fulfilled with the value.

##### Params

| Parameter  | Type                          | Description           |
|:-----------|:------------------------------|:----------------------|
| value      | `*|Promise|Deferred|Thenable` | Any value. Optional.  |

Returns: `Promise`.

##### Examples

Resolving with value:

```javascript
import {Deferred} from 'deferred2'

Deferred.resolve(2)
  .then(function(val) {
    console.log(val); // 2
  });
```

Resolving with another deferred:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();
Deferred.resolve(dfd) ==== dfd.promise; // true
```

Resolving with promise:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();
Deferred.resolve(dfd.promise) === dfd.promise; // true
```

Resolving with thenable:

```javascript
import {Deferred} from 'deferred2'

const thenable = {
  then: function (onResolve, onReject) {
    setTimeout(function () {
      onResolve(2);
    }, 1000);
  }
};

Deferred.resolve(thenable)
  .then(function (val) {
    console.log(val); // 2
  });
```


<a name="deferred-reject">
#### Deferred.reject()

Returns a Promise object that is rejected with the given reason.

##### Params

| Parameter  | Type    | Description           |
|:-----------|:--------|:----------------------|
| reason     | `*`     | Any value. Optional.  |

Returns: `Promise`.

##### Examples

Rejection with value:

```javascript
import {Deferred} from 'deferred2'

Deferred.reject('Some error')
  .catch(function(val) {
    console.log(val); // "Some error"
  });
```


<a name="deferred-all">
#### Deferred.all()

Returns a promise that resolves when all of the promises in the given array have resolved,
or rejects with the reason of the first passed promise that rejects.

##### Params

| Parameter   | Type              | Description                             |
|:------------|:------------------|:----------------------------------------|
| promises    | `Array|ArrayLike` | Array or ArrayLike object of promises.  |

Returns: `Promise`.

##### Examples

```javascript
import {Deferred} from 'deferred'

const dfdA = new Deferred();
const dfdB = new Deferred();
const dfdC = new Deferred();

Deferred.all([dfdA.promise, dfdB.promise, dfdC.promise])
  .then(function onResolve (values) {
    console.log(values);
  })
  .catch(function onReject (reason) {
    console.log(reason);
  });

dfdA.resolve('foo');
dfdB.resolve('bar');
dfdC.resolve('xyz'); // ["foo", "bar", "xyz"]
```


<a name="deferred-race">
#### Deferred.race()

Returns a promise that resolves or rejects as soon as one of the promises
in the given array resolves or rejects, with the value or reason from that promise.

##### Params

| Parameter   | Type              | Description                            |
|:------------|:------------------|:---------------------------------------|
| promises    | `Array|ArrayLike` | Array or ArrayLike object of promises. |

Returns: `Promise`.

##### Examples

```javascript
import {Deferred} from 'deferred'

const dfdA = new Deferred();
const dfdB = new Deferred();
const dfdC = new Deferred();

Deferred.race([dfdA.promise, dfdB.promise, dfdC.promise])
  .then(function onResolve (value) {
    console.log(value);
  })
  .catch(function onReject (reason) {
    console.log(reason);
  });

setTimeout(() => {
  dfdA.resolve('foo');
}, 1000);

setTimeout(() => {
  dfdA.resolve('bar'); // "bar"
}, 500);
```


<a name="deferred-isdeferred">
#### Deferred.isDeferred()

Returns `true` if the given argument is an instance of Deferred, `false` if it is not.

##### Params

| Parameter  | Type  | Description                 |
|:-----------|:------|:----------------------------|
| arg        | `*`   | The argument to be checked. |

Returns: `Boolean`.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

Deferred.isDeferred(dfd);                      // true
Deferred.isDeferred(dfd.promise);              // false
Deferred.isDeferred({ then: function () {} }); // false
Deferred.isDeferred('foo');                    // false
```


<a name="deferred-ispromise">
#### Deferred.isPromise()

Returns `true` if the given argument is an instance of Promise, produced by Deferred,
`false` if it is not.

##### Params

| Parameter  | Type  | Description                 |
|:-----------|:------|:----------------------------|
| arg        | `*`   | The argument to be checked. |

Returns: `Boolean`.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

Deferred.isPromise(dfd);                      // false
Deferred.isPromise(dfd.promise);              // true
Deferred.isPromise({ then: function () {} }); // false
Deferred.isPromise('foo');                    // false
Deferred.isPromise((new Promise(function (resolve, reject) {}))); // false
```


<a name="deferred-isthenable">
#### Deferred.isThenable()

Returns `true` if the given argument is a thenable object (has `then` method),
`false` if it is not.

##### Params

| Parameter  | Type  | Description                 |
|:-----------|:------|:----------------------------|
| arg        | `*`   | The argument to be checked. |

Returns: `Boolean`.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

Deferred.isThenable(dfd);                      // false
Deferred.isThenable(dfd.promise);              // true
Deferred.isThenable({ then: function () {} }); // true
Deferred.isThenable('foo');                    // false
Deferred.isThenable((new Promise(function (resolve, reject) {}))); // true
```


<a name="deferred-instance">
### Deferred instance

<a name="deferred-instance-resolve">
#### .resolve()

Resolves the promise with the given value.

If the value is a thenable (i.e. has a then method),
the promise will "follow" that thenable, adopting its eventual state;
otherwise the returned promise will be fulfilled with the value.

##### Params

| Parameter  | Type                          | Description           |
|:-----------|:------------------------------|:----------------------|
| value      | `*|Promise|Deferred|Thenable` | Any value. Optional.  |

Returns: `Deferred` – the same deferred instance for the chaining.

##### Examples

Resolving with value:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(function(val) {
    console.log(val);
  });

dfd.resolve(2); // 2
```

Resolving with another deferred:

```javascript
import {Deferred} from 'deferred2'

const dfdA = new Deferred();
const dfdB = new Deferred();

dfdA.promise
  .then(function onResolve (value) {
    console.log(value);
  });

dfdA.resolve(dfdB);

dfdB.resolve('foo'); // "foo"
```

Resolving with promise:

```javascript
import {Deferred} from 'deferred2'

const dfdA = new Deferred();
const dfdB = new Deferred();

dfdA.promise
  .then(function onResolve (value) {
    console.log(value);
  });

dfdA.resolve(dfdB.promise);

dfdB.resolve('foo'); // "foo"
```

Resolving with thenable:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(function onResolve (value) {
    console.log(value);
  });

const thenable = {
  then: function (onResolve, onReject) {
    setTimeout(function () {
      onResolve('foo'); // "foo"
    }, 1000);
  }
};

dfd.resolve(thenable);
```


<a name="deferred-instance-reject">
#### .reject()

Rejects the promise with the given reason.

##### Params

| Parameter  | Type  | Description    |
|:-----------|:------|:---------------|
| reason     | `*`   | Any value.     |

Returns: `Deferred` – the same deferred instance for the chaining.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .catch(function(reason) {
    console.log(reason);
  });

dfd.reject('Error'); // "Error"
```


<a name="deferred-instance-promise">
#### .promise

Promise instance associated with this deferred. See [Promise instance API](#Promise).

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise.then(onResolve, onReject);
```


<a name="promise-instance">
### Promise instance

Promise cannot be instantiated directly. Instead you need to create an instance of Deferred
and get the associated promise from it:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();
const promise = dfd.promise;

promise.then(/*...*/)
```

### Promise instance methods

<a name="promise-instance-then">
#### .then()

Appends fulfillment and rejection handlers to the promise,
and returns a new promise resolving to the return value of the called handler,
or to its original settled value if the promise was not handled
(i.e. if the relevant handler onFulfilled or onRejected is undefined).

See [Promises/A+](https://promisesaplus.com/) for details.

##### Params

| Parameter  | Type       | Description                                                         |
|:-----------|:-----------|:--------------------------------------------------------------------|
| onResolve  | `Function` | A function, which is called when the promise is resolved. Optional. |
| onReject   | `Function` | A function, which is called when the promise is rejected. Optional. |
| ctx        | `Object`   | The context for the handlers. Optional.                             |

Returns: `Promise` – a new promise based on the value, returned by the handler.

##### Examples

Handle resolve:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(function onResolve (value) {
    console.log(value);
  }, function onReject (reason) {
    console.log(reason);
  });

dfd.resolve('foo'); // "foo"
```

Handle reject:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(function onResolve (value) {
    console.log(value);
  }, function onReject (reason) {
    console.log(reason);
  });

dfd.reject('Error'); // "Error"
```

Pass only `onResolve`:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(function onResolve (value) {
    console.log(value);
  });

dfd.resolve('bar'); // "bar"
```

Pass only `onReject`:

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .then(null, function onReject (value) {
    console.log(value);
  });

dfd.reject('Error'); // "Error"
```

Pass the context:

```javascript
import {Deferred} from 'deferred2'

class Component {
  constructor () {
    this.load()
      .then(
        this.onLoad,
        this.onFail,
        this
      )
  }

  onLoad () {
    console.log(this instanceof Component); // true
  }

  onFail () {
    console.log(this instanceof Component); // true
  }
}
```

Pass only `onResolve` and the context:

```javascript
import {Deferred} from 'deferred2'

class Component {
  constructor () {
    this.load()
    .then(this.onLoad, this);
  }

  onLoad () {
    console.log(this instanceof Component); // true
  }
}
```

<a name="promise-instance-catch">
#### .catch()

Adds the given handler to be called when the promise is reject.

Creates a new promise and returns it.

Alias for `.then(null, onReject)`.

##### Params

| Parameter  | Type       | Description                                               |
|:-----------|:-----------|:----------------------------------------------------------|
| onReject   | `Function` | A function, which is called when the promise is rejected. |
| ctx        | `Object`   | The context for the handler. Optional.                    |

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .catch(function onReject (reason) {
    console.log(reason);
  });

dfd.reject('Error'); // "Error"
```


<a name="promise-instance-done">
#### .done()

Adds the given handler to be called when the promise is resolved.

The main difference from `.then` method is that `.done` only adds a handler and doesn't create
a new promise. Instead it returns the current promise for the chaining.

##### Params

| Parameter  | Type        | Description                                               |
|:-----------|:------------|:----------------------------------------------------------|
| onResolve  | `Function`  | A function, which is called when the promise is resolved. |
| ctx        | `Object`    | The context for the handler. Optional.                    |

Returns: `Promise` – the same promise for the chaining.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .done(function (value) {
    console.log(value);
  });

dfd.resolve('foo'); // "foo"
```

Context for the handler:

```javascript
import {Deferred} from 'deferred2'

class Component {
  constructor () {
    this.loadData()
      .done(this.onLoad, this);
  }

  onLoad () {
    console.log(this instanceof Component); // true
  }

  load () {
    const dfd = new Deferred();
    return dfd.promise;
  }
}
```


<a name="promise-instance-fail">
#### .fail()

Adds the given handler to be called when the promise is rejected.

The main difference from `.catch` method is that `.fail` only adds a handler and doesn't create
a new promise. Instead it returns the current promise for the chaining.

##### Params

| Parameter  | Type        | Description                                               |
|:-----------|:------------|:----------------------------------------------------------|
| onReject   | `Function`  | A function, which is called when the promise is rejected. |
| ctx        | `Object`    | The context for the handler. Optional.                    |

Returns: `Promise` – the same promise for the chaining.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfd = new Deferred();

dfd.promise
  .fail(function (value) {
    console.log(value);
  });

dfd.reject('foo'); // "foo"
```

Context for the handler:

```javascript
import {Deferred} from 'deferred2'

class Component {
  constructor () {
    this.loadData()
      .fail(this.onFail, this);
  }

  onFail () {
    console.log(this instanceof Component); // true
  }

  load () {
    const dfd = new Deferred();
    return dfd.promise;
  }
}
```


<a name="promise-instance-always">
#### .always()

Adds the given handler to be called when the promise is either resolved or rejected.

##### Params

| Parameter  | Type        | Description                                                           |
|:-----------|:------------|:----------------------------------------------------------------------|
| onSettle   | `Function`  | A function, which is called when the promise is resolved or rejected. |
| ctx        | `Object`    | The context for the handler. Optional.                                |

Returns: `Promise` – the same promise for the chaining.

##### Examples

```javascript
import {Deferred} from 'deferred2'

const dfdA = new Deferred();
const dfdB = new Deferred();

dfdA.promise
  .always(function (value) {
    console.log(value);
  });

dfdB.promise
  .always(function (value) {
    console.log(value);
  });

dfdA.resolve('foo'); // "foo"
dfdB.reject('bar');  // "bar"
```

The `always` method is useful when you need to run some code regardless to the result of
the async call.

Consider you want to load some data and while the data is loading you want to display
a progress indicator. In this case you need to show the progress indicator before the request for the data
and hide when the request is completed regardless to whether it was successful or not:

```javascript
showSpinner();

loadData()
  .done(renderData)
  .fail(displayError)
  .always(hideSpinner);
```

NOTE: Most descriptions here are taken from
[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).


<a name="performance">
## Performance

In the benchmark suite I create an instance of the Deferred.
Then I create a new promise by calling `.then` method on the initial one.
And then I resolve the deferred with plain value.

Since native promises don't provide a deferred implementation,
the suite for the ES6 Promise is slightly different.

The code of the benchmark suite can be found in [benchmark/suite](./benchmark/suite) directory.

Start benchmark:

```
npm run benchmark
```

If you get `out of memory` error, try to run the suites separately one by one by commenting out
all the suites and keeping uncommented only one of them.

On Macbook Pro 2015 with `NodeJS v4.0.0` I got the following result:

| Library                                                     | Ops/sec   |
|:------------------------------------------------------------|----------:|
| Deferred                                                    | 5,236,382 |
| [Bluebird](http://bluebirdjs.com/)                          |   913,827 |
| [ES6 promise](https://github.com/stefanpenner/es6-promise)  |   724,337 |
| [RSVP](https://github.com/tildeio/rsvp.js/)                 |   590,330 |
| [vow](https://github.com/dfilatov/vow)                      |   365,653 |
| [kew](https://github.com/Medium/kew)                        |   171,724 |
| [Q](https://github.com/kriskowal/q)                         |    57,255 |
| [jQuery](https://api.jquery.com/category/deferred-object/)  |    41,247 |


<a name="license">
## License

MIT
