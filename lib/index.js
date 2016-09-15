'use strict';

function shifting(callback) {

  if (typeof callback !== 'function' && callback != null) {
    throw new TypeError('shifting(callback) : callback `' + callback + '` is not a function, nor null, nor undefined (see https://github.com/Moeriki/shifting#troubleshooting)');
  }

  function from(source) {
    if (typeof source !== 'function' && typeof source.then !== 'function') {
      throw new TypeError('from(source) : source `' + source + '` is not a function, nor a Promise (see https://github.com/Moeriki/shifting#troubleshooting)');
    }

    var promise = new Promise(function resolveSourceReturnValue(resolve, reject) {
      if (typeof source === 'function') {
        if (source.length === 0) {
          resolve(source());
        } else {
          source(function callbackToHybridWrapper(err, value) {
            if (err) {
              reject(err);
            } else {
              resolve(value);
            }
          });
        }
      } else {
        // because we asserted source at the beginning of from()
        // we can assume source is a Promise here
        source.then(resolve, reject);
      }
    });

    if (typeof callback === 'function') {
      promise.then(
        function onSucces(value) {
          callback(null, value);
        },
        function onFail(err) {
          callback(err);
        }
      );
      return undefined;
    }

    return promise;
  }

  return {
    from: from,
  };
}

module.exports = shifting;
