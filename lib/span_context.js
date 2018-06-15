'use strict';

const tags = Symbol('SpanContext#tags');
const baggages = Symbol('SpanContext#baggages');
const generateTraceId = require('./util/traceid').generate;


class SpanContext {

  constructor(options = {}) {
    this[tags] = new Map();
    this[baggages] = new Map();

    this.spanId = Date.now();
    this.traceId = options.traceId || generateTraceId();
    this.rpcId = '111';
  }

  setTag(key, value) {
    if (!key) return;
    this[tags].set(key, value);
  }

  getTag(key) {
    return this[tags].get(key);
  }

  getTags() {
    const result = {};
    for (const [ key, value ] of this[tags].entries()) {
      result[key] = value;
    }
    return result;
  }

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
