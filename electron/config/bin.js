/**
 * ee-bin config
 * 仅适用于开发环境
 */
module.exports = {
  /**
   * 前端服务 - dev
   */
	frontend: {
		directory: './frontend',
		devCommond: 'npm run dev',
    buildCommond: 'npm run build',
		protocol: 'http://',
		hostname: 'localhost',
		port: 8080,
	},

  /**
   * 主进程服务 - dev
   */  
  main: {
    directory: './',
		cmd: 'electron',
    args: ['.', '--env=local'],
  },

  /**
   * 加密
   */  
  encrypt: {
    type: 'confusion',
    files: [
      'electron/**/*.(js|json)',
      '!electron/config/encrypt.js',
      '!electron/config/nodemon.json',
      '!electron/config/builder.json',
      '!electron/config/bin.json',
    ],
    fileExt: ['.js'],
    confusionOptions: {
      compact: true,      
      stringArray: true,
      stringArrayEncoding: ['none'],
      deadCodeInjection: false,
    }
  }
};