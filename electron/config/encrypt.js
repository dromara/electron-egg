/**
 * 加密配置
 * @param {String} type - bytecode || confusion || strict (first confusion and then bytecode)
 * @param {Array} directory - directory to be encrypted
 * @param {Array} fileExt - file suffix to be encrypted, currently only .js is supported
 * @param {Array} confusionOptions options
 */
module.exports = {
  type: 'confusion',
  directory: [
    'electron'
  ],
  fileExt: ['.js'],
  confusionOptions: {
    compact: true, // 将代码压缩为1行        
    stringArray: true, // 删除字符串文本并将其放置在特殊数组中
    stringArrayEncoding: ['base64'], // 对stringArray编码 'none', 'base64', 'rc4'，增加安全性
    deadCodeInjection: false, // 是否注入死代码
  }
};