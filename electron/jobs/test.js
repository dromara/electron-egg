const path = require('path');
const { logger } = require('ee-core/module/log');

exports.hello = function () {
  logger.info('[test]  hello--------');

  return 'hello';
}

// exports.getDir = function (name) {

//   let baseDir = Utils.getBaseDir();
//   console.log('[test] baseDir -------- ', baseDir);

//   let tp = path.join(__dirname, name);
//   console.log('[test] jobs file -------- ', tp);

//   return baseDir;
// }