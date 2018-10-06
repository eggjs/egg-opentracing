'use strict';

module.exports = function logRpcServer(app) {
  if (!app.sofaRpcServer) return;

  const rpcServerSpan = Symbol('Context#sofaRpcServerSpan');
  app.sofaRpcServer.on('request', ({ req, ctx }) => {
    const spanContext = ctx.tracer.extract('RPC', req.data.requestProps);
    const span = ctx.tracer.startSpan('sofa_rpc_server', { childOf: spanContext });
    span.setTag('span.kind', 'server');
    ctx[rpcServerSpan] = span;
  });
  app.sofaRpcServer.on('response', ({ req, res, ctx }) => {
    const span = ctx[rpcServerSpan];
    // TODO: what's the service name of the remote server
    // span.setTag('peer.service');
    span.setTag('peer.port', res.socket.remotePort);
    span.setTag('peer.ipv4', res.socket.remoteAddress);

    span.setTag('rpc.url', req.data.serverSignature);
    span.setTag('rpc.method', req.data.methodName);
    span.setTag('rpc.result_code', res.meta.resultCode);
    span.setTag('rpc.request_size', res.meta.reqSize);
    span.setTag('rpc.response_size', res.meta.resSize);
    span.finish();
  });
};
