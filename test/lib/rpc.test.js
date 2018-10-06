'use strict';

const fs = require('mz/fs');
const path = require('path');
const mm = require('egg-mock');
const assert = require('assert');

describe('test/rpc.test.js', () => {
  let clientApp;
  let serverApp;
  before(async function() {
    serverApp = mm.app({
      baseDir: 'apps/rpc-server',
    });
    clientApp = mm.app({
      baseDir: 'apps/rpc-client',
    });
    await serverApp.ready();
    await clientApp.ready();
  });
  after(async function() {
    await clientApp.close();
    await serverApp.close();
  });
  afterEach(mm.restore);

  it('should trace rpc ok', async function() {
    await clientApp.httpRequest()
      .get('/')
      .expect({
        code: 200,
        message: 'hello zongyu from Node.js',
      });

    let data = await fs.readFile(path.join(clientApp.config.baseDir, 'logs/rpc-client/opentracing.log'), 'utf8');
    const clientSpans = data.trim().split('\n').map(item => {
      return JSON.parse(item);
    });
    assert(clientSpans.length === 2);
    assert(clientSpans[0].traceId === clientSpans[1].traceId);
    assert(clientSpans[0].name === 'sofa_rpc_client');
    assert(clientSpans[0].component === 'egg');
    assert(clientSpans[0].appname === 'rpc-client');
    assert(clientSpans[0]['span.kind'] === 'client');
    assert(clientSpans[0]['peer.service'] === 'com.alipay.sofa.rpc.protobuf.ProtoService:1.0');

    assert(clientSpans[1].name === 'http_server');
    assert(clientSpans[1].component === 'egg');
    assert(clientSpans[1].appname === 'rpc-client');
    assert(clientSpans[1]['span.kind'] === 'server');

    data = await fs.readFile(path.join(serverApp.config.baseDir, 'logs/rpc-server/opentracing.log'), 'utf8');
    const serverSpans = data.trim().split('\n').map(item => {
      return JSON.parse(item);
    });

    assert(serverSpans[0].traceId === serverSpans[1].traceId);
    assert(serverSpans[0].traceId === clientSpans[0].traceId);
    assert(serverSpans[0].name === 'http_client');
    assert(serverSpans[0].component === 'egg');
    assert(serverSpans[0].appname === 'rpc-server');
    assert(serverSpans[0]['span.kind'] === 'client');

    assert(serverSpans[1].name === 'sofa_rpc_server');
    assert(serverSpans[1].component === 'egg');
    assert(serverSpans[1].appname === 'rpc-server');
    assert(serverSpans[1]['span.kind'] === 'server');
    assert(serverSpans[1]['rpc.url'] === 'com.alipay.sofa.rpc.protobuf.ProtoService:1.0');
    assert(serverSpans[1]['rpc.method'] === 'echoObj');
    assert(serverSpans[1]['rpc.result_code'] === '00');
    assert(serverSpans[1]['rpc.request_size'] > 0);
    assert(serverSpans[1]['rpc.response_size'] > 0);
  });

  it('should trace rpc request without ctx', async function() {
    await clientApp.httpRequest()
      .get('/without_ctx')
      .expect({
        code: 200,
        message: 'hello zongyu from Node.js',
      });
    const data = await fs.readFile(path.join(clientApp.config.baseDir, 'logs/rpc-client/opentracing.log'), 'utf8');
    const clientSpans = data.trim().split('\n').map(item => {
      return JSON.parse(item);
    });
    assert(clientSpans.length === 4);

    assert(clientSpans[2].traceId !== clientSpans[3].traceId);
    assert(clientSpans[2].name === 'sofa_rpc_client');
    assert(clientSpans[2].component === 'egg');
    assert(clientSpans[2].appname === 'rpc-client');
    assert(clientSpans[2]['span.kind'] === 'client');
    assert(clientSpans[2]['peer.service'] === 'com.alipay.sofa.rpc.protobuf.ProtoService:1.0');

    assert(clientSpans[3].name === 'http_server');
    assert(clientSpans[3].component === 'egg');
    assert(clientSpans[3].appname === 'rpc-client');
    assert(clientSpans[3]['span.kind'] === 'server');
  });
});
