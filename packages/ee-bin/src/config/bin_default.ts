import type { BinConfig } from '../types/config.js';

const config: BinConfig = {
  dev: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'dev'],
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
      watch: false,
      sync: false,
      delay: 1000,
    },
  },

  build: {
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    electron: {
      bundleType: 'bundle',
      external: [],
      sourcemap: false,
    },
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

  move: {
    frontend_dist: {
      src: './frontend/dist',
      dest: './public/dist',
    },
  },

  start: {
    directory: './',
    cmd: 'electron',
    args: ['.', '--env=prod'],
  },

  encrypt: {
    frontend: {
      type: 'none',
      files: ['./public/dist/**/*.(js|json)'],
      fileExt: ['.js'],
      cleanFiles: ['./public/dist'],
      specificFiles: [],
      encryptDir: './',
      confusionOptions: {
        compact: true,
        stringArray: true,
        stringArrayEncoding: ['none'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'browser',
      },
    },
    electron: {
      type: 'none',
      files: ['./public/electron/**/*.(js|json)'],
      fileExt: ['.js'],
      cleanFiles: ['./public/electron'],
      specificFiles: ['./public/electron/preload/bridge.js'],
      encryptDir: './',
      confusionOptions: {
        compact: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        deadCodeInjection: false,
        stringArrayCallsTransform: true,
        numbersToExpressions: true,
        target: 'node',
      },
    },
  },

  exec: {},
};

export default config;
