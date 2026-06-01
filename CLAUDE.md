# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**electron-egg (ee-dev-v5)** — an enterprise-grade desktop application framework based on Electron. The project uses TypeScript packages (`ee-core`, `ee-bin`) that output dual CJS + ESM formats, replacing the original JS versions (`ee-core-js`, `ee-bin-js`).

## Architecture

pnpm workspace monorepo:

```
ee-dev/
├── packages/
│   ├── ee-core/        # TypeScript framework core (dual CJS/ESM)
│   │   └── src/
│   │       ├── app/        # boot, application, events, dir
│   │       ├── config/     # Config loading/merging
│   │       ├── controller/ # Controller loader (registry + globby)
│   │       ├── core/       # FileLoader, utils
│   │       ├── cross/      # IPC communication
│   │       ├── electron/   # Electron app/window management
│   │       ├── jobs/       # ChildJob, ChildPoolJob, LoadBalancer
│   │       ├── loader/     # loadFile, requireFile, resolveModule
│   │       ├── log/        # Pino-based logging (pino-roll + pino-pretty)
│   │       ├── socket/     # socketServer, httpServer, ipcServer
│   │       ├── storage/    # SqliteStorage (better-sqlite3)
│   │       ├── types/      # TypeScript type definitions
│   │       └── utils/      # extend, is, json, wrap, helper
│   └── ee-bin/          # TypeScript CLI build tool (dual CJS/ESM)
│       └── src/
│           ├── config/     # bin_default.ts
│           ├── plugins/    # controller_registry_plugin.ts (esbuild)
│           ├── tools/      # serve, encrypt, move, iconGen, incrUpdater
│           └── types/      # BinConfig, BundleConfig, etc.
├── electron/            # Application code (main process source)
│   ├── main.js          # Entry point
│   ├── config/          # config.default.js / config.local.js / config.prod.js
│   ├── controller/      # Business controllers
│   ├── service/         # Business services
│   ├── preload/         # bridge.js, lifecycle.js
│   └── jobs/            # Background tasks (child_process.fork)
├── frontend/            # Vue 3 + Ant Design (Vite)
├── cmd/                 # bin.js (project config), builder*.json
├── go/                  # Optional Go backend
├── python/              # Optional Python/FastAPI backend
├── build/               # Electron-builder configs & scripts
└── public/              # Static assets (images, html, ssl)
```

### Bundle Output Structure

After `pnpm build-electron`, `public/electron/` contains:

```
public/electron/
├── main.js              # Bundled main process (controllers, services, config all bundled in)
├── jobs/                # Copied as-is (child_process.fork requires separate files)
└── preload/
    └── bridge.js        # Copied as-is (BrowserWindow preload script)
```

## Key Patterns

### Controller Loading Pipeline

**Build time** (ee-bin): `controllerRegistryPlugin` esbuild plugin scans `electron/controller/`, computes property paths (replicating `defaultCamelize` with `caseStyle: 'lower'`), and generates a virtual module `ee-core:controller-registry` that sets `global.__EE_CONTROLLER_REGISTRY__` with **lazy getters** (`get module() { return require('./path'); }`).

**Bundle entry** (`ee-core:bundle-entry`): First requires the registry module, then requires the real `main.js`. This ensures controllers are registered before the app starts but only loaded when `FileLoader.parseFromRegistry()` runs (avoiding initialization order issues).

**Runtime** (ee-core): `ControllerLoader.load()` checks `globalThis.__EE_CONTROLLER_REGISTRY__`. If present (bundle mode), `FileLoader.parseFromRegistry()` reads from the registry. If absent (dev without bundle), falls back to globby filesystem scanning + `require()`.

### ElectronEgg Lifecycle

Boot → loadConfig → loadLog → loadDir → loadController → loadSocket → loadElectron

### IPC Communication

Main ↔ renderer via `ee-core/cross` (IPC, socket.io, HTTP server). Channels follow pattern `controller/{name}/{method}`.

### Config Loading Pipeline

**Build time** (ee-bin): `controllerRegistryPlugin` scans `electron/config/` and generates a virtual module `app:config-registry` that sets `global.__EE_CONFIG_REGISTRY__` with lazy getters.

**Bundle entry** (`app:bundle-entry`): Loads config registry, then controller registry, then the real `main.js`.

**Runtime** (ee-core): `ConfigLoader._loadConfig()` checks `globalThis.__EE_CONFIG_REGISTRY__`. If present (bundle mode), finds the config by filename and calls it with `appInfo`. If absent (dev without bundle), falls back to filesystem `loadFile()`.

### Config Layering (dev mode only)

`config.default.js` → `config.local.js` / `config.prod.js`, merged by ee-core config loader.

### Format Auto-Detection

`_bundleWithRegistry()` detects entry file type: `electron/main.js` → CJS output, `electron/main.ts` → ESM output.

## Commands

### Development
```bash
pnpm dev              # Start full dev (frontend + electron)
pnpm dev-frontend     # Dev frontend only
pnpm dev-electron     # Dev electron only
pnpm dev-go           # Run Go backend
pnpm dev-python       # Run Python backend
pnpm start            # Production start
```

### Build
```bash
pnpm build            # Build frontend + electron + encrypt
pnpm build-frontend   # Build & move frontend dist
pnpm build-electron   # Build electron (esbuild bundle)
```

### Platform Packaging
```bash
pnpm build-w          # Windows (64-bit)
pnpm build-m          # macOS
pnpm build-m-arm64    # macOS ARM64
pnpm build-l          # Linux
```

### Package Development
```bash
cd packages/ee-core
npm run build          # Build CJS + ESM + generate exports map
npm run build:cjs      # Build CommonJS only
npm run build:esm      # Build ESM only
npm run typecheck      # TypeScript type checking
npm run test           # Run vitest

cd packages/ee-bin
npm run build          # Build CJS + ESM
npm run typecheck      # TypeScript type checking
npm run test           # Run vitest
```

### Other
```bash
pnpm encrypt           # Bytecode/obfuscation encryption
pnpm icon              # Generate app icons
pnpm re-sqlite         # Rebuild better-sqlite3 for Electron
```

## Build Configuration (cmd/bin.js)

The `build.electron` section controls esbuild bundling:

```js
electron: {
  bundleType: 'bundle',  // 'bundle' | 'copy'
  external: [],          // User-defined externals (packages: 'external' covers most)
  sourcemap: false,      // 'inline' | 'external' | false; default: dev→inline, prod→off
  minify: false,         // true | false; minify code for production
  drop: undefined,       // ['console', 'debugger']; remove statements for production
  keepNames: false,      // true | false; preserve function/class names when minifying
  legalComments: undefined, // 'inline' | 'eof' | 'none'; handle license comments
  define: undefined,     // { 'process.env.X': '"value"' }; compile-time constants
  copy: undefined,       // ['assets', 'data/db.json']; extra dirs/files from electron/ to copy
  format: undefined,     // 'cjs' | 'esm'; default: 'cjs' (recommended for Electron)
}
```

**Framework-managed externals** (explicit list for documentation + performance, most already covered by `packages: 'external'`): `ee-core`, `ee-bin`, `electron`, `better-sqlite3`, `proxy-agent`, `pino-roll`, `pino-pretty`.

**Sourcemap behavior**: `false` (default) means auto — dev environment uses `inline`, prod disables. Set explicitly to `'inline'` or `'external'` to override.

**Format behavior**: Default `cjs` is recommended for Electron main process. ESM mode requires all business code (controllers, services, config) to be ESM-compatible.

## VS Code Debugging

Two configurations in `.vscode/launch.json`:

- **Debug Electron** (F5): Pre-launch task bundles with `--env=dev` (inline sourcemap), then launches Electron with `--inspect=9229`. Breakpoints go in `electron/` source files — sourcemap maps back from `public/electron/main.js`.
- **Attach Electron**: Attach to an already-running Electron process on port 9229.

## Troubleshooting

**When diagnosing startup or runtime issues, enable DEBUG logging first.** ee-core uses the `debug` library with namespaced loggers (`ee-core:config:*`, `ee-core:controller:*`, `ee-core:core:loader:*`, etc.). Turning these on surfaces the actual runtime state (merged config, loaded registries, resolved paths) directly, which is far faster than reading source and inferring behavior.

```bash
pnpm debug-electron                      # all ee-* namespaces (DEBUG=ee-*)
pnpm debug-dev                           # all ee-* namespaces, full dev (frontend + electron)
DEBUG='ee-core:config:*' pnpm dev-electron     # scope to one subsystem, e.g. config loading
```

Recommended workflow for "service/feature didn't start" type bugs:
1. **Rebuild the packages first so the running code is current.** ee-core and ee-bin run from `node_modules/*/dist` (symlinked to `packages/*`), so stale `dist` is a common cause of "my fix had no effect" confusion — rebuild both before investigating:
   ```bash
   (cd packages/ee-core && pnpm run build) && (cd packages/ee-bin && pnpm run build)
   ```
2. Reproduce with the narrowest relevant DEBUG namespace and read what the runtime actually printed (e.g. the merged config object) before forming a hypothesis.
3. If two related things fail together (e.g. http + socket servers both silent), suspect a shared upstream (config/registry loading), not each implementation.
4. After any further ee-core/ee-bin source edit, rebuild the affected package again before re-testing — otherwise you'll run stale code.

See `docs/bugfix/` for concrete worked examples.

## Important Notes

- **ee-core and ee-bin are standalone npm packages**: They will be published to npm independently. The current pnpm workspace monorepo (`packages/ee-core`, `packages/ee-bin` with `workspace:*` in root `package.json`) is for local development convenience only. In production use, users install them from npm via `npm install ee-core ee-bin`.
- **ee-core is NOT bundled into main.js**: ee-core is an esbuild external, loaded from `node_modules` at runtime. This allows `child_process.fork()` to find the child process entry (`app.js`) as a real file on disk within `node_modules/ee-core/`. ee-bin is a CLI build tool and is never part of the Electron app runtime.

- **Package manager**: pnpm only (`.npmrc` has `shamefully-hoist=true` for Electron compatibility)
- **Registry**: npmmirror configured in `.npmrc`
- **Root `package.json` references `ee-core` and `ee-bin` as `workspace:*`** — package changes are reflected immediately
- **ESM imports in ee-core source must include `.js` extensions** (required by `module: NodeNext`): `import { X } from './foo.js'` not `from './foo'`
- **The `exports` map in ee-core's `package.json` is auto-generated** by `scripts/gen-exports.js` — do not edit manually; run `npm run gen-exports` after adding new subpath modules
- **Better-sqlite3 requires native rebuild** for Electron: use `pnpm re-sqlite` if you see native module errors
- **Node.js minimum version**: v20
- **After modifying ee-core or ee-bin TypeScript source**, rebuild with `npm run build` in the respective package directory before testing
- **`debug-dev` and `debug-electron` scripts** use `cross-env DEBUG=ee-*` for verbose logging
