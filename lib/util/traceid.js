'use strict';

const localIp = require('address').ip();

exports.generate = generate;
exports.parse = parse;
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
// 确保 id 在 [1000, 9000]
function getNextId() {
  if (tracerRequestId > 9000) {
    tracerRequestId = 1000;
  }
  return tracerRequestId++;
}

const HEX_IP = getHexIP(localIp);
const PID = process.pid;

/**
 * 生成TraceId
 *  1. 将 IP 地址的每一段转成 16 进制，并转换成字符串拼接起来
 *  2. 将当前的毫秒数（当前时间和 1970.1.1 之间的时间差）附加到 1 中得到的结果
 *  3. 将一个自增的 ID（取值为 [1000, 9000]）附加到 2 得到的结果
 *  4. 将当前进程号转换成 16 进制字符串，附加到 4 得到的结果
 * @return {String} TraceId
 */
function generate() {
  return HEX_IP + Date.now() + getNextId() + PID;
}

function parse(tracerId) {
  // 1. 获取调用初始化 ip
  const ipArr = [];
  for (let i = 0; i < 4; i++) {
    ipArr.push(parseInt(tracerId.substr(i * 2, 2), 16));
  }
  const tracerIP = ipArr.join('.');

  // 2. 获取时间戳
  const timestampStr = tracerId.substr(8, 13);
  const timestamp = new Date(+timestampStr);

  // 3. 获取千分位随机数
  const nextId = tracerId.substr(21, 4);
  const pid = tracerId.substr(25);
  // 返回解析结果
  return {
    tracerIP,
    timestamp,
    nextId,
    pid,
  };
}
