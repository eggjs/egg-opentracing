'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const sleep = require('mz-modules/sleep');
const SpanContext = require('../../lib/span_context');


describe('test/lib/tracer.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mm.app('apps/opentracing-app');
    await app.ready();
  });
  after(async () => {
    await app.close();
  });
  beforeEach(() => {
    ctx = app.mockContext();
  });

  describe('startSpan', () => {

    it('should start and finish', async () => {
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
    it('should inject with http carrier', async () => {
      const span = ctx.tracer.startSpan('test');
      span.setBaggageItem('a', 1);
      const carrier = {};
      ctx.tracer.inject(span, 'HTTP', carrier);
      assert(carrier['x-b3-traceId'] === span.traceId);
      assert(carrier['x-b3-spanId'] === span.spanId);
      assert(carrier['x-b3-baggage'] === '{"a":1}');
    });

    it('should inject custom carrier return undefined', async () => {
      app.opentracing.setCarrier('CUSTOM', class {
        inject() {}
        extract() {}
      });
      const span = ctx.tracer.startSpan('test');
      const carrier = {};
      ctx.tracer.inject(span, 'CUSTOM', carrier);
      assert(Object.keys(carrier).length === 0);
      assert(typeof carrier === 'object');

      ctx.tracer.inject(span, 'CUSTOM', null);
    });

    it('should inject carrier with argument spanContext', async () => {
      let spanContext;
      app.opentracing.setCarrier('CUSTOM', class {
        inject(s) {
          spanContext = s;
        }
        extract() {}
      });
      const span = ctx.tracer.startSpan('test');
      ctx.tracer.inject(span, 'CUSTOM', {});
      assert(spanContext instanceof SpanContext);
    });

    it('should throw when no carrier is matched', async () => {
      try {
        ctx.tracer.inject({}, 'RPC');
        throw new Error('should not run');
      } catch (err) {
        assert(err.message === 'RPC is unknown carrier');
      }
    });
  });

  describe('extract', () => {

    it('should throw when no carrier is matched', async () => {
      try {
        ctx.tracer.extract('RPC');
        throw new Error('should not run');
      } catch (err) {
        assert(err.message === 'RPC is unknown carrier');
      }
    });
  });

});
