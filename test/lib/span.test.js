'use strict';

const assert = require('assert');
const mm = require('egg-mock');
const Span = require('../../lib/span');
const SpanContext = require('../../lib/span_context');


describe('test/lib/span.test.js', () => {
  let app;
  let ctx;
  before(async () => {
    app = mm.app({
      baseDir: 'apps/opentracing-app',
    });
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
    assert(span.finishTime >= span.startTime);
  });

  it('should ceate span with parent', () => {
    const parentSpan = new Span(ctx);
    parentSpan.setBaggageItem('a', 1);

    const span1 = new Span(ctx, { parentSpan });
    assert(span1.traceId === parentSpan.traceId);
    assert(span1.parentSpanId === parentSpan.spanId);
    assert(span1.spanId !== parentSpan.spanId);
    assert(span1.getBaggageItem('a') === 1);

    const span = new Span(ctx, { parentSpan: parentSpan.context() });
    assert(span.traceId === parentSpan.traceId);
    assert(span.parentSpanId === parentSpan.spanId);
    assert(span.spanId !== parentSpan.spanId);
    assert(span.getBaggageItem('a') === 1);
  });

  it('should ignore unknown parent span', () => {
    const span = new Span(ctx, { parentSpan: {} });
    assert(!span.parentSpanId);
  });

  it('should create operationName to tag', () => {
    const span = new Span(ctx);
    span.setOperationName('http');
    assert(span.name === 'http');
  });

  it('should setTag/getTag', () => {
    const span1 = new Span(ctx);
    span1.setTag('a', 1);
    span1.setTag('b', 2);
    assert(span1.getTag('a') === 1);
    assert.deepEqual(span1.getTags(), {
      a: 1,
      b: 2,
      component: 'egg',
      appname: 'opentracing-test',
      'process.id': process.pid,
      'worker.id': 0,
    });

    const span2 = new Span(ctx);
    span2.addTags({ a: 1, b: 2 });
    assert(span2.getTag('a') === 1);
    assert(span2.getTag('b') === 2);

    const span3 = new Span(ctx);
    span3.setTag('', 1);
    assert.deepEqual(span3.getTags(), {
      component: 'egg',
      appname: 'opentracing-test',
      'process.id': process.pid,
      'worker.id': 0,
    });
  });

  it('should generate spanId', () => {
    // 0
    const span1 = new Span(ctx);
    // span1 -> span2 0.1
    const span2 = new Span(ctx, { parentSpan: span1 });
    // span1 -> span3 0.2
    const span3 = new Span(ctx, { parentSpan: span1 });
    // span2 -> span4 0.1.1
    const span4 = new Span(ctx, { parentSpan: span2 });
    // span2 -> span5 0.1.2
    const span5 = new Span(ctx, { parentSpan: span2 });
    // span3 -> span6 0.2.1
    const span6 = new Span(ctx, { parentSpan: span3 });

    assert(span1.rpcId === '0');
    assert(span2.rpcId === '0.1');
    assert(span3.rpcId === '0.2');
    assert(span4.rpcId === '0.1.1');
    assert(span5.rpcId === '0.1.2');
    assert(span6.rpcId === '0.2.1');
  });

  it('should generate traceId', () => {
    let span = new Span(ctx);
    while (!/9000\w*$/.test(span.traceId)) {
      span = new Span(ctx);
    }

    // The increment ID is between 1000 and 9000,
    // and the next one is 1000
    span = new Span(ctx);
    assert(/1000\w*$/.test(span.traceId));
  });
});
