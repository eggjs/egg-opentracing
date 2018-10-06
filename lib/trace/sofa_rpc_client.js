'use strict';

module.exports = function logRpcClient(app) {
  if (!app.sofaRpcClient) return;

  app.sofaRpcClient.on('request', req => {
    let ctx = req.ctx;
    if (!ctx) {
      ctx = app.createAnonymousContext();
      req.ctx = ctx;
    }

    const span = ctx.tracer.startSpan('sofa_rpc_client');
    span.setTag('span.kind', 'client');
    ctx.tracer.inject(span.context(), 'RPC', req.requestProps);
    req.span = span;
  });

  app.sofaRpcClient.on('response', ({ req }) => {
    const span = req.span;
    span.setTag('peer.hostname', req.meta.address.hostname);
    span.setTag('peer.port', req.meta.address.port);
    span.setTag('peer.service', req.serverSignature);
    span.setTag('peer.ipv4', req.meta.address.host);

    span.setTag('rpc.url', req.serverSignature);
    span.setTag('rpc.method', req.methodName);
    span.setTag('rpc.result_code', req.meta.resultCode);
    span.setTag('rpc.request_size', req.meta.reqSize);
    span.setTag('rpc.response_size', req.meta.resSize);
    span.finish();
  });
};
