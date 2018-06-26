'use strict';

const mm = require('egg-mock');

describe.only('test/lib/opentracing.test.js', () => {

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

});
