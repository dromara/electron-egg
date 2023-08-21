/**
 * ee-bin 配置
 * 仅适用于开发环境
 */
module.exports = {
  /**
   * 同时启动 "frontend" "electron"
   * ee-bin dev
   */
  dev: {
    frontend: {
      protocol: 'http://',
      directory: './frontend',
      cmd: 'npm run dev',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'view_example.html'
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
    }
  },

  /**
   * 前端构建
   * ee-bin build
   */
  build: {
    directory: './frontend',
    cmd: 'npm run build'
  },

  /**
   * 预发布模式（prod）
   * ee-bin start
   */
  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod']
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