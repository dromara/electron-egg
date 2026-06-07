# ee-bin

CLI build tool for [electron-egg](https://github.com/wallace5303/electron-egg) applications — TypeScript edition with dual CJS + ESM module support.

## Overview

`ee-bin` is the command-line companion to `ee-core`. It handles everything outside the Electron runtime: development orchestration, esbuild bundling, resource moving, code encryption, icon generation, and incremental updates.

## Installation

```bash
npm install ee-bin
```

## CLI Commands

```bash
ee-bin dev              # Start development mode (frontend + electron)
ee-bin build            # Build frontend + electron bundle + platform packages
ee-bin start            # Production start (no bundling)
ee-bin exec             # Execute user-defined custom commands
ee-bin move             # Move/copy resources (e.g. frontend dist → public)
ee-bin encrypt          # Apply code encryption (obfuscation / bytecode)
ee-bin clean            # Remove encrypted output files
ee-bin icon             # Generate app icons from source image
ee-bin updater          # Generate incremental update packages
```

### Options

| Command | Option | Description |
|---|---|---|
| `dev` | `--config <folder>` | Path to custom bin.js config file |
| `dev` | `--serve <mode>` | Comma-separated services to start (e.g. `frontend,electron`) |
| `build` | `--config <folder>` | Path to custom bin.js config file |
| `build` | `--env <env>` | Build environment (`dev`, `prod`) |

## Configuration

ee-bin reads project configuration from `./cmd/bin.js`. This file defines dev mode subprocess configs, build pipeline settings, encryption strategies, and more.

### dev section

```js
module.exports = {
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
      watch: true,
      sync: false,
      delay: 1000,
    },
  },
};
```

### build section

```js
module.exports = {
  build: {
    electron: {
      bundleType: 'bundle',   // 'bundle' | 'copy'
      external: [],            // User-defined esbuild externals
      sourcemap: false,        // 'inline' | 'external' | false (auto)
      minify: false,           // true | false
      drop: undefined,         // ['console', 'debugger']
      keepNames: false,
      legalComments: undefined, // 'inline' | 'eof' | 'none'
      define: undefined,       // { 'process.env.X': '"value"' }
      copy: undefined,         // ['assets', 'data/db.json']
      format: undefined,       // 'cjs' | 'esm' (default: cjs)
    },
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
  },
};
```

Framework-managed externals (already covered by `packages: 'external'` but listed for clarity): `ee-core`, `ee-bin`, `electron`, `better-sqlite3`, `proxy-agent`, `pino-roll`, `pino-pretty`.

## Bundling Pipeline

### Controller & Config Registry

The esbuild `controllerRegistryPlugin` scans:
1. `electron/controller/` — generates `ee-core:controller-registry` virtual module with lazy getters
2. `electron/config/` — generates `app:config-registry` virtual module with lazy getters

### Bundle Entry

The bundle entry (`ee-core:bundle-entry`) loads config registry → controller registry → real `main.js`, ensuring registries are populated before app starts but controllers are only loaded on demand.

### Format Auto-Detection

`_bundleWithRegistry()` detects entry file type:
- `electron/main.js` → CJS output
- `electron/main.ts` → ESM output

### Output Structure

After `ee-bin build`, `public/electron/` contains:

```
public/electron/
├── main.js       # Bundled main process (controllers, services, config bundled in)
├── jobs/         # Copied as-is (child_process.fork requires separate files)
└── preload/
    └── bridge.js # Copied as-is (BrowserWindow preload script)
```

## Encryption

Three encryption strategies via `javascript-obfuscator` and `bytenode`:

| Type | Description |
|---|---|
| `confusion` | Obfuscation only (javascript-obfuscator) |
| `bytecode` | Bytecode only (bytenode, electron only) |
| `strict` | Obfuscation + bytecode combined |
| `none` | Skip encryption |

```js
module.exports = {
  encrypt: {
    frontend: {
      type: 'confusion',
      files: ['./frontend/dist/**/*.js'],
    },
    electron: {
      type: 'strict',
      files: ['./public/electron/**/*.js'],
      entryFiles: ['./public/electron/main.js'],
    },
  },
};
```

## Build

```bash
npm run build          # Build CJS + ESM
npm run build:esm      # Build ESM only
npm run build:cjs      # Build CommonJS only
npm run typecheck      # TypeScript type checking
npm run test           # Run vitest
```

## Requirements

- Node.js >= 20.19.0
- esbuild >= 0.28
- `icon-gen` is an optional dependency — icon generation requires it installed

## Notes

- ee-bin is a CLI tool only — it is never part of the Electron app runtime
- After modifying ee-bin TypeScript source, rebuild with `npm run build` before testing
- Sourcemap `false` (default) means auto — dev uses `inline`, prod disables