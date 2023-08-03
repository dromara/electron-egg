/**
 * ee-bin 配置
 * 主要用于：开发环境、构建前端资源、加密等
 * @param 
 */
module.exports = {
	frontend: {
		directory: './frontend',
		cmd: 'vite',
		args: '--host --port 8080',
		protocol: 'http://',
		hostname: 'localhost',
		port: 8080,
	},
  main: {
    directory: './',
		cmd: 'electron',
		args: '. --env=local',
  },
	build: {
		directory: './frontend',
		cmd: 'vite',
		args: 'build',
	},
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