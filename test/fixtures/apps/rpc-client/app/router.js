'use strict';

module.exports = app => {
  app.get('/', async function(ctx) {
    const result = await ctx.proxy.protoService.echoObj({
      name: 'zongyu',
      group: 'B',
    });
    ctx.body = result;
  });

  app.get('/without_ctx', async function(ctx) {
    const consumer = app.sofaRpcClient.createConsumer({
      interfaceName: 'com.alipay.sofa.rpc.protobuf.ProtoService',
      targetAppName: 'sofarpc',
      version: '1.0',
      group: 'SOFA',
      proxyName: 'ProtoService',
      serverHost: '127.0.0.1:12200',
    });
    ctx.body = await consumer.invoke('echoObj', [{
      name: 'zongyu',
      group: 'B',
    }], {
      codecType: 'protobuf',
    });
  });
};
