'use strict';

const mm = require('egg-mock');

describe('test/opentracing.test.js', () => {

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

    it('should GET /', () => {
      return app.httpRequest()
        .get('/c1')
        .expect('hi, opentracing')
        .expect(200);
    });
  });
});
