'use strict';

const assert = require('assert');
const Tracer = require('opentracing').Tracer;
const childOf = require('opentracing').childOf;
const Span = require('./span');
const SpanContext = require('./span_context');


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
    const carrierInstance = this.ctx.app.opentracing.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    Object.assign(carrier, carrierInstance.inject(spanContext));
  }

  _extract(format, carrier) {
    const carrierInstance = this.ctx.app.opentracing.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    const result = carrierInstance.extract(carrier);
    if (!(result.traceId && result.spanId)) return;

    const spanContext = new SpanContext({
      traceId: result.traceId,
      spanId: result.spanId,
    });
    if (result.baggage) {
      for (const key of Object.keys(result.baggage)) {
        spanContext.setBaggage(key, result.baggage[key]);
      }
    }
    return spanContext;
  }

}

module.exports = EggTracer;
