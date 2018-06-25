'use strict';

const assert = require('assert');
const generateTraceId = require('./util/traceid').generate;

const BAGGAGES = Symbol('SpanContext#baggages');
const SPAN_ID_INDEX = Symbol('SpanContext#spanIdIndex');


class SpanContext {

  constructor(options = {}) {
    this[BAGGAGES] = new Map();
    this[SPAN_ID_INDEX] = 0;

    const parentSpanContext = options.parentSpanContext;

    let traceId;
    let spanId;

    if (parentSpanContext) {
      assert(parentSpanContext instanceof SpanContext, 'parentSpanContext should be SpanContext');
      traceId = parentSpanContext.traceId;
      spanId = parentSpanContext.nextSpanId;
      this.setBaggages(parentSpanContext.getBaggages());
    } else if (options.traceId && options.spanId) {
      traceId = options.traceId;
      spanId = options.spanId;
    } else {
      traceId = generateTraceId();
      spanId = '0';
      // spanId
    }

    this.traceId = traceId;
    this.spanId = spanId;
  }

  get nextSpanId() {
    return this.spanId + '.' + String(++this[SPAN_ID_INDEX]);
  }

  setBaggage(key, value) {
    if (!key) return;
    this[BAGGAGES].set(key, value);
  }

  getBaggage(key) {
    return this[BAGGAGES].get(key);
  }

  setBaggages(baggages) {
    if (!baggages) return;
    for (const key of Object.keys(baggages)) {
      this.setBaggage(key, baggages[key]);
    }
  }

  getBaggages() {
    const result = {};
    for (const [ key, value ] of this[BAGGAGES].entries()) {
      result[key] = value;
    }
    return result;
  }

}

module.exports = SpanContext;
