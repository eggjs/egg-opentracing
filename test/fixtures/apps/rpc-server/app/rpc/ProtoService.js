'use strict';

exports.echoObj = async function(req) {
  await this.curl('http://alibaba.com');
  return {
    code: 200,
    message: 'hello ' + req.name + ' from Node.js',
  };
};
