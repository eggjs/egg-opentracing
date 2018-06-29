'use strict';

module.exports = app => {
  app.get('/', async ctx => {
    ctx.body = 'done';
  });
};
