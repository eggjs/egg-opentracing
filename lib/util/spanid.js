'use strict';

exports.generate = generate;

function generate() {
  const digits = '0123456789abcdef';
  let n = '';
  for (let i = 0; i < 16; i++) {
    const rand = Math.floor(Math.random() * 16);
    n += digits[rand];
  }
  return n;
}
