/**
 * 加密配置
 * @param {String} type - bytecode || confusion || strict (first confusion and then bytecode)
 * @param {Array} directory - directory to be encrypted
 * @param {Array} fileExt - file suffix to be encrypted, currently only .js is supported
 */
 module.exports = {
  type: 'bytecode',
  directory: [
    'electron'
  ],
  fileExt: ['.js'],
};