'use strict';

const assert = require('assert');
const Tracer = require('opentracing').Tracer;
const Span = require('./span');
const SpanContext = require('./span_context');


class EggTracer extends Tracer {

  constructor(ctx) {
    super();
    this.ctx = ctx;
    this.currentSpan = null;
  }

  _startSpan(name, options = {}) {
    assert(name, 'name is required when startSpan');

    const spanOptions = {};
    if (options.references && options.references.length) {
      spanOptions.parentSpan = options.references[0].referencedContext();
    } else if (this.currentSpan) {
      spanOptions.parentSpan = this.currentSpan;
    }

    const span = new Span(this.ctx, spanOptions);
    span.setOperationName(name);
    if (!this.traceId) this.traceId = span.traceId;
    if (!this.currentSpan) this.currentSpan = span;
    return span;
  }

  _inject(spanContext, format, carrier) {
    carrier = carrier || {};
    const carrierInstance = this.ctx.app.opentracing.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    Object.assign(carrier, carrierInstance.inject(spanContext));
  }

  _extract(format, carrier) {
    const carrierInstance = this.ctx.app.opentracing.getCarrier(format);
    assert(carrierInstance, `${format} is unknown carrier`);
    const result = carrierInstance.extract(carrier);
    if (!(result.traceId && result.spanId)) return null;

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
