'use strict';

const assert = require('assert');
const generateTraceId = require('./util/traceid').generate;
const generateSpanId = require('./util/spanid').generate;

const BAGGAGES = Symbol('SpanContext#baggages');
const RPC_ID_INDEX = Symbol('SpanContext#rpcIdIndex');


class SpanContext {

  constructor(options) {
    this[BAGGAGES] = new Map();
    this[RPC_ID_INDEX] = 0;

    const parentSpanContext = options.parentSpanContext;

    let traceId;
    let spanId;
    let rpcId;

    if (parentSpanContext) {
      // from a parent context
      assert(parentSpanContext instanceof SpanContext, 'parentSpanContext should be SpanContext');
      traceId = parentSpanContext.traceId;
      spanId = generateSpanId();
      rpcId = parentSpanContext.nextRpcId;
      this.setBaggages(parentSpanContext.getBaggages());
    } else if (options.traceId && options.spanId) {
      // from extracted context
      traceId = options.traceId;
      spanId = options.spanId;
      rpcId = options.rpcId;

      if (options.baggages) {
        this.setBaggages(options.baggages);
      }
    } else {
      // default context
      traceId = generateTraceId();
      spanId = generateSpanId();
      rpcId = '0';
    }

    this.traceId = traceId;
    this.spanId = spanId;
    this.rpcId = rpcId;
  }

  get nextRpcId() {
    return this.rpcId + '.' + String(++this[RPC_ID_INDEX]);
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
