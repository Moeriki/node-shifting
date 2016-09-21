'use strict';

// private variables

var TROUBLESHOOTING = ' (see https://github.com/Moeriki/shifting#troubleshooting)';

// private funtions

function thenRe(resolve, reject) {
  return function callbackToPromise(err, value) {
    if (err) {
      reject(err);
    } else {
      resolve(value);
    }
  };
}

// exports

function shifting(callback) {

  if (typeof callback !== 'function' && callback != null) {
    throw new TypeError(
      'shifting(callback) : callback `' + callback + '` is not a function, nor null, nor undefined' + TROUBLESHOOTING
    );
  }

  function from(source) {
    if (typeof source !== 'function' && typeof source.then !== 'function') {
      throw new TypeError(
        'from(source) : source `' + source + '` is not a function, nor a Promise' + TROUBLESHOOTING
      );
    }

    var promise = new Promise(function resolveSourceReturnValue(resolve, reject) {
      if (typeof source === 'function') {
        if (source.length === 0) {
          resolve(source());
        } else {
          source(thenRe(resolve, reject));
        }
      } else {
        // because we asserted source at the beginning of from()
        // we can assume source is a Promise here
        source.then(resolve, reject);
      }
    });

    if (typeof callback === 'function') {
      promise.then(
        function onResolve(value) {
          setImmediate(function tickCallbackValue() {
            callback(null, value);
          });
        },
        function onReject(err) {
          setImmediate(function tickCallbackError() {
            callback(err);
          });
        }
      );
      return undefined;
    }

    return promise;
  }

  return { from: from };
}

shifting.apply = function apply(func, args, callback) {
  var context = null;
  if (Array.isArray(func)) {
    context = func[0];
    func = func[1];
  }
  if (typeof args === 'function') {
    callback = args;
    args = [];
  } else if (args == null) {
    args = [];
  }

  if (typeof func !== 'function') {
    throw new TypeError(func + ' is not a function');
  }

  var promise;
  if (func.length === args.length) {
    promise = func.apply(context, args);
    if (!promise || typeof promise.then !== 'function') {
      promise = Promise.resolve(promise);
    }
  } else if (func.length === args.length + 1) {
    promise = new Promise(function applyFuncToPromise(resolve, reject) {
      args.push(thenRe(resolve, reject));
      func.apply(context, args);
    });
  } else {
    throw new Error('cannot determine how to call function' + TROUBLESHOOTING);
  }

  return shifting(callback).from(promise);
};

shifting.call = function call(func) {
  // take all args, except first (which is func)
  var args = Array.prototype.slice.call(arguments, 1);
  // if last args[…] is a funcion, assume it's a callback
  var callback;
  if (typeof args[args.length - 1] === 'function') {
    callback = args.pop();
  }
  // forward logic to shifting.apply
  return shifting.apply(func, args, callback);
};

module.exports = shifting;
