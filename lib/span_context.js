'use strict';

const tags = Symbol('SpanContext#tags');
const baggages = Symbol('SpanContext#baggages');
const generateTraceId = require('./util/traceid').generate;


class SpanContext {

  constructor(options = {}) {
    this[tags] = new Map();
    this[baggages] = new Map();

    this.spanId = options.spanId || String(process.hrtime());
    this.traceId = options.traceId || generateTraceId();

    if (options.baggages) {
      for (const key of Object.keys(options.baggages)) {
        this.setBaggage(key, options.baggages[key]);
      }
    }
  }

  // get nextSpanId() {
  //
  // }

  setBaggage(key, value) {
    if (!key) return;
    this[baggages].set(key, value);
  }

  getBaggage(key) {
    return this[baggages].get(key);
  }

  getBaggages() {
    const result = {};
    for (const [ key, value ] of this[baggages].entries()) {
      result[key] = value;
    }
    return result;
  }

}

module.exports = SpanContext;
