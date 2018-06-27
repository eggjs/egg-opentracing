'use strict';

const localIp = require('address').ip();

exports.generate = generate;
exports.getHexIP = getHexIP;
exports.getNextId = getNextId;


function getHexIP(ip) {
  const ips = ip.split('.');
  let val = '';
  for (const column of ips) {
    let hex = Number(column).toString(16);
    if (hex.length === 1) {
      hex = '0' + hex;
    }
    val += hex;
  }
  return val;
}

let tracerRequestId = 1000;
// NextID is between 1000 and 9000
function getNextId() {
  if (tracerRequestId > 9000) {
    tracerRequestId = 1000;
  }
  return tracerRequestId++;
}

const HEX_IP = getHexIP(localIp);
const PID = process.pid;

/**
 * traceId generator
 *
 * 1. convert ipv4 to 32-bit hex string
 *  2. 将当前的毫秒数（当前时间和 1970.1.1 之间的时间差）附加到 1 中得到的结果
 *  3. 将一个自增的 ID（取值为 [1000, 9000]）附加到 2 得到的结果
 *  4. 将当前进程号转换成 16 进制字符串，附加到 4 得到的结果
 * @return {String} TraceId
 */
function generate() {
  return HEX_IP + Date.now() + getNextId() + PID;
}
