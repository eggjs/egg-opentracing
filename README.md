# egg-opentracing

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-opentracing.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-opentracing
[travis-image]: https://img.shields.io/travis/eggjs/egg-opentracing.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-opentracing
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-opentracing.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-opentracing?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-opentracing.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-opentracing
[snyk-image]: https://snyk.io/test/npm/egg-opentracing/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-opentracing
[download-image]: https://img.shields.io/npm/dm/egg-opentracing.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-opentracing

Implementation of [opentracing](http://opentracing.io/) in Egg.js

## Install

```bash
$ npm i egg-opentracing --save
```

## Usage

```js
// {app_root}/config/plugin.js
exports.opentracing = {
  enable: true,
  package: 'egg-opentracing',
};
```

## Configuration

```js
// {app_root}/config/config.default.js
exports.opentracing = {
};
```

see [config/config.default.js](config/config.default.js) for more detail.

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
