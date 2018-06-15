'use strict';

const OpenTracing = require('./lib/opentracing');


module.exports = app => {
  app.opentracing = new OpenTracing(app);

  const config = app.config.opentracing;
  for (const key of Object.keys(config.carrier)) {
    const carrier = config.carrier[key];
    if (carrier == null) continue;
    app.opentracing.setCarrier(key, carrier);
  }

  for (const key of Object.keys(config.collector)) {
    const collector = config.collector[key];
    if (collector == null || collector === false) continue;
    app.opentracing.setCollector(key, collector);
  }
};
