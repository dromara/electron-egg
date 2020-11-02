'use strict';

// MD5加密工具
const crypto = require('crypto');
// 使用crypto进行MD5加密
const md5 = crypto.createHash('md5');

/* 通用函数集合 */
// UTC时间格式化成本地时间
exports.formatUTC = UTCDateString => {
  if (!UTCDateString) {
    return '-';
  }
  // 格式化显示
  function formatFunc(str) {
    return str > 9 ? str : '0' + str;
  }
  // 这步是关键
  const date2 = new Date(UTCDateString);
  const year = date2.getFullYear();
  const mon = formatFunc(date2.getMonth() + 1);
  const day = formatFunc(date2.getDate());
  const hour = date2.getHours();
  const min = date2.getMinutes();
  const second = date2.getSeconds();

  const dateStr =
    year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + second;
  return dateStr;
};
// 生成8位数的uid
exports.createNewUid = () => {
  /* 生成8位随机整数,不能有4位连续数字，不能有4位重复数字 */
  // 4位重复数字
  // let reg1 = /\d{4}/;
  const reg1 = /([\d])\1{3}/;
  // 4位连续数字
  const reg2 = /(0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)|9(?=0)){3}|(?:0(?=9)|9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){3}/;
  // const numStr1 = '10122229';
  // const numStr2 = '78902100';
  // console.log(`reg1 is ${reg1.test(numStr1)}`);
  // console.log(`reg2 is ${reg2.test(numStr2)}`);

  // 生成uid(随机20次应该能有1次满足条件)
  let uid = null;
  for (let i = 0; i < 20; i++) {
    // 生成随机整数(范围11111111到19878711)
    uid = String(parseInt(Math.random() * 8767600) + 11111111);
    // console.log(`uid is ${uid}`)
    // const uid = "89016530";
    // console.log(`reg1 is ${reg1.test(uid)}`);
    // console.log(`reg2 is ${reg2.test(uid)}`);
    if (!reg1.test(uid) && !reg2.test(uid)) {
      // console.log(`uid is 1111`)
      return uid;
    }
  }
};

// 生成密码加密的盐slat(8位字符串)
exports.saltPwd = () => {
  let str = '';
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  let pos = null;
  for (let i = 0; i < 8; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
};
// 生成随机字符串(数字(0-9),字母(a-z,A-Z))
exports.randomWord = (randomFlag, min, max) => {
  let str = '';
  let range = min;
  const arr = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  let pos = null;
  for (let i = 0; i < range; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
  // 使用方法
  // 生成3-32位随机串：randomWord(true, 3, 32)
  // 生成43位随机串：randomWord(false, 43)
};
// 生成两数之间随机数
exports.randomNums = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};
// 客户端密码加密
exports.saltPwdMd5 = (password, saltPwd) => {
  const md5 = crypto.createHash('md5');
  // 加了盐的客户端密码
  const saltPassword = password + ':' + saltPwd;
  // 加盐的密码再用MD5加密
  const saltPasswordMd5 = md5.update(saltPassword).digest('hex');
  return saltPasswordMd5;
};
exports.createToken = data => {
  // console.log(`data is ${JSON.stringify(data)}`);
  const { uid, app } = data;
  // 当前时间戳
  const created = Math.floor(Date.now() / 1000);

  const token = app.jwt.sign({ uid, created }, app.config.jwt.secret, {
    expiresIn: '30d',
  });

  return token;
};
exports.createAdminToken = data => {
  // console.log(`data is ${JSON.stringify(data)}`);
  const { id, role, app } = data;
  // 当前时间戳
  const created = Math.floor(Date.now() / 1000);

  const token = app.jwt.sign({ id, role, created }, app.config.jwt.secret, {
    expiresIn: '30d',
  });

  return token;
};
