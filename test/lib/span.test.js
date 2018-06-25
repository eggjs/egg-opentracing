'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const Span = require('../../lib/span');
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

  it('should pass ctx', () => {
    assert.throws(() => {
      new Span();
    }, /ctx is required/);
  });

  it('should create span', () => {
    const span = new Span(ctx);
    assert(span.ctx === ctx);
    assert(typeof span.startTime === 'number');
    assert(span.finishTime === null);
    assert(span.traceId);
    assert(span.spanId);
    assert(span.parentSpanId === '');
    assert(span.tracer() === ctx.tracer);

    const spanContext = span.context();
    assert(spanContext instanceof SpanContext);
    assert(spanContext.spanId === span.spanId);
    assert(spanContext.traceId === span.traceId);

    span.finish();
    assert(typeof span.finishTime === 'number');
    assert(span.finishTime > span.startTime);
  });

  it('should ceate span with parent', () => {
    const parentSpan = new Span(ctx);
    parentSpan.setBaggageItem('a', 1);

    const span1 = new Span(ctx, { parentSpan });
    assert(span1.traceId === parentSpan.traceId);
    assert(span1.parentSpanId === parentSpan.spanId);
    // TODO: spanId generate
    assert(span1.spanId !== parentSpan.spanId);
    assert(span1.getBaggageItem('a') === 1);

    const span = new Span(ctx, { parentSpan: parentSpan.context() });
    assert(span.traceId === parentSpan.traceId);
    assert(span.parentSpanId === parentSpan.spanId);
    // TODO: spanId generate
    assert(span.spanId !== parentSpan.spanId);
    assert(span.getBaggageItem('a') === 1);
  });

  it('should create operationName to tag', () => {
    const span = new Span(ctx);
    span.setOperationName('http');
    assert(span.getTag('operationName') === 'http');
  });

  it('should setTag/getTag', () => {
    const span = new Span(ctx);
    span.setTag('a', 1);
    span.setTag('b', 2);
    assert(span.getTag('a') === 1);
    assert.deepEqual(span.getTags(), { a: 1, b: 2 });
  });

});
