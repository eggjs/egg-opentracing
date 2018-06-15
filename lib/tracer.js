'use strict';

const Tracer = require('opentracing').Tracer;
const Span = require('./span');


class EggTracer extends Tracer {

  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  _startSpan(name, spanOptions) {
    const options = Object.assign({}, spanOptions, { name });
    const span = new Span(this.ctx, options);
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
