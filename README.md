# Shifting

Shifting allows you to create APIs that support both callback-style and promises.

[![Build Status](https://travis-ci.org/Moeriki/node-shifting.svg?branch=master)](https://travis-ci.org/Moeriki/node-shifting) [![Coverage Status](https://coveralls.io/repos/github/Moeriki/node-shifting/badge.svg?branch=master)](https://coveralls.io/github/Moeriki/node-shifting?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/moeriki/node-shifting/badge.svg)](https://snyk.io/test/github/moeriki/node-shifting) [![dependencies Status](https://david-dm.org/moeriki/node-shifting/status.svg)](https://david-dm.org/moeriki/node-shifting) [![Downloads](http://img.shields.io/npm/dm/shifting.svg?style=flat)](https://www.npmjs.org/package/shifting)

---

## Install

```sh
npm install --save shifting
```

## Implementation

**Wrapping a callback**

```javascript
function timesTwo(number, callback) {
  return shifting(callback).from(
    function (cb) {
      cb(null, number * 2);
    }
  )
}

timesTwo(4).then(console.log); // logs 8
timesTwo(4, function (err, result) {
  console.log(result); // logs 8
});
```

**Wrapping a Promise**

```javascript
function timesTwo(number, callback) {
  return shifting(callback).from(
    Promise.resolve(number * 2)
  )
}

timesTwo(4).then(console.log); // logs 8
timesTwo(4, function (err, result) {
  console.log(result); // logs 8
});
```

**Wrapping a value**

```javascript
function timesTwo(number, callback) {
  return shifting(callback).from(
    function () (
      if (typeof number !== 'number') {
        throw new TypeError('number is not a number');
      }
      return number;
    }
  )
}

timesTwo(4).then(console.log); // logs 8
timesTwo('a string', function (err) {
  console.log(err); // logs [Error: number is not a number]
});
```

The important part here is that throwing an `Error` will still callback or reject the `Error`.

## Call / Apply

Shifting allows you to call a function of which you are not sure if it will take a callback arg, or return a Promise, or return synchronously any other value.

```javascript
// Callback API
function sum(augend, addend, callback) {
  callback(null, augend + addend);
}

// Promise API
function sum(augend, addend) {
  return Promise.resolve(augend + addend);
}

// Synchronous API
function sum(augend, addend) {
  return augend + addend;
}
```

With any of the above implementations you can use `shifting.apply` / `shifting.call` as such.

```javascript
shifting.apply(sum, [3, 4]).then(console.log); // logs 7
shifting.apply(sum, [3, 4], function (err, result) {
  console.log(result); // logs 7
});

shifting.call(sum, 3, 4).then(console.log); // logs 7
shifting.call(sum, 3, 4, function (err, result) {
  console.log(result); // logs 7
});
```

**Binding**

If the called function requires binding you can do it as such.

```javascript
var myAPI = {
  hello: 'Bonjour',
  sayHello: function (name, callback) {
    callback(null, this.hello + ' ' + name + '!');
  }
}

say.call([myAPI, myAPI.sayHello], 'World')
  .then(console.log); // logs 'Bonjour World!'
```

## API

**`shifting(callback:function|null|undefined)`** ▶︎ return `object { from:function  }`

This function does nothing except returning a `{ from:function }` object.

**`from(source:function|Promise)`** ▶︎ returns `Promise|undefined`

Pass a source to Shifting. If `shifting()` (see above) received a callback function it will return `undefined`, otherwise a `Promise`.

**`shifting.apply(function|array<context, function>[, array<args...>[, callback]])`** ▶︎ return `Promise|undefined`

**`shifting.call(function|array<context, function>[, args...[, callback]])`** ▶︎ return `Promise|undefined`

<a name="troubleshooting" />
## Troubleshooting

**shifting(callback) : callback `…` is not a function, nor null, nor undefined**

You need to call `shifting()` with either a callback function or `undefined|null`. Otherwise this error will be logged. This is to loudly expose programming errors.

**from(source) : source `…` is not a function, nor a Promise**

See implementation examples above.

## any-promise

Shifting uses [any promise](https://github.com/kevinbeaty/any-promise) to detect a Promise object. Check [their README](https://github.com/kevinbeaty/any-promise#any-promise) to plugin in your own Promise library.
