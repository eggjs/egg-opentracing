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
    const span = ctx.tracer.startSpan('http_server', { childOf: spanContext });
    ctx[httpServerSpan] = span;
  });
  app.on('response', ctx => {
    const span = ctx[httpServerSpan];
    span.setTag('http_server_url', ctx.path);
    span.setTag('http_server_method', ctx.method);
    span.setTag('http_server_method', ctx.realStatus);
    span.setTag('http_server_request_size', ctx.get('content-length') || 0);
    span.setTag('http_server_response_size', ctx.length || 0);
    span.finish();
  });
}

function logHTTPClient(app) {
  const httpClientSpan = Symbol('Context#httpClientSpan');
  app.httpclient.on('request', ({ ctx, args }) => {
    if (!args.headers) args.headers = {};
    const span = ctx.tracer.startSpan('http_client');
    ctx.tracer.inject(span.context(), 'HTTP', args.headers);
    ctx[httpClientSpan] = span;
  });

  app.httpclient.on('response', ({ ctx, req, res }) => {
    const span = ctx[httpClientSpan];
    span.setTag('http_client_url', req.url);
    span.setTag('http_client_method', req.method);
    span.setTag('http_client_method', req.status);
    span.setTag('http_client_request_size', req.size || 0);
    span.setTag('http_client_response_size', res.size || 0);
    span.finish();
  });
}
