/**
 * 加密配置
 * @param type - confusion | bytecode | strict
 */
module.exports = {
  type: 'confusion',
  files: [
    'electron/**/*.(js|json)',
    '!electron/config/encrypt.js',
    '!electron/config/nodemon.json'
  ],
  cleanFiles: [
    'electron',
  ],
  fileExt: ['.js'],
  confusionOptions: {
    compact: true,      
    stringArray: true,
    stringArrayEncoding: ['none'],
    deadCodeInjection: false,
  }
};