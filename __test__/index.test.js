/* eslint no-magic-numbers:0 */

'use strict';

// modules

var shifting = require('../index');

// private functions

var throwIdentity = (arg) => {
  throw new Error(`function should not have been called \`fn(${arg})\``);
};

// tests

it('should throw error if receiving no function, nor null, nor undefined', () => {
  // setup
  function test() {
    return shifting('string value');
  }
  // test
  expect(test).toThrowError(
    'shifting(callback) : callback `string value` is not a function, nor null, nor undefined'
  );
});

describe('from()', () => {

  it('should throw if it receives no function, nor Promise', () => {
    // setup
    function test(callback) {
      return shifting(callback).from('string value');
    }
    // test
    expect(test).toThrowError(
      'from(source) : source `string value` is not a function, nor a Promise'
    );
  });

  it('should turn callback error into callback error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from((cb) => {
        cb(new Error('NOPE'));
      });
    }
    // test
    var result = test((err) => {
      expect(err.message).toBe('NOPE');
    });
    expect(result).toBe(undefined);
  });

  it('should turn callback value into callback value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from((cb) => {
        cb(null, 'VALUE');
      });
    }
    // test
    var result = test((err, value) => {
      expect(err).toBe(null);
      expect(value).toBe('VALUE');
    });
    expect(result).toBe(undefined);
  });

  it('should turn callback error into promise error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from((cb) => {
        cb(new Error('NOPE'));
      });
    }
    // test
    return test()
      .then(throwIdentity)
      .catch((err) => {
        expect(err.message).toBe('NOPE');
      });
  });

  it('should turn callback value into promise value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from((cb) => {
        cb(null, 'VALUE');
      });
    }
    // test
    return test().then((value) => {
      expect(value).toBe('VALUE');
    });
  });

  it('should turn implicit promise error into promise error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(() => {
        throw new Error('NOPE');
      });
    }
    // test
    return test()
      .then(throwIdentity)
      .catch((err) => {
        expect(err.message).toBe('NOPE');
      });
  });

  it('should turn implicit promise value into promise value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(() => 'VALUE');
    }
    // test
    return test().then((value) => {
      expect(value).toBe('VALUE');
    });
  });

  it('should turn explicit promise error into promise error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(new Promise((resolve, reject) => {
        reject(new Error('NOPE'));
      }));
    }
    // test
    return test()
      .then(throwIdentity)
      .catch((err) => {
        expect(err.message).toBe('NOPE');
      });
  });

  it('should turn explicit promise value into promise value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(new Promise((resolve) => {
        resolve('VALUE');
      }));
    }
    // test
    return test().then((value) => {
      expect(value).toBe('VALUE');
    });
  });

  it('should turn implicit promise error into callback error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(() => {
        throw new Error('NOPE');
      });
    }
    // test
    return test((err, value) => {
      expect(err.message).toBe('NOPE');
      expect(value).toBe(undefined);
    });
  });

  it('should turn implicit promise value into callback value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(() => 'VALUE');
    }
    // test
    return test((err, value) => {
      expect(err).toBe(null);
      expect(value).toBe('VALUE');
    });
  });

  it('should turn explicit promise error into callback error', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(new Promise((resolve, reject) => {
        reject(new Error('NOPE'));
      }));
    }
    // test
    return test((err, value) => {
      expect(err.message).toBe('NOPE');
      expect(value).toBe(undefined);
    });
  });

  it('should turn explicit value into callback value', () => {
    // setup
    function test(callback) {
      return shifting(callback).from(new Promise((resolve) => {
        resolve('VALUE');
      }));
    }
    // test
    return test((err, value) => {
      expect(err).toBe(null);
      expect(value).toBe('VALUE');
    });
  });

});

describe('apply()', () => {

  it('should return callback from callback', (done) => {
    // setup
    function sum(augend, addend, cb) {
      cb(null, augend + addend);
    }
    // test
    shifting.apply(sum, [3, 4], (err, result) => {
      expect(err).toBe(null);
      expect(result).toBe(7);
      done();
    });
  });

  it('should return promise from callback', () => {
    // setup
    function sum(augend, addend, cb) {
      cb(null, augend + addend);
    }
    // test
    return shifting.apply(sum, [3, 4])
      .then((result) => {
        expect(result).toBe(7);
      });
  });

  it('should return callback from promise', (done) => {
    // setup
    function sum(augend, addend) {
      return Promise.resolve(augend + addend);
    }
    // test
    shifting.apply(sum, [3, 4], (err, result) => {
      expect(err).toBe(null);
      expect(result).toBe(7);
      done();
    });
  });

  it('should return promise from promise', () => {
    // setup
    function sum(augend, addend) {
      return Promise.resolve(augend + addend);
    }
    // test
    return shifting.apply(sum, [3, 4])
      .then((result) => {
        expect(result).toBe(7);
      });
  });

  it('should throw if function is not a function', () => {
    // setup
    var someObj = {};
    // test
    var test = () => shifting.apply(someObj.func, []);
    expect(test).toThrowError(/undefined is not a function/i);
  });

  it('should throw if args dont match function length', () => {
    // setup
    function sum(augend, addend) {
      return Promise.resolve(augend + addend);
    }
    // test
    var test = () => shifting.apply(sum, []);
    expect(test).toThrowError(/cannot determine how to call function/i);
  });

  it('should allow functions to just return value', () => {
    // setup
    function sum(augend, addend) {
      return augend + addend;
    }
    // test
    return shifting.apply(sum, [3, 4])
      .then((result) => {
        expect(result).toBe(7);
      });
  });

  it('should allow passing a context with a function', () => {
    // setup
    var log = {
      world: 'world',
      say(hello, callback) {
        callback(null, `${hello} ${this.world}!`);
      },
    };
    // test
    return shifting.apply([log, log.say], ['Hello'])
      .then((result) => {
        expect(result).toBe('Hello world!');
      });
  });

  it('should allow omitting args with callback', (done) => {
    // setup
    function helloWorld(cb) {
      cb(null, 'Hello world!');
    }
    // test
    return shifting.apply(helloWorld, (err, result) => {
      expect(err).toBe(null);
      expect(result).toBe('Hello world!');
      done();
    });
  });

  it('should allow omitting args with Promise', () => {
    // setup
    function helloWorld(cb) {
      cb(null, 'Hello world!');
    }
    // test
    return shifting.apply(helloWorld)
      .then((result) => {
        expect(result).toBe('Hello world!');
      });
  });

});

describe('call()', () => {

  it('call should return callback from callback', (done) => {
    // setup
    function sum(augend, addend, cb) {
      cb(null, augend + addend);
    }
    // test
    shifting.call(sum, 3, 4, (err, result) => {
      expect(err).toBe(null);
      expect(result).toBe(7);
      done();
    });
  });

  it('call should return promise from callback', () => {
    // setup
    function sum(augend, addend, cb) {
      cb(null, augend + addend);
    }
    // test
    return shifting.call(sum, 3, 4)
      .then((result) => {
        expect(result).toBe(7);
      });
  });

  it('call should return callback from promise', (done) => {
    // setup
    function sum(augend, addend) {
      return Promise.resolve(augend + addend);
    }
    // test
    shifting.call(sum, 3, 4, (err, result) => {
      expect(err).toBe(null);
      expect(result).toBe(7);
      done();
    });
  });

  it('call should return promise from promise', () => {
    // setup
    function sum(augend, addend) {
      return Promise.resolve(augend + addend);
    }
    // test
    return shifting.call(sum, 3, 4)
      .then((result) => {
        expect(result).toBe(7);
      });
  });

  it('call should allow omitting args', () => {
    // setup
    function helloWorld(cb) {
      cb(null, 'Hello world!');
    }
    // test
    return shifting.call(helloWorld)
      .then((result) => {
        expect(result).toBe('Hello world!');
      });
  });

});
