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

- Integrate httpserver and httpclient span
- Customize carrier
- Customize collector

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

### Configuration

see [config/config.default.js](config/config.default.js) for more detail.

### Start a span

You can start a span by `startSpan` with operationName

```js
const span = ctx.tracer.startSpan('request_egg');
await ctx.curl('https://eggjs.org');
span.finish();
```

**Note: httpclient has been supported by default**

### Customize carrier

Carrier can be [injected](https://github.com/opentracing/specification/blob/master/specification.md#inject-a-spancontext-into-a-carrier) and [extracted](https://github.com/opentracing/specification/blob/master/specification.md#extract-a-spancontext-from-a-carrier), so you can define a class for that.

```js
// lib/rpc_carrier.js
class RPCCarrier {
  inject(spanContext) {
    return {};
  }

  extract(carrier) {
    return {
      // traceId,
      // spanId,
      // baggage,
    }
  }
}
```

Then configure it in `config/config.default.js` with a format name.

```js
// config/config.default.js
exports.opentracing = {
  carrier: {
    RPC: require('../lib/rpc_carrier'),
  },
};
```

After that, you can use the format to inject or extract.

```js
// inject
const span = ctx.tracer.startSpan('rpc');
const carrier = {};
ctx.tracer.inject(span, 'RPC', carrier);
await ctx.rpc.invoke({}, { carrier });
span.finish();
```

### Customize collector

Collector will be triggered when span finished, you can implement it to write logs or report to server.

```js
// lib/log_collector.js
class LogCollector {
  constructor(app) {
    this.app = app;
  }

  collect(span) {
    this.app.logger.info('%s,%s', span.traceId, span.spanId);
  }
}
```

Then configure it in `config/config.default.js`.

```js
// config/config.default.js
exports.opentracing = {
  collector: {
    log: require('../lib/log_collector'),
  },
};
```

Note: zipkin collector has been implemented in [egg-zipkin](https://github.com/eggjs/egg-zipkin/).

## API

### Tracer

Tracer extends [Tracer of opentracing](https://opentracing-javascript.surge.sh/classes/tracer.html), you can get the instance by `ctx.tracer`.

### Span

Span extends [Span of opentracing](https://opentracing-javascript.surge.sh/classes/span.html), it's instantiated by `ctx.tracer.startSpan`.

- {String} name: operation name
- {String} traceId: the traceId of the span
- {String} spanId: the id of the span
- {String} parentSpanId: the id of parent span, it will be `''` if there's no parent span.
- {String} getTag(key): return the value of the specified tag
- {Object} getTags(): return all tags

### SpanContext

SpanContext extends [SpanContext of opentracing](https://opentracing-javascript.surge.sh/classes/spancontext.html), it's instantiated by `span.context()`.

- {String} traceId: the traceId of the span
- {String} spanId: the id of the span
- {Void} setBaggage(key, value): set one baggage
- {String} getBaggage(key): return the value of the specified baggage
- {Void} setBaggages(baggages): set multiple baggages
- {Object} getBaggages(): return all baggages

### Carrier

Carrier is a class that transform between SpanContext and carrier.

- {Object} inject(SpanContext): implement this method that transform SpanContext to carrier object.
- {Object} extract(carrier): implement this method that transform carrier object to SpanContext, extract must return traceId and spanId.

### Collector

- {Void} collect(span): implement this method that report span.

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
