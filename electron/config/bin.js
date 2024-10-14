/**
 * ee-bin 配置
 * 仅适用于开发环境
 */
module.exports = {
  /**
   * development serve ("frontend" "electron" )
   * ee-bin dev
   */
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
      loadingPage: '/public/html/loading.html',
    },
  },

  /**
   * 构建
   * ee-bin build
   */
  build: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    go_w: {
      directory: './go',
      cmd: 'go',
      args: ['build', '-o=../build/extraResources/goapp.exe'],
    },
    go_m: {
      directory: './go',
      cmd: 'go',
      args: ['build', '-o=../build/extraResources/goapp'],
    },
    go_l: {
      directory: './go',
      cmd: 'go',
      args: ['build', '-o=../build/extraResources/goapp'],
    },
    python: {
      directory: './python',
      cmd: 'python',
      args: ['./setup.py', 'build'],
    },
  },

  /**
   * 移动资源
   * ee-bin move 
   */
  move: {
    frontend_dist: {
      dist: './frontend/dist',
      target: './public/dist'
    },
    go_static: {
      dist: './frontend/dist',
      target: './go/public/dist'
    },
    go_config: {
      dist: './go/config',
      target: './go/public/config'
    },
    go_package: {
      dist: './package.json',
      target: './go/public/package.json'
    },
    go_images: {
      dist: './public/images',
      target: './go/public/images'
    },
    python_dist: {
      dist: './python/dist',
      target: './build/extraResources/py'
    },
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
  },

  /**
   * 执行自定义命令
   * ee-bin exec
   */
  exec: {
    node_v: {
      directory: './',
      cmd: 'node',
      args: ['-v'],
    },
    npm_v: {
      directory: './',
      cmd: 'npm',
      args: ['-v'],
    },
    // 单独调试，air 实现 go 热重载
    go: {
      directory: './go',
      cmd: 'air',
      args: ['-c=config/.air.toml' ],
    },
    // windows 单独调试，air 实现 go 热重载 
    go_w: {
      directory: './go',
      cmd: 'air',
      args: ['-c=config/.air.windows.toml' ],
    },    
    // 单独调试，以基础方式启动 go
    go2: {
      directory: './go',
      cmd: 'go',
      args: ['run', './main.go', '--env=dev','--basedir=../', '--port=7073'],
    },     
    python: {
      directory: './python',
      cmd: 'python',
      args: ['./main.py', '--port=7074'],
      stdio: "inherit", // ignore
    },
  },  
};