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
    bundler: {
      directory: './', // ./node_modules/.bin/
      cmd: 'esbuild',
      args: ['./electron/**/*.js', '--platform=node', '--minify', '--outdir=runtime', '--watch', '--packages=external'], // '--config==./cmd/esbuild.config.js'
    },
    bundlerts: {
      directory: './', // ./node_modules/.bin/
      cmd: 'esbuild',
      args: ['./electronts/**/*.ts', '--platform=node', '--minify', '--format=cjs', '--outdir=runtime', '--tsconfig=./electronts/tsconfig.json', '--packages=external'], // '--config==./cmd/esbuild.config.js'
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
      loadingPage: '/public/html/loading.html',
    }
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
      src: './frontend/dist',
      dest: './public/dist'
    },
    go_static: {
      src: './frontend/dist',
      dest: './go/public/dist'
    },
    go_config: {
      src: './go/config',
      dest: './go/public/config'
    },
    go_package: {
      src: './package.json',
      dest: './go/public/package.json'
    },
    go_images: {
      src: './public/images',
      dest: './go/public/images'
    },
    python_dist: {
      src: './python/dist',
      dest: './build/extraResources/py'
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
      '!electron/config/nodemon.json',
    ],
    fileExt: ['.js'],
    cleanFiles: ['./public/electron'],
    specificFiles: ['electron/preload/bridge.js'],
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