'use strict';

const Span = require('opentracing').Span;
const SpanContext = require('./span_context');

const CONTEXT = Symbol('EggSpan#context');
const TAGS = Symbol('EggSpan#tags');
const PARENT_CONTEXT = Symbol('EggSpan#parentContext');


class EggSpan extends Span {

  constructor(ctx, options = {}) {
    super();

    this.ctx = ctx;
    this.startTime = Date.now();
    this.finishTime = null;
    this[TAGS] = new Map();

    let parentSpanContext;
    if (options.references.length) {
      parentSpanContext = options.references[0].referencedContext();
    }
    this[PARENT_CONTEXT] = parentSpanContext;

    const contextOptions = {};
    if (parentSpanContext) {
      contextOptions.traceId = parentSpanContext.traceId;
      contextOptions.baggages = parentSpanContext.getBaggages();
    }
    this[CONTEXT] = new SpanContext(contextOptions);
  }

  get spanId() {
    return this[CONTEXT].spanId;
  }

  get parentSpanId() {
    return this[PARENT_CONTEXT] ? this[PARENT_CONTEXT].spanId : '';
  }

  _context() {
    return this[CONTEXT];
  }

  _tracer() {
    return this.ctx.tracer;
  }

  _setOperationName(name) {
    this.setTag('operationName', name);
  }

  _setBaggageItem(key, value) {
    this[CONTEXT].setBaggage(key, value);
  }

  _getBaggageItem(key) {
    return this[CONTEXT].getBaggage(key);
  }

  _addTags(tags) {
    for (const key of Object.keys(tags)) {
      if (!key) continue;
      this[TAGS].set(key, tags[key]);
    }
  }

  getTag(key) {
    return this[TAGS].get(key);
  }

  getTags() {
    const result = {};
    for (const [ key, value ] of this[TAGS].entries()) {
      result[key] = value;
    }
    return result;
  }

  _finish(finishTime) {
    this.finishTime = finishTime || Date.now();
    this.ctx.app.opentracing.collect(this);
  }

}

module.exports = EggSpan;
