'use strict';

const Tracer = require('opentracing').Tracer;
const childOf = require('opentracing').childOf;
const Span = require('./span');


class EggTracer extends Tracer {

  constructor(ctx) {
    super();
    this.ctx = ctx;
    this.currentSpan = null;
  }

  _startSpan(name, spanOptions) {
    const options = Object.assign({}, spanOptions, { name });

    options.references = options.references || [];
    if (!options.references.length && this.currentSpan) {
      options.references.push(childOf(this.currentSpan));
    }

    const span = new Span(this.ctx, options);
    if (!this.traceId) this.traceId = span.traceId;
    if (!this.currentSpan) this.currentSpan = span;
    return span;
  }

  _inject(spanContext, format, carrier) {

  }

  _extract(format, carrier) {

  }

}

module.exports = EggTracer;

class Application {
  constructor() {
    global[Symbol.for('app')] = this;
  }
}
