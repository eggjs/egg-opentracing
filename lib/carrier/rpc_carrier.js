'use strict';

class RPCCarrier {

  inject(spanContext) {
    const header = {};
    header['x-b3-traceId'] = spanContext.traceId;
    header['x-b3-spanId'] = spanContext.spanId;
    header['x-b3-rpcId'] = spanContext.rpcId;
    const baggage = spanContext.getBaggages();
    if (baggage) header['x-b3-baggage'] = JSON.stringify(baggage);
    return header;
  }

  extract(header) {
    const traceId = header['x-b3-traceId'];
    const spanId = header['x-b3-spanId'];
    const rpcId = header['x-b3-rpcId'];
    let baggage = header['x-b3-baggage'];
    if (baggage) baggage = JSON.parse(baggage);
    // 转换
    return { traceId, spanId, rpcId, baggage };
  }

}

module.exports = RPCCarrier;
