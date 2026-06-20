# ee-core

Enterprise-grade Electron application framework core — TypeScript edition with dual CJS + ESM module support.

## Overview

`ee-core` is the runtime foundation for [electron-egg](https://github.com/wallace5303/electron-egg) applications. It handles the complete lifecycle from boot to shutdown: configuration loading, controller registration, IPC communication, window management, logging, storage, background jobs, and cross-process coordination.

The package outputs dual module formats (CJS + ESM) via conditional exports in `package.json`, making it compatible with both `require()` and `import` environments.

## Installation

```bash
npm install ee-core
```

## Subpath Exports

ee-core exposes fine-grained subpath modules. Each can be imported individually:

```ts
// Main entry (boot, app, config, events, etc.)
import { ElectronEgg } from 'ee-core';

// Specific submodules
import { ControllerLoader } from 'ee-core/controller';
import { Cross, cross } from 'ee-core/cross';
import { extend, is } from 'ee-core/utils';
import { SqliteStorage } from 'ee-core/storage';
import { ChildJob, ChildPoolJob, LoadBalancer } from 'ee-core/jobs';
import type { Config, DevConfig } from 'ee-core/types';
```

Available subpaths:

| Subpath | Description |
|---|---|
| `ee-core` | Main entry — boot, application, config, events, all modules |
| `ee-core/app` | Application lifecycle, event bus, directory init |
| `ee-core/config` | Configuration loading and merging |
| `ee-core/const` | IPC channel and event constants |
| `ee-core/controller` | Controller loader and registry |
| `ee-core/core` | FileLoader, Timing, core utilities |
| `ee-core/cross` | External process management (Go/Python backends) |
| `ee-core/electron` | Electron app/window management |
| `ee-core/exception` | Global exception handling (uncaught/unhandled) |
| `ee-core/html` | Static HTML page path utility (failure pages) |
| `ee-core/jobs` | Background jobs (ChildJob, ChildPoolJob, LoadBalancer) |
| `ee-core/loader` | File/module loading utilities |
| `ee-core/log` | Pino logging (pino-roll + pino-pretty) |
| `ee-core/message` | Child process IPC message routing |
| `ee-core/ps` | Process state, environment detection, path utilities |
| `ee-core/socket` | Socket.IO, HTTP (Koa), IPC servers |
| `ee-core/storage` | SQLite storage (better-sqlite3) |
| `ee-core/types` | TypeScript type definitions |
| `ee-core/utils` | extend, is, json, wrap, helper, pargv, port, ip |

## Architecture

### Lifecycle

The `ElectronEgg` startup sequence is strictly ordered:

```
init() → loadException → loadConfig → loadDir → loadLog
run() → loadController → loadSocket → emitLifecycle(Ready) → loadElectron
```

Exception handling must register first to catch subsequent errors; config is the foundation for all modules; directories must exist before writing logs; controllers precede communication services; Ready fires after core modules are loaded; Electron starts last.

### Lifecycle Events

Five framework milestones managed by `EventBus`:

| Event | When |
|---|---|
| `Ready` | Core modules loaded, before Electron |
| `ElectronAppReady` | `app.whenReady()` completed |
| `WindowReady` | BrowserWindow created |
| `BeforeClose` | Window close triggered |
| `Preload` | Preload scripts executing |

Register handlers via `app.register(eventName, handler)` or custom events via `eventBus.on()/emit()`.

### Controller Loading Pipeline

- **Build time** (ee-bin): `bundleRegistryPlugin` scans `electron/controller/`, computes property paths (`defaultCamelize` with `caseStyle: 'lower'`), generates `app:controller-registry` virtual module setting `global.__EE_CONTROLLER_REGISTRY__` with lazy getters (`get module() { return require(...) }`).
- **Bundle entry** (`app:bundle-entry`): loads config registry → controller registry → real `main.js`.
- **Runtime** (ee-core): If `globalThis.__EE_CONTROLLER_REGISTRY__` exists (bundle mode), `FileLoader.parseFromRegistry()` reads from it. Otherwise, falls back to filesystem scanning via `scanDirSync()`.

### Configuration Loading Pipeline

Same dual-mode pattern as controllers:

- **Build time** (ee-bin): `bundleRegistryPlugin` scans `electron/config/`, generates `app:config-registry` virtual module.
- **Runtime** (ee-core): If `globalThis.__EE_CONFIG_REGISTRY__` exists, `ConfigLoader._loadConfig()` loads by filename. Otherwise, reads from filesystem using `loadFile()`.

Config layering (dev mode only): `config.default.js` → `config.local.js` / `config.prod.js`, merged by `ConfigLoader`.

### Communication Services

Three channels created in order during `loadSocket()`:

| Server | Use Case | Implementation |
|---|---|---|
| `SocketServer` | Third-party process communication (Go/Python) | Socket.IO |
| `HttpServer` | RESTful API for external HTTP clients | Koa + middleware |
| `IpcServer` | Main ↔ renderer process | `ipcMain.handle/on` + `ipcRenderer.invoke/send` |

All share `resolveControllerFn()` routing — channel pattern: `controller/{name}/{method}`.

### Window Loading Strategy

`loadServer()` selects strategy based on config and environment:

1. **Remote mode** (`remote.enable=true`) → Load remote URL
2. **Dev mode** → Poll frontend dev server (`waitForUrl`), show loading page first
3. **Prod + cross takeover** → Wait for cross-process service to be ready
4. **Prod (default)** → Load local HTML file

## Key APIs

### Boot & Application

```ts
import { ElectronEgg } from 'ee-core';

// Start the framework
const boot = new ElectronEgg();

// Async startup (ESM)
await boot.runAsync();
```

### Configuration

```ts
import { getConfig, setConfig } from 'ee-core/config';

const config = getConfig();

// Child processes can receive config without filesystem access
setConfig(config);
```

### Controller

```ts
import { getController, getControllers } from 'ee-core/controller';

// Get specific controller
const userController = getController('user');

// Get all loaded controllers
const all = getControllers();
```

### Cross-Process Communication

```ts
import { cross } from 'ee-core/cross';
import type { CrossTargetConfig } from 'ee-core';

// Run Go backend with custom config
const opt: CrossTargetConfig = {
  name: 'goapp',
  cmd: path.join(getExtraResourcesDir(), 'goapp'),
  directory: getExtraResourcesDir(),
  args: ['--port=7073'],
  appExit: true,
};
const entity = await cross.run('go', opt);

// Get service URL
const url = cross.getUrl('goapp');

// Kill by name
cross.killByName('goapp');
```

### Communication Servers

```ts
import { getSocketServer, getHttpServer, getIpcServer } from 'ee-core/socket';

// All getters return non-null instances after Ready event
const socket = getSocketServer();
const http = getHttpServer();
const ipc = getIpcServer();
```

### Main Window

```ts
import { getMainWindow } from 'ee-core/electron';

// Returns BrowserWindow (non-null) after WindowReady event
const win = getMainWindow();
win.setMenuBarVisibility(false);
```

### Jobs

```ts
import { ChildJob, ChildPoolJob, LoadBalancer, AlgorithmType } from 'ee-core/jobs';

// Single task execution
const job = new ChildJob();
const result = await job.exec('./jobs/demo.js', { taskName: 'cleanup' });

// Process pool with load balancing
const pool = new ChildPoolJob();
pool.create(3); // Create 3 workers
const result = await pool.run('./jobs/demo.js', { taskName: 'batch' });

// 8 algorithms: polling, weights, random, specify, weightsPolling,
// weightsRandom, minimumConnection, weightsMinimumConnection
```

### Storage

```ts
import { SqliteStorage } from 'ee-core/storage';

// Four modes: memory, onlyName, relative, absolute
const db = new SqliteStorage({ mode: 'onlyName', name: 'app' });
```

### Logging

```ts
import { logger, coreLogger } from 'ee-core/log';

// Supports three call styles: pino standard, pino printf, concatenation
logger.info('Application started');
logger.info('User %s logged in', 'admin');
logger.info('data:', { id: 1, name: 'test' });

// Log files: ee.log, ee-core.log, ee-error.log
// Rotation: daily/hourly via pino-roll
// Dev mode: pino-pretty for terminal output
```

### Process/Environment

```ts
import { isDev, isProd, getBaseDir, getDataDir, getLogDir } from 'ee-core/ps';
import { is } from 'ee-core/utils';

if (isDev()) {
  // Development-specific logic
}

// Platform detection
if (is.macOS()) { /* macOS */ }
if (is.windows()) { /* Windows */ }
if (is.linux()) { /* Linux */ }
if (is.openharmony()) { /* OpenHarmony */ }

// Path utilities
const baseDir = getBaseDir();
const dataDir = getDataDir();
const logDir = getLogDir();
const extraRes = getExtraResourcesDir();
```

### Event Bus

```ts
import { eventBus, BeforeClose } from 'ee-core/app';

// Register lifecycle hook
app.register(BeforeClose, async () => {
  // Cleanup before app closes
});

// Custom events
eventBus.on('myEvent', (data) => { /* handle */ });
eventBus.emit('myEvent', { key: 'value' });
```

### Exception Handling

```ts
// Auto-registered during boot. Controls exit behavior:
// exception.mainExit / childExit / rendererExit
// Errors logged via coreLogger, dev mode sends to terminal
```

### Utility Functions

```ts
import { extend, strictParse, getPort, parseArgv, sleep } from 'ee-core/utils';

// Deep merge with prototype pollution guard
const merged = extend(true, {}, defaults, userConfig);

// Port allocation with two-level locking
const port = await getPort({ port: 7070 });

// CLI argument parser
const args = parseArgv(process.argv);

// Sync sleep (Atomics.wait-based, no subprocess)
sleep(1000);
```

## TypeScript Types

All types are exported from `ee-core/types`:

```ts
import type { Config, CrossTargetConfig, DevConfig, AppInfo } from 'ee-core/types';
```

Key type interfaces: `ElectronEggOptions`, `Config`, `AppInfo`, `CrossTargetConfig`, `CrossRunOptions`, `LoggerConfig`, `ExceptionConfig`, `FileLoaderOptions`, `LoadBalancerOptions`, `JobProcessOptions`, `MessageData`.

## Build

```bash
npm run build          # Build CJS + ESM + generate exports map
npm run build:cjs      # Build CommonJS only
npm run build:esm      # Build ESM only
npm run typecheck      # TypeScript type checking
npm run test           # Run vitest
npm run test:watch     # Run vitest in watch mode
```

The `exports` map in `package.json` is auto-generated by `scripts/gen-exports.js`. Do not edit manually — run `npm run gen-exports` after adding new subpath modules.

## Debug Logging

ee-core uses the `debug` library for verbose namespace-scoped logging. Enable to see runtime internals (config merging, controller loading, module resolution):

```bash
DEBUG=ee-* node your-app            # All ee-* namespaces
DEBUG=ee-core:config:* node your-app  # Config subsystem only
DEBUG=ee-core:controller:* node your-app  # Controller loading only
```

## Requirements

- Node.js >= 20.19.0
- Electron >= 28
- Better-sqlite3 requires native rebuild for Electron: use `pnpm re-sqlite` if you see native module errors

## Notes

- ESM imports in ee-core source must include `.js` extensions (required by `module: NodeNext`)
- ee-core is NOT bundled into the Electron main process bundle — it's an esbuild external loaded from `node_modules` at runtime. This allows `child_process.fork()` to find `app.js` as a real disk file
- `getMainWindow()`, `getSocketServer()`, `getHttpServer()`, `getIpcServer()` return non-null instances. If called before the corresponding lifecycle event, they throw an Error indicating a lifecycle ordering bug
- The `exports` map is auto-generated — run `npm run gen-exports` after adding new modules
