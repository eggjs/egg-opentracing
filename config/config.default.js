'use strict';

/**
 * egg-opentracing default config
 * @member Config#opentracing
 * @property {String} SOME_KEY - some description
 */
exports.opentracing = {
  globalTracer: require('../lib/tracer'),
  carrier: {
    HTTP: require('../lib/carrier/http_carrier'),
  },
  collector: {
    log: require('../lib/collector/log_collector'),
  },
};
