'use strict';

const assert = require('assert');

module.exports = app => {
  app.get('/c1', async ctx => {
    const result = await ctx.curl(process.env.HOST + '/c2', {
      dataType: 'json',
    });
    ctx.body = result.data;
  });

  app.get('/c2', async ctx => {
    ctx.tracer.currentSpan.setBaggageItem('a', 1);
    const result = await ctx.curl(process.env.HOST + '/c3');
    ctx.body = result.data;
  });

  app.get('/c3', async ctx => {
    ctx.body = ctx.tracer.currentSpan.context().getBaggages();
  });

  app.get('/checkSpan', async ctx => {
    const spans = ctx.app.config.spans;
    assert(spans.length === 5);
    assert(spans[0].traceId === spans[1].traceId);
    assert(spans[1].traceId === spans[2].traceId);
    assert(spans[2].traceId === spans[3].traceId);
    assert(spans[3].traceId === spans[4].traceId);

    assert(spans[4].spanId === spans[3].parentSpanId);
    assert(spans[3].spanId === spans[2].parentSpanId);
    assert(spans[2].spanId === spans[1].parentSpanId);
    assert(spans[1].spanId === spans[0].parentSpanId);

    ctx.body = 'success';
  });

  app.get('/httpserver', async ctx => {
    ctx.body = 'done';
  });

  app.get('/app_curl', async ctx => {
    ctx.body = await app.curl('http://www.alibaba.com');
  });

  app.get('/ctx_curl', async ctx => {
    ctx.body = await ctx.curl('http://www.alibaba.com');
  });
};
