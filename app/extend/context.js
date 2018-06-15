'use strict';

const TRACER = Symbol('Context#tracer');


module.exports = {
  get tracer() {
    if (this[TRACER]) return this[TRACER];
    const Tracer = this.app.config.opentracing.globalTracer;
    const tracer = this[TRACER] = new Tracer(this);
    return tracer;
  },
};
