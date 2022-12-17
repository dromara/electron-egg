/**
 * 加密配置
 */
module.exports = {
  type: 'confusion',
  directory: [
    'electron'
  ],
  fileExt: ['.js'],
  confusionOptions: {
    compact: true,      
    stringArray: true,
    stringArrayEncoding: ['base64'],
    deadCodeInjection: false,
  }
};