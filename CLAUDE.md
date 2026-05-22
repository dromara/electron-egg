# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **electron-egg (ee-dev-v5)** — an enterprise-grade desktop application framework based on Electron. The project is undergoing a TypeScript rewrite from the original CommonJS JavaScript modules (`ee-core-js`, `ee-bin-js`) to new TypeScript editions (`ee-core`, `ee-bin`), outputting dual CJS + ESM formats.

## Architecture

The project uses a **pnpm workspace** monorepo structure:

```
ee-dev-v5/
├── packages/          # Core framework packages (pnpm workspace)
│   ├── ee-core/       # [NEW] TypeScript rewrite — dual CJS/ESM output
│   ├── ee-bin/        # [NEW] TypeScript rewrite — CLI build tool
│   ├── ee-core-js/    # [OLD] Original JS version (to be replaced)
│   └── ee-bin-js/     # [OLD] Original JS version (to be replaced)
├── electron/          # Application code (Electron main process)
│   ├── main.js        # Entry point — creates ElectronEgg, registers lifecycle
│   ├── config/        # Environment configs (default, local, prod)
│   ├── controller/    # Business controllers (loaded by ee-core)
│   ├── service/       # Business services (os, database, cross)
│   ├── preload/       # Preload scripts (bridge, lifecycle)
│   └── jobs/          # Background job tasks
├── frontend/          # Vue 3 + Ant Design frontend (Vite)
├── go/                # Optional Go backend service
├── python/            # Optional Python/FastAPI backend service
├── build/             # Electron-builder configs & scripts
└── public/            # Static assets (images, html, ssl)
```

### ee-core Module Structure (TypeScript)

The core framework organizes into these subpath exports: `app`, `config`, `const`, `controller`, `core`, `cross`, `electron`, `exception`, `html`, `jobs`, `loader`, `log`, `message`, `ps`, `socket`, `storage`, `types`, `utils`. Each has a barrel `index.ts` and is exported as a subpath in `package.json` exports map (auto-generated via `scripts/gen-exports.js`).

### Key Patterns

- **ElectronEgg lifecycle**: Boot → loadConfig → loadLog → loadDir → loadController → loadSocket → loadElectron. Controllers and services follow a class-based pattern with `toString()` returning `[class ClassName]`.
- **IPC communication**: Main process ↔ renderer via `ee-core/cross` (IPC, socket, HTTP server). Cross-process calls use `Cross.call()` or `ChildMessage`.
- **Job system**: Background tasks in `electron/jobs/` managed by `ee-core/jobs` (ChildProcess pool, LoadBalancer).
- **Config layering**: `config.default.js` → `config.local.js` / `config.prod.js` merged by ee-core config loader.
- **Dual output**: ee-core and ee-bin compile TypeScript to `dist/esm/` (NodeNext module) and `dist/cjs/` (CommonJS), with conditional exports in package.json.

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
pnpm build-electron   # Build electron
```

### Platform Packaging
```bash
pnpm build-w          # Windows (64-bit)
pnpm build-m          # macOS
pnpm build-m-arm64    # macOS ARM64
pnpm build-l          # Linux
```

### Package Development (ee-core / ee-bin)
```bash
cd packages/ee-core
npm run build          # Build CJS + ESM + generate exports map
npm run build:cjs      # Build CommonJS only
npm run build:esm      # Build ESM only
npm run typecheck      # TypeScript type checking (no emit)
npm run test           # Run vitest
npm run clean          # Remove dist/

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

## Important Notes

- **Package manager**: pnpm only (configured in `.npmrc` with `shamefully-hoist=true` for Electron compatibility)
- **Registry**: npmmirror (Chinese npm mirror) configured in `.npmrc`
- **The root `package.json` references `ee-core` and `ee-bin` as `workspace:*`** — changes to packages are reflected immediately without publishing
- **ESM imports in ee-core source must include `.js` extensions** (required by `module: NodeNext`): `import { X } from './foo.js'` not `from './foo'`
- **The `exports` map in ee-core's package.json is auto-generated** by `scripts/gen-exports.js` — do not edit manually; run `npm run gen-exports` after adding new subpath modules
- **The old JS packages (`ee-core-js`, `ee-bin-js`) are still present** but will be removed once the TS rewrite is validated. See `REFACTOR_PLAN.md` for full migration plan.
- **Better-sqlite3 requires native rebuild** for Electron: use `pnpm re-sqlite` if you see native module errors
- **`debug-dev` and `debug-electron` scripts** use `cross-env DEBUG=ee-*` for verbose logging during development