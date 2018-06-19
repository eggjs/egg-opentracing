'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const sleep = require('mz-modules/sleep');
const SpanContext = require('../../lib/span_context');


describe('test/lib/tracer.test.js', () => {
  let app;
  before(async () => {
    app = mm.app('apps/opentracing-app');
    await app.ready();
  });
  after(async () => {
    await app.close();
  });

  describe('startSpan', () => {

    it('should start and finish', async () => {
      const ctx = app.mockContext();
      const span = ctx.tracer.startSpan('test');
      await sleep(1);
      span.finish();
      assert(typeof span.startTime === 'number');
      assert(typeof span.finishTime === 'number');
      assert(span.finishTime > span.startTime);
      const spanContext = span.context();
      assert(spanContext instanceof SpanContext);
      assert(span === ctx.tracer.currentSpan);
      assert(ctx.tracer.traceId === span.traceId);
      assert(span.parentSpanId === '');
      assert(span.getTag('operationName') === 'test');
    });

    it('should startSpan from existing span', async () => {
      const ctx = app.mockContext();
      const span1 = ctx.tracer.startSpan('test1');
      await sleep(1);
      const span2 = ctx.tracer.startSpan('test2', { childOf: span1 });
      await sleep(1);
      span2.finish();
      await sleep(1);
      span1.finish();
      assert(span1.traceId === span2.traceId);
      assert(span1.spanId === span2.parentSpanId);
    });

    it('should startSpan from current span', async () => {
      const ctx = app.mockContext();
      const span1 = ctx.tracer.startSpan('test1');
      await sleep(1);
      const span2 = ctx.tracer.startSpan('test2');
      await sleep(1);
      span2.finish();
      await sleep(1);
      span1.finish();
      assert(span1 === ctx.tracer.currentSpan);
      assert(span1.traceId === span2.traceId);
      assert(span1.spanId === span2.parentSpanId);
    });
  });

  describe('inject', () => {

  });

  describe('extract', () => {

  });

});
