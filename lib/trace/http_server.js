'use strict';

const httpServerSpan = Symbol('Context#httpServerSpan');

module.exports = function logHTTPServer(app) {
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
    /* istanbul ignore if */
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
};
