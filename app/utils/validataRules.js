'use strict';
// 正则校验规则集合
const regRule = require('./regRule');
// 校验规则
const validateRules = {
  // 账号校验1：手机号&&密码
  accountType1: () => {
    return {
      email: {
        type: 'string',
        required: true,
        allowEmpty: false,
        format: regRule.emailReg,
      },
      password: {
        type: 'string',
        require: true,
        allowEmpty: false,
        format: regRule.passwordReg1,
      },
    };
  },

  // 账号校验2：手机号&&验证码登录
  accountType2: () => {
    return {
      // phone: {
      //   type: 'string',
      //   required: true,
      //   allowEmpty: false,
      //   format: regRule.phoneReg,
      // },
      code: {
        type: 'string',
        required: true,
        allowEmpty: false,
      },
    };
  },
};

module.exports = validateRules;
