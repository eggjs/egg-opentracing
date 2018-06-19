'use strict';

exports.keys = '123456';
exports.spans = [];
exports.opentracing = {
  collector: {
    test: class Collector {
      collect(span) {
        exports.spans.push(span);
      }
    },
  },
};
