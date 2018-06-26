'use strict';

const path = require('path');

module.exports = (appInfo, appConfig) => {
  const config = {};

  config.opentracing = {
    /**
     * egg-opentracing default config
     * @member Config#opentracing
     * @property {String} SOME_KEY - some description
     */
    globalTracer: require('../lib/tracer'),
    carrier: {
      HTTP: require('../lib/carrier/http_carrier'),
    },
    collector: {
      log: require('../lib/collector/log_collector'),
    },
  };

  const isLogCollectorDisabled = checkDisableLogCollector(appConfig);

  if (!isLogCollectorDisabled) {
    config.customLogger = {
      opentracingLogger: {
        file: path.join(appInfo.root, 'logs', appInfo.name, 'opentracing.log'),
        consoleLevel: 'NONE',
      },
    };
  }

  return config;
};

function checkDisableLogCollector(appConfig) {
  if (!appConfig.opentracing) return false;
  if (!appConfig.opentracing.collector) return false;
  return appConfig.opentracing.collector.log === false;
}
