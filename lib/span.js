'use strict';

const Span = require('opentracing').Span;
const SpanContext = require('./span_context');

const context = Symbol('EggSpan#context');
const parentContext = Symbol('EggSpan#parentContext');


class EggSpan extends Span {

  constructor(ctx, options) {
    super();

    this.ctx = ctx;
    this.startTime = Date.now();
    this.finishTime = null;

    let parentSpanContext;
    if (options.references.length) {
      parentSpanContext = options.references[0].referencedContext();
    }
    this[parentContext] = parentSpanContext;

    const contextOptions = {};
    if (parentSpanContext) contextOptions.traceId = parentSpanContext.traceId;
    this[context] = new SpanContext(contextOptions);
  }

  get spanId() {
    return this[context].spanId;
  }

  get parentSpanId() {
    return this[parentContext] ? this[parentContext].spanId : '';
  }

  _context() {
    return this[context];
  }

  _tracer() {
    return this.ctx.tracer;
  }

  _setOperationName(name) {
    this.setTag('operationName', name);
  }

  _setBaggageItem(key, value) {
    this[context].setBaggage(key, value);
  }

  _getBaggageItem(key) {
    return this[context].getBaggage(key);
  }

  _addTags(tags) {
    for (const key of Object.keys(tags)) {
      this[context].setTag(key, tags[key]);
    }
  }

  _finish(finishTime) {
    this.finishTime = finishTime || Date.now();
    this.ctx.app.opentracing.collect(this);
  }

}

module.exports = EggSpan;
