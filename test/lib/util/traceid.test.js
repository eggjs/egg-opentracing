'use strict';

const assert = require('assert');
const traceid = require('../../../lib/util/traceid');

describe('test/lib/util/traceid.test.js', () => {
  it('should generate traceid ok', () => {
    assert(typeof traceid.generate() === 'string');
    const id = traceid.generate();
    assert(id !== traceid.generate());
    assert(/^[a-z0-9]{8}\d{13}\d{4}[0-9]*$/.test(traceid.generate()));
    assert(/^[a-z0-9]{8}\d{13}\d{4}[0-9]*$/.test(traceid.generate()));
    assert(/^[a-z0-9]{8}\d{13}\d{4}[0-9]*$/.test(traceid.generate()));
  });

  it('should getHexIp ok', () => {
    assert(traceid.getHexIP('1.1.1.1') === '01010101');
    assert(traceid.getHexIP('10.1.1.11') === '0a01010b');
    assert(traceid.getHexIP('255.255.255.255') === 'ffffffff');
  });

  it('should getNextId ok', () => {
    const originId = traceid.getNextId();
    assert(traceid.getNextId() === originId + 1);
    let count = 8000;
    let id;
    while (count--) {
      id = traceid.getNextId();
    }
    assert(id === originId);
  });

});
