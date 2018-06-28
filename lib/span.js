'use strict';

const assert = require('assert');
const cluster = require('cluster');
const Span = require('opentracing').Span;
const SpanContext = require('./span_context');

const CONTEXT = Symbol('EggSpan#context');
const TAGS = Symbol('EggSpan#tags');
const PARENT_CONTEXT = Symbol('EggSpan#parentContext');
const WORKER_ID = cluster.worker && cluster.worker.id || 0;


class EggSpan extends Span {

  constructor(ctx, options = {}) {
    assert(ctx, 'ctx is required');

    super();

    this.ctx = ctx;
    this.startTime = Date.now();
    this.finishTime = null;
    this[TAGS] = new Map();

    let parentSpanContext;
    if (options.parentSpan) {
      if (options.parentSpan instanceof SpanContext) {
        parentSpanContext = options.parentSpan;
      } else if (options.parentSpan instanceof Span) {
        parentSpanContext = options.parentSpan.context();
      }
    }
    this[PARENT_CONTEXT] = parentSpanContext;

    this[CONTEXT] = new SpanContext({ parentSpanContext });

    // default tags
    const appname = ctx.app.config.name;
    this.setTag('component', 'egg');
    this.setTag('appname', appname);
    this.setTag('worker.id', WORKER_ID);
    this.setTag('process.id', process.pid);
  }

  get traceId() {
    return this[CONTEXT].traceId;
  }

  get spanId() {
    return this[CONTEXT].spanId;
  }

  get rpcId() {
    return this[CONTEXT].rpcId;
  }

  get parentSpanId() {
    return this[PARENT_CONTEXT] ? this[PARENT_CONTEXT].spanId : '';
  }

  _context() {
    return this[CONTEXT];
  }

  _tracer() {
    return this.ctx.tracer;
  }

  _setOperationName(name) {
    this.name = name;
  }

  _setBaggageItem(key, value) {
    this[CONTEXT].setBaggage(key, value);
  }

  _getBaggageItem(key) {
    return this[CONTEXT].getBaggage(key);
  }

  _addTags(tags) {
    for (const key of Object.keys(tags)) {
      if (!key) continue;
      this[TAGS].set(key, tags[key]);
    }
  }

  getTag(key) {
    return this[TAGS].get(key);
  }

  getTags() {
    const result = {};
    for (const [ key, value ] of this[TAGS].entries()) {
      result[key] = value;
    }
    return result;
  }

  _finish(finishTime) {
    this.finishTime = finishTime || Date.now();
    this.ctx.app.opentracing.collect(this);
  }

}

module.exports = EggSpan;
