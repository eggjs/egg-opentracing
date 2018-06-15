'use strict';

class LogCollector {
  collect(span) {
    console.log(111, span);
  }
}

module.exports = LogCollector;
