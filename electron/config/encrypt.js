/**
 * 加密配置
 * @param {String} type - strict (first confusion and then bytecode) || bytecode || confusion
 * @param {Array} directory - directory to be encrypted
 * @param {Array} fileExt - file suffix to be encrypted, currently only .js is supported
 */
 module.exports = {
  type: 'strict',
  directory: [
    'electron'
  ],
  fileExt: ['.js'],
};