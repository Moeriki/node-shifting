module.exports = {
  root: true,
  extends: [
    'muriki',
    'muriki/env/common-js',
    'muriki/es/2015-node4',
  ],
  globals: {
    Promise: false,
  },
};
