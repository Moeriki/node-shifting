'use strict';

// modules

var Promise = require('any-promise');

var util = require('./util');

// private variables

var TROUBLESHOOTING = ' (see https://github.com/Moeriki/shifting#troubleshooting)';

// private funtions

function callbackTo(resolve, reject) {
  return function callbackToPromise(err, value) {
    if (err) {
      reject(err);
    } else {
      resolve(value);
    }
  };
}

function extractSourceReturnValue(source, resolve, reject) {
  if (typeof source === 'function') {
    if (util.fnLength(source) === 0) {
      try {
        resolve(source());
      } catch (err) {
        reject(err);
      }
    } else {
      source(callbackTo(resolve, reject));
    }
  } else {
    source.then(resolve, reject);
  }
}

// exports

function shifting(callback) {

  if (typeof callback !== 'function' && callback != null) {
    throw new TypeError(
      `shifting(callback) : callback \`${callback}\` is not a function, nor null, nor undefined${TROUBLESHOOTING}`
    );
  }

  function from(source) {
    if (typeof source !== 'function' && typeof source.then !== 'function') {
      throw new TypeError(
        `from(source) : source \`${source}\` is not a function, nor a Promise${TROUBLESHOOTING}`
      );
    }

    if (typeof callback === 'function') {
      extractSourceReturnValue(
        source,
        function onResolved(value) {
          callback(null, value);
        },
        function onRejected(err) {
          callback(err);
        }
      );
      return undefined;
    }

    return new Promise(function resolveSourcePromise(resolve, reject) {
      extractSourceReturnValue(source, resolve, reject);
    });
  }

  return { from };
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
    throw new TypeError(`${func} is not a function`);
  }

  var promise;
  if (util.fnLength(func) === args.length) {
    promise = func.apply(context, args);
    if (!promise || typeof promise.then !== 'function') {
      promise = Promise.resolve(promise);
    }
  } else if (util.fnLength(func) === args.length + 1) {
    promise = new Promise(function applyFuncToPromise(resolve, reject) {
      args.push(callbackTo(resolve, reject));
      func.apply(context, args);
    });
  } else {
    throw new Error(`cannot determine how to call function${ TROUBLESHOOTING}`);
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
