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
    span.setTag('span.kind', 'server');
    ctx[httpServerSpan] = span;
  });
  app.on('response', ctx => {
    const socket = ctx.req.connection;

    const span = ctx[httpServerSpan];
    // TODO: what's the service name of the remote server
    // span.setTag('peer.service');
    span.setTag('peer.port', socket.remotePort);
    /* istanbul ignore else */
    if (socket.remoteFamily === 'IPv4') {
      span.setTag('peer.ipv4', socket.remoteAddress);
    } else if (socket.remoteFamily === 'IPv6') {
      span.setTag('peer.ipv6', socket.remoteAddress);
    }
    span.setTag('http.url', ctx.path);
    span.setTag('http.method', ctx.method);
    span.setTag('http.status_code', ctx.realStatus);
    span.setTag('http.request_size', ctx.get('content-length') || 0);
    span.setTag('http.response_size', ctx.length || 0);
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
    span.setTag('span.kind', 'client');
    ctx.tracer.inject(span.context(), 'HTTP', args.headers);
    ctx[httpClientSpan] = span;
  });

  app.httpclient.on('response', ({ req, res }) => {
    const ctx = req.ctx;
    const span = ctx[httpClientSpan];
    const address = req.socket.address();
    span.setTag('peer.hostname', req.options.host);
    span.setTag('peer.port', req.options.port);
    span.setTag('peer.service', req.options.host);
    /* istanbul ignore else */
    if (address.family === 'IPv4') {
      span.setTag('peer.ipv4', address.address);
    } else if (address.family === 'IPv6') {
      span.setTag('peer.ipv6', address.address);
    }
    span.setTag('http.url', req.url);
    span.setTag('http.method', req.options.method);
    span.setTag('http.status_code', res.status);
    span.setTag('http.request_size', req.size || 0);
    span.setTag('http.response_size', res.size || 0);
    span.finish();
  });
}
