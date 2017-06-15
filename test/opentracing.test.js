'use strict';

const mm = require('egg-mock');

describe('test/opentracing.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'apps/opentracing-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mm.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, opentracing')
      .expect(200);
  });
});
