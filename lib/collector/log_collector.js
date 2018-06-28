'use strict';

class LogCollector {
  constructor(app) {
    this.logger = app.getLogger('opentracingLogger');
  }

  collect(span) {
    const result = {
      spanId: span.spanId,
      traceId: span.traceId,
    };
    const tags = span.getTags();
    const baggages = span.context().getBaggages();
    Object.assign(result, tags, baggages);
    this.logger.write(JSON.stringify(result));
  }
}

module.exports = LogCollector;
