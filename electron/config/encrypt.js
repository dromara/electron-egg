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
    stringArrayEncoding: ['none'], // 对stringArray编码 'none', 'base64', 'rc4'，注意：会增加代码大小，降低运行速度
    disableConsoleOutput: true, // 禁止console输出
    deadCodeInjection: false, // 是否注入死代码
    debugProtection: false // 是否允许debug代码
  }
};