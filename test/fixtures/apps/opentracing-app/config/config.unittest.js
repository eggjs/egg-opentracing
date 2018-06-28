'use strict';

module.exports = () => {
  const config = {};
  config.keys = '123456';
  config.spans = [];
  config.opentracing = {
    collector: {
      test: class Collector {
        collect(span) {
          config.spans.push(span);
        }
      },
    },
  };
  return config;
};
