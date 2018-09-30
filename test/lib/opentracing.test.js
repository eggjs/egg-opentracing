'use strict';

const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const mm = require('egg-mock');
const sleep = require('mz-modules/sleep');


describe('test/lib/opentracing.test.js', () => {

  describe('two application', () => {
    let app;
    before(async () => {
      mm(process.env, 'HOST', 'http://localhost:8001');
      app = mm.cluster({
        baseDir: 'apps/opentracing-app',
        port: 8001,
      });
      app.debug();
      await app.ready();
    });
    after(async () => {
      await app.close();
    });
    afterEach(mm.restore);

    it('should GET /', async () => {
      await app.httpRequest()
        .get('/c1')
        .type('json')
        .expect({ a: 1 })
        .expect(200);

      await app.httpRequest()
        .get('/checkSpan')
        .expect(200);
    });
  });

  describe('Collector', () => {
    let app;
    before(async () => {
      app = mm.app({
        baseDir: 'apps/opentracing-app',
      });
      await app.ready();
    });
    after(async () => {
      await app.close();
    });
    afterEach(mm.restore);

    it('should return when argument isnt span', () => {
      assert(app.opentracing.collect() === undefined);
    });

    it('should use default log collector', async () => {
      const ctx = app.mockContext();
      const span = ctx.tracer.startSpan('a');
      await sleep(1000);
      span.finish();
      await sleep(1000);
      const log = await fs.readFile(path.join(app.config.baseDir, 'logs/opentracing-test/opentracing.log'), 'utf8');
      const obj = JSON.parse(log);
      assert(obj.spanId === span.spanId);
      assert(obj.traceId === span.traceId);
      assert(obj.name === span.name);
    });

    it('should check collector', async () => {
      assert.throws(() => {
        app.opentracing.setCollector('a', {});
      }, /Collector should implement collect/);
    });

    it('could override exist collector', async () => {
      const ctx = app.mockContext();
      let result;
      app.opentracing.setCollector('a', class {
        collect() {
          result = 1;
        }
      });

      let span = ctx.tracer.startSpan('a');
      span.finish();
      await sleep(1000);
      assert(result === 1);

      app.opentracing.setCollector('a', class {
        collect() {
          result = 2;
        }
      });
      span = ctx.tracer.startSpan('a');
      span.finish();
      await sleep(1000);
      assert(result === 2);
    });

    it('should log error when collect error', async () => {
      const spans = [];
      app.opentracing.setCollector('a', class {
        collect() {
          throw new Error('collect a error');
        }
      });
      app.opentracing.setCollector('b', class {
        collect(span) {
          spans.push(span);
        }
      });

      const ctx = app.mockContext();
      const span = ctx.tracer.startSpan('a');
      span.finish();
      await sleep(1000);

      assert(spans.length === 1);
      const log = await fs.readFile(path.join(app.config.baseDir, 'logs/opentracing-test/common-error.log'), 'utf8');
      assert(log.includes('collect a error'));
    });
  });

  describe('default span', () => {
    let app;
    beforeEach(async () => {
      app = mm.app({
        baseDir: 'apps/opentracing-app',
      });
      await app.ready();
    });
    afterEach(async () => {
      await app.close();
    });
    afterEach(mm.restore);

    it('should support http_server', async () => {
      await app.httpRequest()
        .get('/httpserver')
        .expect(200);

      const tags = app.config.spans[0].getTags();
      assert(tags.appname === 'opentracing-test');
      assert(tags.component === 'egg');
      assert(tags['worker.id'] === 0);
      assert(tags['process.id'] === process.pid);
      assert(/^\d+$/.test(tags['peer.port']));
      assert(tags['peer.ipv6']);
      assert(tags['http.url'] === '/httpserver');
      assert(tags['http.method'] === 'GET');
      assert(tags['http.status_code'] === 200);
      assert(tags['http.request_size'] === 0);
      assert(tags['http.response_size'] === 4);
    });

    it('should support app.curl', async () => {
      await app.httpRequest()
        .get('/app_curl')
        .expect(200);

      const tags = app.config.spans[0].getTags();
      assert(tags.appname === 'opentracing-test');
      assert(tags['worker.id'] === 0);
      assert(tags['process.id'] === process.pid);
      assert(tags['http.url'] === 'http://www.alibaba.com/');
      assert(tags['http.method'] === 'GET');
      assert(tags['http.status_code'] === 200);
      assert(tags['http.request_size'] === 0);
      assert(tags['http.response_size']);
    });

    it('should support ctx.curl', async () => {
      await app.httpRequest()
        .get('/ctx_curl')
        .expect(200);

      assert(app.config.spans && app.config.spans.length === 2);
      const tags = app.config.spans[0].getTags();
      assert(tags.appname === 'opentracing-test');
      assert(tags['worker.id'] === 0);
      assert(tags['process.id'] === process.pid);
      assert(tags['http.url'] === 'http://www.alibaba.com/');
      assert(tags['http.method'] === 'GET');
      assert(tags['http.status_code'] === 200);
      assert(tags['http.request_size'] === 0);
      assert(tags['http.response_size']);
      assert(tags['peer.hostname'] === 'www.alibaba.com');
      assert(tags['peer.port'] === 80);
      assert(/\d+\.\d+\.\d+\.\d+/.test(tags['peer.ipv4']));
    });

    it('should support multi ctx.curl', async () => {
      await app.httpRequest()
        .get('/ctx_multi_curl')
        .expect(200);

      assert(app.config.spans && app.config.spans.length === 3);
      let tags = app.config.spans[0].getTags();
      assert(tags.appname === 'opentracing-test');
      assert(tags['worker.id'] === 0);
      assert(tags['process.id'] === process.pid);
      assert(tags['http.url'] === 'http://www.aliexpress.com/');
      assert(tags['http.method'] === 'GET');
      assert(tags['http.status_code'] === 200);
      assert(tags['http.request_size'] === 0);
      assert(tags['http.response_size']);
      assert(tags['peer.hostname'] === 'www.aliexpress.com');
      assert(tags['peer.port'] === 80);
      assert(/\d+\.\d+\.\d+\.\d+/.test(tags['peer.ipv4']));

      tags = app.config.spans[1].getTags();
      assert(tags['http.url'] === 'http://www.alibaba.com/');
    });
  });

  describe('disable default collector', () => {
    let app;
    before(async () => {
      app = mm.app({
        baseDir: 'apps/disable-collector',
      });
      await app.ready();
    });
    after(() => app.close());

    it('should not create opentracingLogger', async () => {
      assert(!app.loggers.opentracingLogger);
    });

    it('should not use log collector', async () => {
      const ctx = app.mockContext();
      const span = ctx.tracer.startSpan('a');
      await sleep(1000);
      span.finish();
      await sleep(1000);

      const exists = await fs.exists(path.join(app.config.baseDir, 'logs/opentracing-test/opentracing.log'));
      assert(!exists);
    });
  });

  describe('disable default carrier', () => {
    let app;
    before(async () => {
      app = mm.app({
        baseDir: 'apps/disable-carrier',
      });
      await app.ready();
    });
    after(() => app.close());

    it('should not create opentracingLogger', async () => {
      const ctx = app.mockContext();
      const span = ctx.tracer.startSpan('test');
      const carrier = {};
      try {
        ctx.tracer.inject(span, 'HTTP', carrier);
        throw new Error('should not run');
      } catch (err) {
        assert(err.message === 'HTTP is unknown carrier');
      }
    });
  });
});
