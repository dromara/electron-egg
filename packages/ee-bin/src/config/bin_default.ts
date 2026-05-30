/**
 * ee-bin 默认配置
 *
 * 作为配置合并的基础层，与用户通过 ./cmd/bin.js 提供的自定义配置
 * 通过 extend() 深合并。用户配置会覆盖默认值中的对应字段。
 *
 * 配置结构对应 BinConfig 类型：
 *   dev     → 开发模式各子进程配置（前端 + Electron）
 *   build   → 构建配置（前端构建 + Electron 打包 + 各平台打包命令）
 *   move    → 资源移动配置（前端产物 → public 目录）
 *   start   → 生产启动配置
 *   encrypt → 代码加密配置（前端混淆 + Electron 混淆/字节码）
 *   exec    → 自定义命令配置（默认为空，由用户自定义）
 */

import type { BinConfig } from '../types/config.js';

const config: BinConfig = {
  // 开发模式配置 — 各子命令独立配置，通过 formatCmds 解析命令名启动对应进程
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
      // 前端开发服务器协议，'http://' 表示通过 HTTP 服务访问
      protocol: 'http://',
      hostname: 'localhost',
      port: 8080,
      indexPath: 'index.html',
      force: false,
      sync: false,
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
      loadingPage: '/public/html/loading.html',
      // 是否监听 electron 目录变化并自动重新打包+重启
      watch: false,
      sync: false,
      // watch 模式下的防抖延迟（毫秒），避免频繁文件变动导致多次重建
      delay: 1000,
    },
  },

  // 构建配置 — electron 键为 BundleConfig（esbuild 打包），其他键为 ExecConfig（命令执行）
  build: {
    // 前端构建：调用 npm run build 生成 dist 产物
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    // Electron 主进程打包配置
    electron: {
      bundleType: 'bundle', // 'bundle' 用 esbuild 打包为单文件，'copy' 直接复制目录
      external: [],         // 用户自定义 external 包列表（框架 external 由打包逻辑自动添加）
      sourcemap: false,     // false = 自动模式（dev→inline, prod→off）
    },
    // 各平台打包命令 — 通过 electron-builder 执行，每个平台有独立的 builder 配置文件
    win32: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder.json', '-w=nsis', '--ia32'],
    },
    win64: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder.json', '-w=nsis', '--x64'],
    },
    win_e: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder.json', '-w=portable', '--x64'],
    },
    win_7z: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder.json', '-w=7z', '--x64'],
    },
    mac: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder-mac.json', '-m'],
    },
    mac_arm64: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder-mac-arm64.json', '-m', '--arm64'],
    },
    linux: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder-linux.json', '-l=deb', '--x64'],
    },
    linux_arm64: {
      cmd: 'electron-builder',
      directory: './',
      args: ['--config=./cmd/builder-linux.json', '-l=deb', '--arm64'],
    },
  },

  // 资源移动配置 — 将前端构建产物复制到 public 目录供 Electron 加载
  move: {
    frontend_dist: {
      src: './frontend/dist',
      dest: './public/dist',
    },
  },

  // 生产启动配置 — 以 prod 环境运行 Electron
  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod'],
  },

  // 加密配置 — frontend 和 electron 各有独立策略
  encrypt: {
    // 前端加密：仅支持 confusion（混淆），不支持 bytecode
    // 原因：bytecode 编译为 V8 字节码，浏览器渲染进程的 V8 版本与编译时不同，无法执行
    frontend: {
      type: 'none',
      files: ['./public/dist/**/*.js'],
      fileExt: ['.js'],
      cleanFiles: ['./public/dist'],
      specificFiles: [],
      encryptDir: './',
      confusionOptions: {
        compact: true,
        stringArray: true,
        // 前端代码性能敏感，使用 'none' 编码避免解码开销
        stringArrayEncoding: ['none'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'browser',
      },
    },
    // Electron 加密：支持 confusion + bytecode（strict = 两者组合）
    // target: 'node' 因为 Electron 主进程运行在 Node.js 环境
    electron: {
      type: 'none',
      files: ['./public/electron/**/*.js'],
      fileExt: ['.js'],
      cleanFiles: ['./public/electron'],
      // bridge.js 是 BrowserWindow preload 脚本，必须保持可读格式，
      // 所以单独指定用 confusion 而非 bytecode 处理
      specificFiles: ['./public/electron/preload/bridge.js'],
      encryptDir: './',
      confusionOptions: {
        compact: true,
        stringArray: true,
        // Electron 主进程可承受解码开销，使用 'rc4' 加密增强保护
        stringArrayEncoding: ['rc4'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'node',
      },
    },
  },

  // 自定义命令配置 — 默认为空，由用户在 ./cmd/bin.js 中自行定义
  exec: {},
};

export default config;