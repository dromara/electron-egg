# ee-bin `dev` 开发体验优化设计

日期：2026-05-31
范围：`packages/ee-bin`（dev 命令）+ 项目 `cmd/bin.js`

## 背景与问题

`pnpm dev` 当前行为（已通过读源码确认）：

1. `serve.ts` 的 `dev()` 启动时调用 `this.bundle()` → 每次都执行一次**全新 esbuild 全量打包**，再切 `package.json` main 指向 `public/electron/main.js`，然后 spawn `electron . --env=local`（加载打包产物）。
2. `bin_default.ts` 与项目 `cmd/bin.js` 均为 `dev.electron.watch: false`，因此**主进程源码改动不会触发任何重建或重启**。
3. `multiExec()` 把 frontend 与 electron **并行 spawn**，electron 可能在 Vite dev server ready 之前就 `loadURL`，导致**白屏 / connection refused**，需手动刷新。

三个痛点：启动慢（每次冷启动 esbuild）、主进程不热更、启动竞态白屏。

## 关键约束（已验证）

- `electron/` 应用源码**全是 TypeScript**（`main.ts` + `*.ts` controller/config）。
- ee-core 的 dev fallback（无 registry 时）只 globby 扫描 `**/*.js` / `**/*.jsc` 并用 CJS `require()` 加载，**无法直接加载 `.ts`**。
- 因此「dev 不打包、直接跑 TS 源码」不可行（需往 Electron 注入 tsx + 改 ee-core loader，侵入过大）。**dev 必须经过打包**，优化方向是让打包更快、更自动，并协调启动顺序。
- esbuild 版本 `^0.28.0`，支持 `context()` / `rebuild()` / `dispose()`。

## 设计方案（三项）

### 1. esbuild 增量编译（提速启动 + 提速重启）

引入 esbuild `context()` API 替代每次全量 `build()`。

- 在 `ServeProcess` 新增实例字段 `private bundleCtx`（esbuild `BuildContext | null`，初始 `null`）。
- 新增私有方法 `_getBundleContext(bundleConfig)`：首次用 `esbuild.context(options)` 创建并缓存到 `this.bundleCtx` 后返回；后续直接返回缓存。esbuild options 的构造逻辑从现有 `_bundleWithRegistry()` 抽取复用（避免重复）。
- 新增私有方法 `_devBundle(bundleConfig)`：调用 `ctx.rebuild()`（首次全量、之后增量），随后执行产物后处理（重命名 `app_bundle-entry.js` → `main.js`、sourcemap 重命名、`_copyUnbundledFiles`）。把这部分后处理逻辑从 `_bundleWithRegistry()` 抽成一个共享私有方法 `_postBundle(outdir, bundleConfig)` 供两边复用。
- `dev()` 中：冷启动与 watch 变更都改为 `await this._devBundle(binCfg.build.electron)`。
- `_closeProcess()` 中：若 `this.bundleCtx` 存在则 `await this.bundleCtx.dispose()` 再退出，释放 esbuild 资源。

`bundle()` / `_bundleWithRegistry()`（build 命令用的一次性全量打包）保持原行为不变——build 是一次性流程，不使用 context。仅 dev 路径走增量 context。`copy` 模式（`bundleType: 'copy'`）在 dev 下仍走原 `bundle()` 复制逻辑，不进 context（context 仅针对 esbuild bundle 模式）。

### 2. 主进程 watch 默认开启（主进程改动自动重启）

- `bin_default.ts`：`dev.electron.watch` 默认值 `false` → `true`。
- 项目 `cmd/bin.js`：`dev.electron.watch` `false` → `true`（用户配置会覆盖框架默认，故需一并改，确保开箱即用）。
- 现有 chokidar + tree-kill 重启逻辑保留，仅把其中的 `await this.bundle(...)` 换成 `await this._devBundle(...)`（走增量）。

效果：改 `electron/` 源码 → 防抖 → 增量重建 → SIGKILL 旧 electron → respawn。用户仍可在 `cmd/bin.js` 关掉。

### 3. wait-on 协调启动顺序（消除白屏竞态）

- `packages/ee-bin/package.json` dependencies 新增 `wait-on`。
- `dev()` 中，当待启动命令同时包含 `frontend` 与 `electron`、且 `dev.frontend.protocol` 为 `http://`（HTTP dev server）时，**拆分启动**：
  1. 先 `multiExec` 仅启动 `frontend`。
  2. 用 `wait-on` 等 `http://${hostname}:${port}`（从 `dev.frontend` 的 `hostname`/`port` 读，默认 `localhost:8080`），带超时（默认 30s）。
  3. ready（或**超时**）后，再 bundle（已在步骤上方完成）+ `multiExec` 启动 `electron`。
- **超时策略（已确认）**：wait-on 超时不报错退出，而是打印警告后**仍然启动 electron**，避免前端启动慢时整个 dev 卡死。
- 前端为 `file://`（dev 下本就跳过前端启动）时，不等待，保持现有并行/直起行为。
- 仅启动单一命令（只 `electron` 或只 `frontend`）时，不触发拆分等待逻辑。

## 配置类型变更

`types/config.ts` 的 `ExecConfig` 新增可选字段（用于 wait-on 行为可调，均有默认值、向后兼容）：

- `waitTimeout?: number` — wait-on 超时毫秒数，默认 30000。

`hostname` / `port` / `protocol` 字段已存在，直接复用。

## 涉及文件清单

- `packages/ee-bin/src/tools/serve.ts` — context 增量编译、后处理抽取复用、拆分启动 + wait-on、dispose 清理
- `packages/ee-bin/src/types/config.ts` — `ExecConfig` 新增 `waitTimeout?`
- `packages/ee-bin/src/config/bin_default.ts` — `dev.electron.watch` 默认 `true`
- `packages/ee-bin/package.json` — 新增 `wait-on` 依赖
- `cmd/bin.js` — 项目侧 `dev.electron.watch` `false` → `true`

## VS Code 断点调试（不受本次 dev 优化影响）

`electron/` 全是 TS，VS Code 通过 **inline sourcemap** 实现源码断点，机制独立于 `ee-bin dev`：

- `.vscode/launch.json` 两个配置 `Debug Electron` / `Debug Full App`，preLaunch 任务跑的是 **`ee-bin build --cmds=electron --env=dev`**（一次性全量打包，走 `bundle()` / `_bundleWithRegistry()`），`--env=dev` 下 sourcemap auto 模式产出 inline sourcemap，把 `electron/**/*.ts` 内嵌进 `public/electron/main.js`。
- Electron 以 `--inspect=9229` 启动加载打包产物，`sourceMaps: true` + `resolveSourceMapLocations`（含 `electron/**`、`public/electron/**`）令 VS Code 把断点映射回 `.ts` 源文件。
- 调试链路用的是 **build 路径**，与本次要改的 **dev 增量 context 路径**互相独立。本设计明确 `bundle()` / `_bundleWithRegistry()` 保持原行为不变，故**调试不受影响**，`.vscode/` 配置无需改动。

**已实测验证**：`ee-bin build --cmds=electron --env=dev` 产出的 `public/electron/main.js` 确认含合法 inline sourcemap（`sourceMappingURL=data:application/json;base64,...`，解码含 `"version":3,"sources":`），临时入口文件已正确重命名为 `main.js` 无残留。（F5 启动调试器命中断点需在 VS Code 内手动操作。）

## 验证

- `cd packages/ee-bin && npm run typecheck` 通过。
- `cd packages/ee-bin && npm run build` 通过（产出 CJS + ESM）。
- `cd packages/ee-bin && npm run test`（若有相关用例）通过。
- 手动：根目录 `pnpm dev` —— 观察 (a) 启动时 electron 等前端 ready 后再起、无白屏；(b) 改 `electron/controller/*.ts` 触发增量重建 + 主进程重启；(c) 二次重建明显快于冷启动。

## 风险与权衡

- dev 与 prod 代码路径仍一致（都打包），不引入新分叉，风险低。
- `context()` 的增量缓存常驻内存，dev 进程结束需 `dispose()` 释放——已在 `_closeProcess()` 处理。
- 新增一个运行时依赖 `wait-on`（用户已确认接受），换取成熟可靠的多协议等待能力。
- watch 默认开启会让主进程改动自动重启，丢失窗口状态——这是 Electron 主进程重启的固有代价（非热替换），属预期行为。
