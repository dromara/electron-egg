/**
 * 加密配置
 */
module.exports = {
  type: 'bytecode',
  directory: [
    'electron'
  ],
  fileExt: ['.js'],
  confusionOptions: {
    compact: true,      
    stringArray: true,
    stringArrayEncoding: ['none'],
    deadCodeInjection: false,
  }
};