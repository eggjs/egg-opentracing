'use strict';

const utility = require('utility');

exports.generate = generate;

function generate() {
  return utility.md5(String(Date.now() * Math.random()));
}
