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
      port: 8080,
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local', '--debuger=false'],
      watch: false,
      delay: 1000,
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
    electron: {
      /**
      * 构建方式
      * 'bundle' - 用 esbuild 打包成单文件（默认）
      * 'copy'   - 原样复制 electron/ 目录，不做打包（仅用于 debuger 调试模式）
      */
      bundleType: 'bundle',
      /**
      * 开发者自定义 external 包
      * 框架已内置: electron, better-sqlite3, proxy-agent, pino-roll, pino-pretty
      * 如果你的项目引入了无法打包的库（如 native 模块），在此添加包名
      * 示例: external: ['sharp', 'node-gyp']
      */
      external: [],
      /**
      * Source map 配置（用于断点调试）
      * true | 'inline'  - 源码嵌入 main.js，DevTools/VS Code 开箱即用（开发推荐）
      * 'external'       - 生成 main.js.map 文件，生产环境可单独删除
      * false            - 不生成 sourcemap
      * 默认: dev 环境 'inline'，prod 环境 false
      */
      sourcemap: false,
    },
    win64: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder.json', '-w=nsis', '--x64'],
    },
    win32: {
      args: ['--config=./cmd/builder.json', '-w=nsis', '--ia32'],
    },
    win_e: {
      args: ['--config=./cmd/builder.json', '-w=portable', '--x64'],
    },
    win_7z: {
      args: ['--config=./cmd/builder.json', '-w=7z', '--x64'],
    },
    mac: {
      args: ['--config=./cmd/builder-mac.json', '-m'],
    },
    mac_arm64: {
      args: ['--config=./cmd/builder-mac-arm64.json', '-m', '--arm64'],
    },
    linux: {
      args: ['--config=./cmd/builder-linux.json', '-l=deb', '--x64'],
    },
    linux_arm64: {
      args: ['--config=./cmd/builder-linux.json', '-l=deb', '--arm64'],
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
    frontend: {
      type: 'none',
      files: [
        './public/dist/**/*.(js|json)',
      ],
      cleanFiles: ['./public/dist'],
      confusionOptions: {
        compact: true,      
        stringArray: true,
        stringArrayEncoding: ['none'],
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'browser',
      }
    },
    electron: {
      type: 'confusion',
      files: [
        './public/electron/**/*.(js|json)',
      ],
      cleanFiles: ['./public/electron'],
      specificFiles: [
        './public/electron/main.js',
        './public/electron/preload/bridge.js',
      ],
      confusionOptions: {
        compact: true,      
        stringArray: true,
        stringArrayEncoding: ['none'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'node',
      }
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