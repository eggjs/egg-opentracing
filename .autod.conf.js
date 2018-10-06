'use strict';

module.exports = {
  write: true,
  prefix: '^',
  plugin: 'autod-egg',
  test: [
    'test',
    'benchmark',
  ],
  devdep: [
    'egg',
    'egg-ci',
    'egg-bin',
    'autod',
    'autod-egg',
    'eslint',
    'eslint-config-egg',
    'egg-rpc-generator',
    'webstorm-disable-index',
  ],
  exclude: [
    './docs',
    './coverage',
  ],
};
