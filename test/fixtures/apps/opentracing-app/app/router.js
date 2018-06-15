'use strict';

module.exports = app => {
  app.get('/c1', async ctx => {
    const result = await ctx.curl(process.env.HOST + '/c2');
    ctx.body = result.data;
  });

  app.get('/c2', async ctx => {
    const result = await ctx.curl(process.env.HOST + '/c3');
    ctx.body = result.data;
  });

  app.get('/c3', async ctx => {
    ctx.body = 'success';
  });

};
