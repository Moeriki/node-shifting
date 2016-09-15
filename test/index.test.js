'use strict';

// modules

const shifting = require('../lib');

// private functions

const throwIdentity = (arg) => {
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
    const result = test((err) => {
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
    const result = test((err, value) => {
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
