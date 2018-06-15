'use strict';

const Span = require('opentracing').Span;
const SpanContext = require('./span_context');

const context = Symbol('EggSpan#context');

class EggSpan extends Span {

  constructor(ctx, options) {
    super();
    this[context] = new SpanContext();
    this.ctx = ctx;
    this.startTime = Date.now();
    this.finishTime = null;
  }

  get spanId() {
    return this[context].spanId;
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
  }

}

module.exports = EggSpan;
