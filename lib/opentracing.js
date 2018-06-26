'use strict';

const assert = require('assert');
const Span = require('./span');

const CARRIER = Symbol('OpenTracing#CARRIER');
const COLLECTOR = Symbol('OpenTracing#COLLECTOR');


class OpenTracing {
  constructor(app) {
    this.app = app;
    this[CARRIER] = new Map();
    this[COLLECTOR] = new Map();
  }

  setCollector(key, Collector) {
    assert(Collector && Collector.prototype.collect,
      'Collector should implement collect');
    this[COLLECTOR].set(key, new Collector(this.app));
  }

  collect(span) {
    if (!(span instanceof Span)) return;

    process.nextTick(() => {
      try {
        for (const collector of this[COLLECTOR].values()) {
          collector.collect(span);
        }
      } catch (err) {
        this.app.logger.error(err);
      }
    });
  }

  setCarrier(key, Carrier) {
    assert(Carrier && Carrier.prototype.inject && Carrier.prototype.extract,
      'Collector should implement collect');
    this[CARRIER].set(key, new Carrier());
  }

  getCarrier(key) {
    return this[CARRIER].get(key);
  }

}

module.exports = OpenTracing;
