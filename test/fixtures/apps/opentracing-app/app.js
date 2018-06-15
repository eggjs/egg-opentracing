'use strict';

module.exports = app => {
  const httpServerSpan = Symbol('Context#httpServerSpan');
  app.on('request', ctx => {
    const spanContext = ctx.tracer.extract('HTTP', ctx.header);
    const span = ctx.tracer.startSpan('http_server', { childOf: spanContext });
    console.log(span);
    ctx[httpServerSpan] = span;
  });
  app.on('response', ctx => {
    ctx[httpServerSpan].finish();
  });

  const httpClientSpan = Symbol('Context#httpClientSpan');
  app.httpclient.on('request', ({ ctx, args }) => {
    if (!args.headers) args.headers = {};
    const span = ctx.tracer.startSpan('http_client');
    span.setBaggageItem('a', 1);
    ctx.tracer.inject(span.context, 'HTTP', args.headers);
    console.log(span);
    ctx[httpClientSpan] = span;
  });

  app.httpclient.on('response', ({ ctx }) => {
    ctx[httpClientSpan].finish();
  });

};
