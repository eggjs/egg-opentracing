'use strict';

const _span = Symbol.for('Request#span');

module.exports = function logHTTPClient(app) {
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
    req[_span] = span;
  });

  app.httpclient.on('response', ({ req, res }) => {
    const span = req[_span];
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
};
