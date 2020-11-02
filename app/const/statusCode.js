'use strict';

let StatusCode;
(function(StatusCode) {
  // 系统
  StatusCode[(StatusCode.SUCCESS = 0)] = 'SUCCESS';
  StatusCode[(StatusCode.SYS_API_ERROR = 10001)] = 'SYS_API_ERROR' // api错误
})(StatusCode || (StatusCode = {}));

module.exports = StatusCode;
