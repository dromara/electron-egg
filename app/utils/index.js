'use strict';

// 生成两数之间随机数
exports.randomNums = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

