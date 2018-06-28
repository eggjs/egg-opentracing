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
  });


});
