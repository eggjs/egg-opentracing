'use strict';

const OpenTracing = require('./lib/opentracing');


module.exports = app => {
  app.opentracing = new OpenTracing(app);

  const config = app.config.opentracing;
  for (const key of Object.keys(config.carrier)) {
    const carrier = config.carrier[key];
    if (carrier === false) continue;
    app.opentracing.setCarrier(key, carrier);
  }

  for (const key of Object.keys(config.collector)) {
    const collector = config.collector[key];
    if (collector === false) continue;
    app.opentracing.setCollector(key, collector);
  }

  logHTTPClient(app);
  logHTTPServer(app);
};

function logHTTPServer(app) {
  const httpServerSpan = Symbol('Context#httpServerSpan');
  app.on('request', ctx => {
    const spanContext = ctx.tracer.extract('HTTP', ctx.header);
    const span = ctx.tracer.startSpan('http.server', { childOf: spanContext });
    ctx[httpServerSpan] = span;
  });
  app.on('response', ctx => {
    const span = ctx[httpServerSpan];
    span.setTag('http.server.url', ctx.path);
    span.setTag('http.server.method', ctx.method);
    span.setTag('http.server.status', ctx.realStatus);
    span.setTag('http.server.request.size', ctx.get('content-length') || 0);
    span.setTag('http.server.response.size', ctx.length || 0);
    span.finish();
  });
}

function logHTTPClient(app) {
  const httpClientSpan = Symbol('Context#httpClientSpan');
  app.httpclient.on('request', req => {
    let ctx = req.ctx;
    if (!ctx) {
      ctx = app.createAnonymousContext();
      req.ctx = ctx;
    }

    const args = req.args;
    if (!args.headers) args.headers = {};
    const span = ctx.tracer.startSpan('http_client');
    ctx.tracer.inject(span.context(), 'HTTP', args.headers);
    ctx[httpClientSpan] = span;
  });

  app.httpclient.on('response', ({ req, res }) => {
    const ctx = req.ctx;
    const span = ctx[httpClientSpan];
    span.setTag('http.client.url', req.url);
    span.setTag('http.client.method', req.options.method);
    span.setTag('http.client.status', res.status);
    span.setTag('http.client.request.size', req.size || 0);
    span.setTag('http.client.response.size', res.size || 0);
    span.finish();
  });
}
