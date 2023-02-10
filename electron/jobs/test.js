const path = require('path');
const { Utils } = require('ee-core');

exports.hello = function () {
  console.log('[test]  hello--------');

  return 'hello';
}

exports.getDir = function (name) {

  let baseDir = Utils.getBaseDir();
  console.log('[test] baseDir -------- ', baseDir);

  let tp = path.join(__dirname, name);
  console.log('[test] jobs file -------- ', tp);

  return baseDir;
}