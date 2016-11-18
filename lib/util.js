'use strict';

// vendor modules

var fnArgs = require('fn-args');

// exports

function fnLength(func) {
  return fnArgs(func).length;
}

module.exports = { fnLength: fnLength };
