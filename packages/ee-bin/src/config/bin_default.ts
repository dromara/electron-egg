/**
 * ee-bin Default Configuration
 *
 * This module defines the default configuration values for the ee-bin CLI tool.
 * It serves as the base layer for configuration merging — user-provided config
 * from ./cmd/bin.js is deep-merged on top of these defaults via extend(), so
 * user values always override corresponding default fields.
 *
 * Configuration structure (corresponds to BinConfig type):
 *   dev     → Dev mode subprocess configs (frontend + Electron)
 *   build   → Build configs (frontend build + Electron bundle + platform packaging commands)
 *   move    → Resource move configs (frontend output → public directory)
 *   start   → Production start config
 *   encrypt → Code encryption configs (frontend obfuscation + Electron obfuscation/bytecode)
 *   exec    → Custom command configs (empty by default, user-defined)
 */

import type { BinConfig } from '../types/config.js';

const config: BinConfig = {
  // Dev mode configuration — each sub-command is independently configured.
  // formatCmds() parses the command name and starts the corresponding process.
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
      // Frontend dev server protocol. 'http://' means served via HTTP dev server.
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
      // Whether to watch the electron directory for changes and auto-rebuild + restart
      watch: false,
      sync: false,
      // Debounce delay in watch mode (milliseconds). Prevents rapid successive
      // file changes from triggering multiple rebuilds.
      delay: 1000,
    },
  },

  // Build configuration — the "electron" key is BundleConfig (esbuild bundling),
  // all other keys are ExecConfig (command execution via child_process).
  build: {
    // Frontend build: runs npm run build to produce dist output
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    // Electron main process bundle configuration
    electron: {
      bundleType: 'bundle', // 'bundle' uses esbuild to bundle into a single file, 'copy' copies the directory as-is
      external: [],         // User-defined esbuild external packages (framework externals are added automatically by the bundler)
      sourcemap: false,     // false = auto mode (dev→inline sourcemap, prod→disabled); 'inline' | 'external' to force
      minify: false,        // Minify whitespace/identifiers/syntax (recommended for production)
      keepNames: false,     // Preserve original function/class names when minifying (eases error tracing)
      drop: [],             // Statement types to strip, e.g. ['console', 'debugger'] for production
      legalComments: 'none',// License comment handling: 'inline' | 'eof' | 'none'
      define: {},           // Compile-time global constants, e.g. { 'process.env.MY_VERSION': '"1.0.0"' }
      copy: [],             // Extra electron/ dirs/files copied to output (kept out of main.js); scripts transpiled, others verbatim
      format: 'cjs',        // Output format: 'cjs' (recommended for Electron main process) | 'esm'
    },
    // Platform packaging commands — executed via electron-builder.
    // Each platform has its own builder config file in ./cmd/.
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

  // Resource move configuration — copies frontend build output to the public
  // directory so Electron can load it as static assets.
  move: {
    frontend_dist: {
      src: './frontend/dist',
      dest: './public/dist',
    },
  },

  // Production start configuration — runs Electron with prod environment
  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod'],
  },

  // Encryption configuration — frontend and electron each have independent strategies
  encrypt: {
    // Frontend encryption: only supports 'confusion' (obfuscation), not 'bytecode'.
    // Reason: bytecode compiles to V8 bytecode, but the browser renderer process
    // runs a different V8 version than the compile-time V8, making bytecode incompatible.
    frontend: {
      type: 'none',
      files: ['./public/dist/**/*.js'],
      fileExt: ['.js'],
      cleanFiles: ['./public/dist'],
      specificFiles: [],
      encryptDir: './',
      // Suppress javascript-obfuscator's promotional banner during confusion
      silent: false,
      confusionOptions: {
        compact: true,
        stringArray: true,
        // Frontend code is performance-sensitive, use 'none' encoding to avoid decode overhead
        stringArrayEncoding: ['none'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'browser',
      },
    },
    // Electron encryption: supports both 'confusion' and 'bytecode' (and 'strict' = both combined).
    // target: 'node' because the Electron main process runs in a Node.js environment.
    electron: {
      type: 'none',
      files: ['./public/electron/**/*.js'],
      fileExt: ['.js'],
      cleanFiles: ['./public/electron'],
      // bridge.js is a BrowserWindow preload script that must remain in readable format,
      // so it is specifically listed to use confusion instead of bytecode.
      specificFiles: ['./public/electron/preload/bridge.js'],
      encryptDir: './',
      // Suppress javascript-obfuscator's promotional banner during confusion
      silent: false,
      confusionOptions: {
        compact: true,
        stringArray: true,
        // Electron main process can tolerate decode overhead, use 'rc4' encryption for stronger protection
        stringArrayEncoding: ['rc4'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'node',
      },
      // bytenode options for 'bytecode'/'strict' types. electron:true enables V8 bytecode
      // compatibility for the Electron runtime; filename/output are set per-file by the encrypt module.
      bytecodeOptions: {
        electron: true,
      },
    },
  },

  // Custom command configuration — empty by default, user defines in ./cmd/bin.js
  exec: {},
};

export default config;
