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
      args: ['.', '--env=local'],
      watch: true,
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
      * 'copy'   - 原样复制 electron/ 目录，不做打包（仅用于调试）
      */
      bundleType: 'bundle',
      /**
      * 开发者自定义 external 包
      * 框架已内置: ee-core, ee-bin, electron, better-sqlite3, proxy-agent, pino-roll, pino-pretty
      * 如果你的项目引入了无法打包的库（如 native 模块），在此添加包名
      * 示例: external: ['sharp', 'node-gyp']
      */
      external: [],
      /**
      * Source map 配置（用于断点调试）
      * true | 'inline'  - 源码嵌入 main.js，DevTools/VS Code 开箱即用（开发推荐）
      * 'external'       - 生成 main.js.map 文件，生产环境可单独删除
      * false            - 不生成 sourcemap（默认：dev→inline，prod→off）
      */
      sourcemap: false,
      /**
      * 压缩代码（生产环境推荐）
      * true  - 压缩空白、标识符、语法
      * false - 不压缩（默认）
      */
      minify: false,
      /**
      * 移除 console 和 debugger 语句（生产环境推荐）
      * 示例: drop: ['console', 'debugger']
      */
      drop: [],
      /**
      * 压缩时保留原始函数/类名（便于定位错误）
      * true  - 保留名称（minify 时推荐开启）
      * false - 不保留（默认）
      */
      keepNames: false,
      /**
      * 第三方库 license 注释处理
      * 'inline'  - 注释内联到每个文件
      * 'eof'     - 注释移到文件末尾
      * 'none'    - 移除所有注释（默认）
      */
      legalComments: 'none',
      /**
      * 自定义全局常量（编译时替换）
      * 示例: define: { 'process.env.MY_VERSION': '"1.0.0"' }
      */
      define: {},
      /**
      * 额外复制 electron/ 下的目录或文件到输出目录（不打包进 main.js，保持目录结构）
      * 框架已内置复制: jobs/, preload/bridge.js（不可移除）
      * 智能处理: .ts/.js/.mts/.cts/.tsx/.jsx 源码会被编译成 Node 可直接 require 的 CJS .js
      *           （bundle:false，相对导入和 ee-core/* 仍保留为运行时 require）；
      *           其它文件（如 .json、图片）原样复制
      * 适用场景: 静态资源，或不打包进 main.js、但需在运行时被 require()/child_process.fork() 加载的源码
      * 目录示例: copy: ['assets']        → electron/assets/ → public/electron/assets/（原样复制）
      *           copy: ['workers']       → 编译 electron/workers/ → public/electron/workers/
      * 文件示例: copy: ['data/db.json']   → electron/data/db.json → public/electron/data/db.json（原样复制）
      *           copy: ['scripts/task.ts']→ 编译 electron/scripts/task.ts → public/electron/scripts/task.js
      */
      copy: [],
      /**
      * 输出格式
      * 'cjs' - CommonJS（推荐，Electron 主进程最稳定的方式）
      * 'esm' - ES Module（需确保业务代码兼容 ESM，如 controller/service 的 registry require() 调用）
      * 默认: 'cjs'
      */
      format: 'cjs',
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
      },
      silent: true,
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
      },
      silent: false,
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