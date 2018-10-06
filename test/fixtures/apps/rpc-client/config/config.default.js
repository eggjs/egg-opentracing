'use strict';

exports.keys = 'rpc-client_1538293372835_2550';

exports.opentracing = {
  collector: {
    log: require('../../../../../lib/collector/log_collector'),
  },
};

exports.sofaRpc = {
  client: {
    'sofarpc.rpc.service.url': '127.0.0.1:12200',
  },
};
