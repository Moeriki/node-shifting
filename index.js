'use strict';

const Promise = require('any-promise');

// private

const TROUBLESHOOTING = ' (see https://github.com/Moeriki/shifting#troubleshooting)';

/**
 * @param {function} resolve
 * @param {function} reject
 * @return {function}
 */
function callbackTo(resolve, reject) {
  return function callbackToPromise(err, value) {
    if (err) {
      reject(err);
    } else {
      resolve(value);
    }
  };
}

/**
 * @param {function|Promise} source
 * @param {function} resolve
 * @param {function} reject
 */
function extractSourceReturnValue(source, resolve, reject) {
  if (typeof source === 'function') {
    if (source.length === 0) {
      try {
        resolve(source());
      } catch (err) {
        reject(err);
      }
    } else {
      source(callbackTo(resolve, reject));
    }
  } else {
    source
      .then(resolve, reject)
      // Catch should not be possible
      .catch(console.error) // eslint-disable-line no-console
    ;
  }
}

// exports

/**
 * @param {function} [callback]
 * @return {object} { from }
 */
function shifting(callback) {

  if (typeof callback !== 'function' && callback != null) {
    throw new TypeError(
      `shifting(callback) : callback \`${callback}\` is not a function, nor null, nor undefined${TROUBLESHOOTING}`
    );
  }

  /**
   * @param {function|Promise} source
   * @return {Promise|undefined}
   */
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
          setImmediate(() => {
            callback(null, value);
          });
        },
        function onRejected(err) {
          setImmediate(() => {
            callback(err);
          });
        }
      );
      return undefined;
    }

    return new Promise(function resolveSourcePromise(resolve, reject) { // eslint-disable-line consistent-return
      extractSourceReturnValue(source, resolve, reject);
    });
  }

  return { from };
}

/**
 * @param {function|object} func        function or tuple of of [bindArg, function]
 * @param {Array<*>}        [applyArgs]
 * @param {function}        [callback]
 * @return {Promise|undefined} if a callback is provided: undefined, otherwise Promise
 */
shifting.apply = function apply() {
  const args = Array.from(arguments);
  let context, func, applyArgs, callback;
  if (Array.isArray(args[0])) {
    context = args[0][0];
    func = args[0][1];
  } else {
    context = null;
    func = args[0];
  }
  if (typeof args[1] === 'function') {
    applyArgs = [];
    callback = args[1];
  } else {
    applyArgs = args[1] || [];
    callback = args[2];
  }

  if (typeof func !== 'function') {
    throw new TypeError(`${func} is not a function`);
  }

  let promise;
  if (func.length === applyArgs.length) {
    try {
      promise = func.apply(context, applyArgs);
    } catch (err) {
      promise = Promise.reject(err);
    }
    if (!promise || typeof promise.then !== 'function') {
      promise = Promise.resolve(promise);
    }
  } else if (func.length === applyArgs.length + 1) {
    promise = new Promise(function applyFuncToPromise(resolve, reject) {
      applyArgs.push(callbackTo(resolve, reject));
      func.apply(context, applyArgs);
    });
  } else {
    throw new Error(`cannot determine how to call function${TROUBLESHOOTING}`);
  }

  return shifting(callback).from(promise);
};

/**
 * @param {function}  func
 * @param {*}         [...args]
 * @return {Promise|undefined} if a callback is provided: undefined, otherwise Promise
 */
shifting.call = function call(func) {
  // take all args, except first (which is func)
  const args = Array.prototype.slice.call(arguments, 1);
  // if last args[…] is a funcion, assume it's a callback
  let callback;
  if (typeof args[args.length - 1] === 'function') {
    callback = args.pop();
  }
  // forward logic to shifting.apply
  return shifting.apply(func, args, callback);
};

module.exports = shifting;
