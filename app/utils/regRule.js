// // 密码校验规则(32位字符串,既Md5加密后的)
// const passwordReg1 = /^.{32}$/
// // 手机号码校验规则
// const phoneReg = /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/
'use strict';

const regRule = {
  paswwordReg1: /^.{32}$/,
  phoneReg: /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/,
  emailReg: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
};
module.exports = regRule;
