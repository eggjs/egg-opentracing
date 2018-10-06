'use strict';

const OpenTracing = require('./lib/opentracing');
const logHTTPClient = require('./lib/trace/http_client');
const logHTTPServer = require('./lib/trace/http_server');
const logSofaRpcClient = require('./lib/trace/sofa_rpc_client');
const logSofaRpcServer = require('./lib/trace/sofa_rpc_server');

module.exports = app => {
  app.opentracing = new OpenTracing(app);

  const config = app.config.opentracing;
  for (const key of Object.keys(config.carrier)) {
    const carrier = config.carrier[key];
    if (carrier === false) continue;
    app.opentracing.setCarrier(key, carrier);
  }

  for (const key of Object.keys(config.collector)) {
    const collector = config.collector[key];
    if (collector === false) continue;
    app.opentracing.setCollector(key, collector);
  }

  logHTTPClient(app);
  logHTTPServer(app);
  logSofaRpcClient(app);
  logSofaRpcServer(app);
};
