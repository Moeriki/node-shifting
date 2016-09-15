# Shifting

Shifting allows you to create APIs that support both callback-style and promises.

## Install

```sh
npm install --save shifting
```

Shifting assumes a global `Promise` object for its inner workings. If that's no good, [open an issue](https://github.com/Moeriki/shifting/issues).

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

## API

**`shifting(callback:function|null|undefined)`** ▶︎ return `object { from:function  }`

This function does nothing except returning a `{ from:function }` object.

**`from(source:function|Promise)`** ▶︎ returns `Promise|undefined`

Pass a source to Shifting. If `shifting()` (see above) received a callback function it will return `undefined`, otherwise a `Promise`.

<a name="troubleshooting" />
## Troubleshooting

**shifting warning: callback … is not a function, nor null, nor undefined**

You need to call `shifting()` with either a callback function or `undefined|null`. Otherwise this error will be logged. This is to hide programming errors.

**from() expects one argument; a function or a Promise, received …**

See implementation examples above.
