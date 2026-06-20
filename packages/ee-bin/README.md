# ee-bin

CLI build tool for [electron-egg](https://github.com/wallace5303/electron-egg) applications — TypeScript edition with dual CJS + ESM module support.

## Overview

`ee-bin` is the command-line companion to `ee-core`. It handles everything outside the Electron runtime: development orchestration, esbuild bundling, resource moving, code encryption, icon generation, incremental updates, and HarmonyOS resource extraction.

The package outputs dual module formats (CJS + ESM) via conditional exports in `package.json`.

## Installation

```bash
npm install ee-bin
```

After installation, the `ee-bin` CLI is available globally or via `npx`:

```bash
ee-bin dev              # Direct CLI
npx ee-bin dev          # Via npx
```

## CLI Commands

| Command | Description |
|---|---|
| `dev` | Start development mode (frontend + electron) |
| `build` | Build frontend + electron bundle + platform packages |
| `start` | Production start (no bundling, requires prior build) |
| `exec` | Execute user-defined custom commands |
| `move` | Copy resources between directories |
| `encrypt` | Apply code encryption (obfuscation / bytecode) |
| `clean` | Remove encrypted output files |
| `icon` | Generate app icons from source image |
| `updater` | Generate incremental update packages |
| `ohos` | Extract build artifacts to HarmonyOS resource directories |

### Options

| Command | Option | Description |
|---|---|---|
| `dev` | `--config <folder>` | Path to custom bin.js config file |
| `dev` | `--serve <mode>` | Comma-separated services to start (e.g. `frontend,electron`) |
| `build` | `--config <folder>` | Path to custom bin.js config file |
| `build` | `--cmds <flag>` | Comma-separated build steps (e.g. `frontend,electron,win64`) |
| `build` | `--env <env>` | Build environment (`dev`, `prod`) |
| `exec` | `--config <folder>` | Path to custom bin.js config file |
| `exec` | `--cmds <flag>` | Comma-separated custom commands to execute |
| `move` | `--config <folder>` | Path to custom bin.js config file |
| `move` | `--flag <flag>` | Comma-separated move flags (e.g. `frontend_dist`) |
| `encrypt` | `--config <folder>` | Path to custom bin.js config file |
| `encrypt` | `--out <folder>` | Output directory for encrypted files |
| `clean` | `-d, --dir <folder>` | Directory to clean (default: `./public/electron`) |
| `icon` | `-i, --input <file>` | Source image file (default: `/public/images/logo.png`) |
| `icon` | `-o, --output <folder>` | Output directory (default: `/build/icons`) |
| `icon` | `-s, --size <flag>` | Icon sizes (default: `16,32,64,256,512`) |
| `icon` | `-c, --clear` | Clear output directory before generating |
| `icon` | `-m, --images <flag>` | Copy specific icons to `/public/images/` |
| `updater` | `--config <folder>` | Path to custom bin.js config file |
| `updater` | `--app-file <file>` | Application file path |
| `updater` | `--platform <flag>` | Target platform |
| `updater` | `--force <flag>` | Force update flag |
| `ohos` | `--config <folder>` | Path to custom bin.js config file |
| `ohos` | `--cmds <flag>` | Comma-separated ohos commands (e.g. `resources`) |

## Configuration

ee-bin reads project configuration from `./cmd/bin.js`. This file defines dev mode subprocess configs, build pipeline settings, encryption strategies, and more. The user config is deep-merged onto framework defaults via `extend()`.

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
      force: false,    // Skip dev server readiness check
      sync: false,
    },
    electron: {
      directory: './',
      cmd: 'electron',
      args: ['.', '--env=local'],
      loadingPage: '/public/html/loading.html',
      watch: true,     // Auto-rebuild on electron/ changes
      sync: false,
      delay: 1000,     // Debounce delay for watch rebuilds (ms)
    },
  },
};
```

When `protocol` is `file://`, the frontend subprocess is skipped — the app loads static files directly.

### build section

```js
module.exports = {
  build: {
    electron: {
      bundleType: 'bundle',  // 'bundle' | 'copy'
      external: [],          // User-defined esbuild externals
      sourcemap: false,      // 'inline' | 'external' | false (auto: dev→inline, prod→off)
      minify: false,         // true | false
      drop: [],              // ['console', 'debugger']
      keepNames: false,      // true | false (preserve function/class names when minifying)
      legalComments: 'none', // 'inline' | 'eof' | 'none'
      define: {},            // { 'process.env.X': '"value"' } compile-time constants
      copy: [],              // ['assets', 'data/db.json'] extra dirs/files to copy from electron/
      format: 'cjs',         // 'cjs' | 'esm' (default: cjs, recommended for Electron)
    },
    frontend: {
      directory: './frontend',
      cmd: 'npm',
      args: ['run', 'build'],
    },
    // Platform targets: win32, win64, win_e, win_7z, mac, mac_arm64, linux, linux_arm64
    win64: {
      directory: './',
      cmd: 'electron-builder',
      args: ['--config=./cmd/builder.json', '--win', '--x64'],
    },
  },
};
```

Framework-managed externals (already covered by `packages: 'external'` but listed for documentation): `ee-core`, `ee-bin`, `electron`, `better-sqlite3`, `proxy-agent`, `pino-roll`, `pino-pretty`.

### move section

```js
module.exports = {
  move: {
    frontend_dist: {
      src: './frontend/dist',
      dest: './public/dist',
    },
    go_static: {
      src: './go/static',
      dest: './public/go/static',
    },
  },
};
```

### encrypt section

Three encryption strategies via `javascript-obfuscator` and `bytenode`:

| Type | Target | Description |
|---|---|---|
| `confusion` | Both | Obfuscation only (javascript-obfuscator) |
| `bytecode` | Electron only | V8 bytecode compilation (bytenode), frontend not supported |
| `strict` | Both | Obfuscation + bytecode combined (obfuscate first, then compile) |
| `none` | Both | Skip encryption |

```js
module.exports = {
  encrypt: {
    frontend: {
      type: 'confusion',
      files: ['./frontend/dist/**/*.js'],
      confusionOptions: {
        compact: true,
        stringArray: true,
        stringArrayEncoding: ['none'],
        target: 'browser',
      },
    },
    electron: {
      type: 'strict',
      files: ['./public/electron/**/*.js'],
      specificFiles: ['./public/electron/preload/bridge.js'],
      entryFiles: ['./public/electron/main.js'],
      confusionOptions: {
        compact: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        target: 'node',
      },
      bytecodeOptions: {
        electron: true,
      },
      silent: false,  // Suppress javascript-obfuscator promotional banner
    },
  },
};
```

- `specificFiles`: Files that always use confusion even in bytecode/strict mode (e.g., preload scripts that can't be bytecoded)
- `entryFiles`: Main entry files compiled to `.jsc` with a tiny bytenode loader shell
- `bytecodeOptions.electron`: Set `true` to use Electron's V8 version for bytecode compilation

### updater section

```js
module.exports = {
  updater: {
    metadata: './updater.json',
    appFile: './build/output/app.asar',
    builderConfig: './cmd/builder-mac-arm64.json',
    output: './updater/',
    extraResources: ['./go/app'],
    asarUnpacked: ['./public/go/static'],
    cleanCache: true,
  },
};
```

### ohos section

```js
module.exports = {
  ohos: {
    resources: [
      {
        from: './public/dist',
        to: './harmony/entry/src/main/resources/rawfile/dist',
        filter: ['**/*', '!compiled'],
      },
    ],
  },
};
```

Follows electron-builder's `extraResources` FileSet pattern with globby filter support (including negation patterns).

## Bundling Pipeline

### Bundle vs Copy Mode

- **`bundleType: 'bundle'`**: esbuild bundles the entire `electron/` directory into a single `main.js` with `bundleRegistryPlugin`. Preload scripts and jobs are transpiled individually (`bundle: false`) because they need separate files for `child_process.fork()`.
- **`bundleType: 'copy'`**: Direct file copy of `electron/` to `public/electron/` with per-file TypeScript transpilation. No bundling, no registry.

### Controller & Config Registry

The `bundleRegistryPlugin` esbuild plugin scans:

1. `electron/controller/` — generates `app:controller-registry` virtual module setting `global.__EE_CONTROLLER_REGISTRY__` with lazy getters (`get module() { return require(...) }`)
2. `electron/config/` — generates `app:config-registry` virtual module setting `global.__EE_CONFIG_REGISTRY__` with lazy getters

Property paths are computed via `defaultCamelize` with `caseStyle: 'lower'` (e.g., `foo_bar/my-controller.js` → properties `['fooBar', 'myController']`).

The plugin re-scans directories on each build (`onStart`), supporting file additions/deletions in watch/rebuild mode.

### Bundle Entry

The `app:bundle-entry` virtual module loads in order: config registry → controller registry → real `main.js`. This ensures registries are populated before app startup, but controllers/configs are only loaded on demand (via lazy getters).

### Format Selection

The output format is determined by `build.electron.format` in config (default: `'cjs'`). TypeScript entry (`main.ts`) does NOT imply ESM output — `main.ts` can produce CJS format. CJS is recommended for Electron main process.

### Output Structure

After bundling, `public/electron/` contains:

```
public/electron/
├── main.js              # Bundled main process (controllers, services, config)
├── jobs/                # Per-file transpiled (child_process.fork needs separate files)
└── preload/
    └── bridge.js        # Transpiled preload script
```

## Development Mode Flow

1. Set `NODE_ENV=dev`, load and merge config
2. Bundle Electron code via esbuild + registry plugin → switch `package.json` `main` to `./public/electron/main.js`
3. If `electron.watch=true`: monitor `electron/` via chokidar, debounce changes, re-bundle, kill old process, respawn
4. `multiExec()` starts all configured subprocesses (frontend dev server + Electron) concurrently
5. SIGINT/SIGTERM: kill all child processes, restore `package.json` `main`, exit

## Build Mode Flow

1. Set `NODE_ENV=prod` (or specified env)
2. If `cmds` includes `electron`: bundle via esbuild → remove from command list → switch `package.json` `main`
3. `multiExec()` runs remaining commands sequentially (frontend build, then platform packaging via electron-builder)
4. Restore `package.json` `main` after completion

## Incremental Updater

`ee-bin updater` generates update packages containing only changed portions of the asar archive:

- Reads electron-builder metadata YAML for version, file list, SHA512 hashes
- Auto-adjusts `.asar` extension based on builder config `asar:true/false`
- Creates zip containing app + extraResources + asarUnpacked modules
- Generates SHA1 for the zip, SHA512 for full package, verifies SHA512 matches metadata
- Writes JSON metadata: version, filename, size, sha1, fullFile info, force flag, releaseDate

## Icon Generation

`ee-bin icon` generates platform-specific icons from a source image (default: `/public/images/logo.png`):

- `.ico` for Windows (256px)
- `.png` at configurable sizes (default: 16, 32, 64, 256, 512)
- Post-processing: 16px → `tray.png` in public/images/, 32px → window icon, others → `NxN.png` in build/icons/

Requires `icon-gen` optional dependency.

## HarmonyOS (OpenHarmony) Support

`ee-bin ohos --cmds=resources` extracts build artifacts to HarmonyOS HAP resource directories following the `extraResources` FileSet pattern (`from/to/filter`). Filter patterns use globby with negation support (e.g., `"!compiled"`).

## Internal Libraries

ee-bin bundles lightweight replacements for common npm packages to reduce dependency footprint:

| Replacement | Replaces | Features |
|---|---|---|
| `lib/extend.ts` | `lodash.merge` | Deep merge, prototype pollution guard, self-reference detection |
| `lib/helpers.ts` | `is-type-of`, `chalk`, `fs-extra`, `debug` | `is.function/class`, ANSI colors, `copyDirSync`, `createDebug` |
| `lib/utils.ts` | Multiple | `loadConfig`, `loadFile`, `rm`, `readJsonSync`, `writeJsonSync` |

## Build

```bash
npm run build          # Build CJS + ESM + make entry executable
npm run build:esm      # Build ESM only
npm run build:cjs      # Build CommonJS only
npm run typecheck      # TypeScript type checking
npm run test           # Run vitest
npm run lint           # ESLint check
npm run clean          # Remove dist directory
```

## Requirements

- Node.js >= 20.19.0
- esbuild >= 0.28
- `icon-gen` is an optional dependency — icon generation requires it installed

## Notes

- ee-bin is a CLI tool only — it is never part of the Electron app runtime
- After modifying ee-bin TypeScript source, rebuild with `npm run build` before testing
- Sourcemap `false` (default) means auto — dev uses `inline`, prod disables
- CJS format (`format: 'cjs'`) is recommended for Electron main process bundles
- The `move` command performs copy operations (not actual moves) for safety
