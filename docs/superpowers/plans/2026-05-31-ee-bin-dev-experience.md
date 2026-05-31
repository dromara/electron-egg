# ee-bin `dev` 开发体验优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `ee-bin dev` 启动更快（esbuild 增量编译）、主进程改动自动重启（watch 默认开启）、消除前端未 ready 的白屏竞态（wait-on 协调启动）。

**Architecture:** 改动集中在 `packages/ee-bin`。dev 路径用 esbuild `context()`/`rebuild()` 替代每次全量 `build()`，并缓存 context、退出时 dispose；build 路径（`bundle()`/`_bundleWithRegistry()`）保持不变以不影响 VS Code 调试。dev 启动时若同时含 frontend+electron 且前端为 http，则先起前端、wait-on 等其 URL ready（超时仍启动）后再起 electron。

**Tech Stack:** TypeScript (NodeNext, dual CJS/ESM), esbuild ^0.28, chokidar, tree-kill, cross-spawn, wait-on (新增), vitest, commander。

---

## File Structure

- `packages/ee-bin/src/tools/serve.ts` — 核心改动：context 增量编译、后处理抽取复用、wait-on 拆分启动、dispose 清理
- `packages/ee-bin/src/types/config.ts` — `ExecConfig` 新增 `waitTimeout?: number`
- `packages/ee-bin/src/config/bin_default.ts` — `dev.electron.watch` 默认 `true`
- `packages/ee-bin/package.json` — 新增 `wait-on` 依赖
- `cmd/bin.js` — 项目侧 `dev.electron.watch` `false` → `true`
- `packages/ee-bin/test/serve.test.ts` — 新增单测（context 缓存、wait URL 构造）

---

## Task 1: 安装 wait-on 依赖

**Files:**
- Modify: `packages/ee-bin/package.json`（dependencies 段）

- [ ] **Step 1: 在 ee-bin 包内安装 wait-on**

Run（在仓库根目录执行，pnpm workspace 会装到 ee-bin）:
```bash
pnpm --filter ee-bin add wait-on@^8.0.0
```
Expected: `packages/ee-bin/package.json` 的 `dependencies` 出现 `"wait-on": "^8.0.0"`，根 `pnpm-lock.yaml` 更新，命令以 `Done` 结束。

- [ ] **Step 2: 安装 wait-on 的类型定义（devDependency）**

Run:
```bash
pnpm --filter ee-bin add -D @types/wait-on@^5.3.4
```
Expected: `packages/ee-bin/package.json` 的 `devDependencies` 出现 `"@types/wait-on"`。

- [ ] **Step 3: 验证依赖可被解析**

Run:
```bash
node -e "console.log(require.resolve('wait-on', { paths: ['packages/ee-bin'] }))"
```
Expected: 打印出 wait-on 入口文件的绝对路径（不报 MODULE_NOT_FOUND）。

- [ ] **Step 4: Commit**

```bash
git add packages/ee-bin/package.json pnpm-lock.yaml
git commit -m "chore(ee-bin): add wait-on dependency for dev startup coordination"
```

---

## Task 2: `ExecConfig` 新增 `waitTimeout?` 字段

**Files:**
- Modify: `packages/ee-bin/src/types/config.ts`（`ExecConfig` 接口，约 13-40 行）

- [ ] **Step 1: 在 `ExecConfig` 末尾新增字段**

在 `loadingPage?: string;` 之后、接口闭合 `}` 之前，新增：
```typescript
  /** wait-on 等待前端 dev server URL 的超时毫秒数（dev 模式启动协调用），默认 30000 */
  waitTimeout?: number;
```

- [ ] **Step 2: 类型检查通过**

Run:
```bash
cd packages/ee-bin && npm run typecheck
```
Expected: 无错误退出（exit 0）。

- [ ] **Step 3: Commit**

```bash
git add packages/ee-bin/src/types/config.ts
git commit -m "feat(ee-bin): add waitTimeout option to ExecConfig"
```

---

## Task 3: 抽取 bundle 后处理为共享方法 `_postBundle`

重构：把 `_bundleWithRegistry()` 里「重命名产物 + 复制非打包文件 + 打印输出」这段后处理逻辑抽成独立方法，供 dev 增量路径（Task 4）复用。纯重构，行为不变。

**Files:**
- Modify: `packages/ee-bin/src/tools/serve.ts`（`_bundleWithRegistry` 约 399-494 行）

- [ ] **Step 1: 新增 `_postBundle` 私有方法**

在 `_bundleWithRegistry` 方法之后、`_copyUnbundledFiles` 之前，新增：
```typescript
  /**
   * Bundle 后处理（dev 增量与 build 全量共用）
   *   1. 把 esbuild 产出的 app_bundle-entry.js 重命名为 main.js（sourcemap 同理）
   *   2. 复制非打包文件（jobs/、preload/bridge.js、用户自定义 copy）
   *   3. 打印输出路径
   */
  private _postBundle(outdir: string, bundleConfig: BundleConfig): void {
    const outfile = path.join(outdir, 'main.js');

    const bundleEntryFile = path.join(outdir, 'app_bundle-entry.js');
    if (fs.existsSync(bundleEntryFile)) {
      fs.renameSync(bundleEntryFile, path.join(outdir, 'main.js'));
    }

    const bundleEntryMap = path.join(outdir, 'app_bundle-entry.js.map');
    if (fs.existsSync(bundleEntryMap)) {
      fs.renameSync(bundleEntryMap, path.join(outdir, 'main.js.map'));
    }

    this._copyUnbundledFiles(process.cwd(), outdir, bundleConfig);

    console.log(chalk.blue('[ee-bin] ') + `Bundle output: ${outfile}`);
  }
```

- [ ] **Step 2: 改 `_bundleWithRegistry` 调用 `_postBundle`**

把 `_bundleWithRegistry` 中 `await build(options);` 之后到方法结尾的这段（重命名产物、复制文件、打印输出）：
```typescript
    // esbuild replaces ':' in virtual module name 'app:bundle-entry' with '_',
    // so the output file is named 'app_bundle-entry.js' — rename it to 'main.js'
    const bundleEntryFile = path.join(outdir, 'app_bundle-entry.js');
    if (fs.existsSync(bundleEntryFile)) {
      fs.renameSync(bundleEntryFile, path.join(outdir, 'main.js'));
    }

    // Also rename the sourcemap file if it exists
    const bundleEntryMap = path.join(outdir, 'app_bundle-entry.js.map');
    if (fs.existsSync(bundleEntryMap)) {
      fs.renameSync(bundleEntryMap, path.join(outdir, 'main.js.map'));
    }

    // Copy non-bundlable files (child_process.fork and BrowserWindow preload need separate files)
    this._copyUnbundledFiles(cwd, outdir, bundleConfig);

    console.log(chalk.blue('[ee-bin] ') + `Bundle output: ${outfile}`);
```
替换为：
```typescript
    this._postBundle(outdir, bundleConfig);
```
注意：替换后 `_bundleWithRegistry` 内的局部变量 `outfile` 若不再被使用，需一并删除其声明 `const outfile = path.join(outdir, 'main.js');`，避免 TS 未使用变量/lint 报错。

- [ ] **Step 3: 类型检查 + 构建通过**

Run:
```bash
cd packages/ee-bin && npm run typecheck && npm run build
```
Expected: 均 exit 0，无未使用变量错误。

- [ ] **Step 4: 验证 build 行为不变（回归）**

Run（在仓库根目录）:
```bash
pnpm exec ee-bin build --cmds=electron --env=dev && grep -c "sourceMappingURL=data:application/json" public/electron/main.js && ls public/electron/app_bundle-entry.js 2>/dev/null && echo "STRAY!" || echo "clean"
```
Expected: 打印 `1`（inline sourcemap 仍在）后打印 `clean`（无残留入口文件）。

- [ ] **Step 5: Commit**

```bash
git add packages/ee-bin/src/tools/serve.ts
git commit -m "refactor(ee-bin): extract bundle post-processing into _postBundle"
```

---

## Task 4: dev 增量编译（esbuild `context()`/`rebuild()`）

新增 context 缓存字段、`_getBundleContext()` 与 `_devBundle()`，并在退出时 dispose。这是 dev 提速的核心。

**Files:**
- Modify: `packages/ee-bin/src/tools/serve.ts`（import、类字段、`_closeProcess`、新增方法）

- [ ] **Step 1: 引入 esbuild `context` 与 `BuildContext` 类型**

把现有 import：
```typescript
import { build, BuildOptions } from 'esbuild';
```
改为：
```typescript
import { build, context, BuildOptions, BuildContext } from 'esbuild';
```

- [ ] **Step 2: 新增 context 缓存实例字段**

在 `private originalPkgMain: string | undefined;` 之后新增：
```typescript
  /** dev 模式 esbuild 增量编译 context（首次创建后缓存复用，退出时 dispose） */
  private bundleCtx: BuildContext | null = null;
```

- [ ] **Step 3: 抽取 esbuild options 构造为 `_buildBundleOptions`**

`_bundleWithRegistry()` 当前内联构造 `options: BuildOptions`。把从方法开头到 `const options: BuildOptions = {...}` 赋值完成为止的这段构造逻辑（含 isTypeScript/format/sourcemap/external/plugin/options 的计算），抽成一个返回 `{ options, outdir }` 的私有方法，供全量与增量复用。新增方法：
```typescript
  /** 构造 dev/build 共用的 esbuild options（含 outdir） */
  private _buildBundleOptions(bundleConfig: BundleConfig): { options: BuildOptions; outdir: string } {
    const cwd = process.cwd();
    const controllerDir = path.join(cwd, ELECTRON_DIR, 'controller');
    const configDir = path.join(cwd, ELECTRON_DIR, 'config');
    const mainJsPath = path.join(cwd, ELECTRON_DIR, 'main.js');
    const mainTsPath = path.join(cwd, ELECTRON_DIR, 'main.ts');
    const isTypeScript = fs.existsSync(mainTsPath);
    const entryMain = isTypeScript ? mainTsPath : mainJsPath;
    const outdir = path.join(cwd, BUNDLE_DIR);

    const format: 'cjs' | 'esm' = bundleConfig.format || 'cjs';
    const isDev = process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'local';
    let sourcemap: boolean | 'inline';
    if (bundleConfig.sourcemap === 'inline' || bundleConfig.sourcemap === true) {
      sourcemap = 'inline';
    } else if (bundleConfig.sourcemap === 'external') {
      sourcemap = true;
    } else {
      sourcemap = isDev ? 'inline' : false;
    }

    const frameworkExternal = [
      'ee-core', 'ee-bin', 'electron', 'better-sqlite3', 'proxy-agent', 'pino-roll', 'pino-pretty',
    ];
    const userExternal = bundleConfig.external || [];
    const plugin = bundleRegistryPlugin(controllerDir, entryMain, configDir);

    const options: BuildOptions = {
      entryPoints: ['app:bundle-entry'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      packages: 'external',
      outdir,
      external: [...frameworkExternal, ...userExternal],
      format,
      minify: bundleConfig.minify ?? false,
      keepNames: bundleConfig.keepNames ?? false,
      ...(bundleConfig.drop ? { drop: bundleConfig.drop } : {}),
      ...(bundleConfig.legalComments ? { legalComments: bundleConfig.legalComments } : {}),
      sourcemap,
      banner: { js: 'process.env.EE_BUNDLED = "true";' },
      plugins: [plugin],
      define: { ...(bundleConfig.define || {}) },
      logLevel: 'info',
    };
    return { options, outdir };
  }
```
然后把 `_bundleWithRegistry()` 方法体改为复用它：
```typescript
  private async _bundleWithRegistry(bundleConfig: BundleConfig): Promise<void> {
    const { options, outdir } = this._buildBundleOptions(bundleConfig);
    log('_bundleWithRegistry options:%O', options);
    await build(options);
    this._postBundle(outdir, bundleConfig);
  }
```

- [ ] **Step 4: 新增 `_devBundle`（dev 增量编译入口）**

在 `_buildBundleOptions` 之后新增。它处理 copy 模式回退、首次创建 context、后续 rebuild：
```typescript
  /**
   * dev 模式增量打包：首次创建 esbuild context 并缓存，之后复用 rebuild（增量、快）。
   * copy 模式（bundleType: 'copy'）不走 context，回退到一次性 bundle()。
   */
  private async _devBundle(bundleConfig?: BundleConfig): Promise<void> {
    if (!bundleConfig) return;
    if (bundleConfig.bundleType === 'copy') {
      await this.bundle(bundleConfig);
      return;
    }

    const { options, outdir } = this._buildBundleOptions(bundleConfig);
    // 清理输出目录仅在首次（创建 context 前）执行，保证干净构建
    if (!this.bundleCtx) {
      rm(outdir);
      this.bundleCtx = await context(options);
    }
    await this.bundleCtx.rebuild();
    this._postBundle(outdir, bundleConfig);
  }
```

- [ ] **Step 5: `dev()` 改用 `_devBundle`**

`dev()` 中冷启动的 `await this.bundle(binCfg.build.electron);` 改为：
```typescript
      await this._devBundle(binCfg.build.electron);
```
watch 回调内的 `await this.bundle(binCfg.build.electron);` 同样改为：
```typescript
              await this._devBundle(binCfg.build.electron);
```

- [ ] **Step 6: `_closeProcess()` 退出前 dispose context**

在 `_closeProcess()` 中 `this._restorePkgMain();` 之前新增：
```typescript
    if (this.bundleCtx) {
      await this.bundleCtx.dispose();
      this.bundleCtx = null;
    }
```

- [ ] **Step 7: 类型检查 + 构建通过**

Run:
```bash
cd packages/ee-bin && npm run typecheck && npm run build
```
Expected: 均 exit 0。

- [ ] **Step 8: 手动验证 dev 增量编译生效**

Run（仓库根目录，限时启动后会进入 dev，观察首条 Bundle output 日志）:
```bash
timeout 25 pnpm dev --serve=electron 2>&1 | grep -m1 "Bundle output" && echo "DEV BUNDLE OK"
```
Expected: 打印一行 `Bundle output: .../public/electron/main.js` 后打印 `DEV BUNDLE OK`。

- [ ] **Step 9: Commit**

```bash
git add packages/ee-bin/src/tools/serve.ts
git commit -m "feat(ee-bin): use esbuild context for incremental dev bundling"
```

---

## Task 5: 主进程 watch 默认开启

**Files:**
- Modify: `packages/ee-bin/src/config/bin_default.ts`（`dev.electron.watch`，约 42 行）
- Modify: `cmd/bin.js`（`dev.electron.watch`，约 21 行）

- [ ] **Step 1: 改框架默认值**

`packages/ee-bin/src/config/bin_default.ts` 中：
```typescript
      watch: false,
```
改为：
```typescript
      watch: true,
```
（注意：该文件只有 `dev.electron.watch` 一处 `watch:` 键，定位唯一。）

- [ ] **Step 2: 改项目侧配置（覆盖默认，需一并改）**

`cmd/bin.js` 中 `dev.electron` 段：
```javascript
      watch: false,
```
改为：
```javascript
      watch: true,
```

- [ ] **Step 3: 构建 ee-bin**

Run:
```bash
cd packages/ee-bin && npm run build
```
Expected: exit 0。

- [ ] **Step 4: 手动验证 watch 触发重建**

Run（仓库根目录；启动 dev electron，后台改一个 controller 文件触发重建，观察日志）:
```bash
timeout 30 pnpm dev --serve=electron 2>&1 | grep -m1 "has been changed" && echo "WATCH OK" &
sleep 12 && printf '\n// touch %s\n' "$(date +%s)" >> electron/controller/os.ts
wait
```
Expected: 日志出现 `File [...] has been changed` 后打印 `WATCH OK`。完成后用 `git checkout electron/controller/os.ts` 还原触碰的文件。

- [ ] **Step 5: 还原被触碰的测试文件**

Run:
```bash
git checkout electron/controller/os.ts
```
Expected: 文件恢复原状（git status 不再显示该文件被改）。

- [ ] **Step 6: Commit**

```bash
git add packages/ee-bin/src/config/bin_default.ts cmd/bin.js
git commit -m "feat(ee-bin): enable electron watch by default in dev"
```

---

## Task 6: wait-on 协调启动顺序

dev 同时含 frontend+electron 且前端为 http 时，先起前端 → wait-on 等其 URL（超时仍继续）→ 再 bundle + 起 electron。

**Files:**
- Modify: `packages/ee-bin/src/tools/serve.ts`（import、`dev()` 启动编排、新增 `_waitForFrontend`）

- [ ] **Step 1: 引入 wait-on**

在文件顶部 import 区新增：
```typescript
import waitOn from 'wait-on';
```

- [ ] **Step 2: 新增 `_waitForFrontend` 私有方法**

在 `dev()` 之后新增。从 frontend 配置构造 URL 并等待，超时打印警告但不抛错：
```typescript
  /**
   * 等待前端 dev server ready（消除 electron 先于前端 loadURL 的白屏竞态）。
   * 超时不抛错，仅警告后返回，让 electron 仍然启动。
   */
  private async _waitForFrontend(frontendCfg: ExecConfig): Promise<void> {
    const hostname = frontendCfg.hostname || 'localhost';
    const port = frontendCfg.port || 8080;
    const timeout = frontendCfg.waitTimeout ?? 30000;
    // wait-on 用 http-get:// 前缀做 HTTP GET 探测；validateStatus 接受任意状态码（dev server 起来即可，不挑 2xx）
    const resource = `http-get://${hostname}:${port}`;
    console.log(chalk.blue('[ee-bin] [dev] ') + `Waiting for frontend: ${chalk.cyan(`http://${hostname}:${port}`)}`);
    try {
      await waitOn({ resources: [resource], timeout, validateStatus: () => true });
      console.log(chalk.blue('[ee-bin] [dev] ') + chalk.green('Frontend is ready'));
    } catch {
      console.log(chalk.bgYellow('Warning') + ` Frontend not ready in ${timeout}ms, starting electron anyway`);
    }
  }
```
注意：`ExecConfig` 已在本文件 import（`import type { ExecConfig, BundleConfig } from '../types/config.js';`）。

- [ ] **Step 3: `dev()` 启动编排改为「先前端、等待、再 electron」**

当前 `dev()` 末尾是无条件 `this.multiExec(opt);`。改为：当 cmds 同时含 `frontend` 与 `electron`、且 `frontend.protocol` 为 http 时，拆分启动。替换 `dev()` 末尾的 `this.multiExec(opt);` 为：
```typescript
    const frontendCfg = binCmdConfig.frontend;
    const splitStart =
      cmds.includes('frontend') &&
      cmds.includes('electron') &&
      !!frontendCfg &&
      (frontendCfg.protocol || 'http://').startsWith('http');

    if (splitStart) {
      this.multiExec({ binCmd, binCmdConfig, command: 'frontend' });
      await this._waitForFrontend(frontendCfg);
      const rest = cmds.filter((c) => c !== 'frontend').join(',');
      this.multiExec({ binCmd, binCmdConfig, command: rest });
    } else {
      this.multiExec(opt);
    }
```
注意：electron 的 bundle 已在 `dev()` 前半段（`cmds.includes('electron')` 分支）完成，此处只负责进程启动顺序，无需重复 bundle。

- [ ] **Step 4: 类型检查 + 构建通过**

Run:
```bash
cd packages/ee-bin && npm run typecheck && npm run build
```
Expected: 均 exit 0。

- [ ] **Step 5: 手动验证启动顺序（前端 ready 后才起 electron）**

Run（仓库根目录，完整 dev；观察先出现 Waiting for frontend，再 Frontend is ready，最后 electron 启动）:
```bash
timeout 60 pnpm dev 2>&1 | grep -m1 -E "Waiting for frontend" && echo "WAIT WIRED"
```
Expected: 打印 `Waiting for frontend: http://localhost:8080` 后打印 `WAIT WIRED`。

- [ ] **Step 6: Commit**

```bash
git add packages/ee-bin/src/tools/serve.ts
git commit -m "feat(ee-bin): wait for frontend dev server before launching electron"
```

---

## Task 7: 单元测试（context 缓存 + bin_default watch）

为可单测的纯逻辑加测试。`_waitForFrontend` 依赖网络、`dev()` 拉起真实进程，不适合单测，已在前述任务用手动验证覆盖。这里测：(a) 默认配置 watch 已开启；(b) `_devBundle` 在 copy 模式回退到 `bundle()` 且不创建 context。

**Files:**
- Create: `packages/ee-bin/test/serve.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
import { describe, it, expect, vi } from 'vitest';
import binDefault from '../src/config/bin_default.js';
import { ServeProcess } from '../src/tools/serve.js';

describe('bin_default', () => {
  it('enables electron watch by default', () => {
    expect(binDefault.dev.electron.watch).toBe(true);
  });
});

describe('ServeProcess._devBundle', () => {
  it('copy 模式回退到 bundle()，不创建 esbuild context', async () => {
    const sp = new ServeProcess();
    const bundleSpy = vi.spyOn(sp as any, 'bundle').mockResolvedValue(undefined);
    await (sp as any)._devBundle({ bundleType: 'copy' });
    expect(bundleSpy).toHaveBeenCalledOnce();
    expect((sp as any).bundleCtx).toBeNull();
  });

  it('无 bundleConfig 时直接返回', async () => {
    const sp = new ServeProcess();
    await expect((sp as any)._devBundle(undefined)).resolves.toBeUndefined();
    expect((sp as any).bundleCtx).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试，确认失败（实现前）**

如果在 Task 4/5 之前运行此 Task，测试应失败；若按顺序执行（Task 4、5 已完成），它们应直接通过。Run:
```bash
cd packages/ee-bin && npx vitest run test/serve.test.ts
```
Expected: 3 个测试全部 PASS（因为依赖的实现已在 Task 4、5 完成）。若 `ServeProcess` 构造函数注册了 SIGINT/SIGTERM 监听导致告警，可忽略（不影响断言）。

- [ ] **Step 3: 运行完整测试套件**

Run:
```bash
cd packages/ee-bin && npm run test
```
Expected: 全部 PASS，exit 0。

- [ ] **Step 4: Commit**

```bash
git add packages/ee-bin/test/serve.test.ts
git commit -m "test(ee-bin): cover dev watch default and copy-mode devBundle fallback"
```

---

## 最终验证

- [ ] **Step 1: 全量类型检查 + 构建 + 测试**

Run:
```bash
cd packages/ee-bin && npm run typecheck && npm run build && npm run test
```
Expected: 全部 exit 0。

- [ ] **Step 2: VS Code 调试链路回归（确认未被破坏）**

Run（仓库根目录）:
```bash
pnpm exec ee-bin build --cmds=electron --env=dev && grep -c "sourceMappingURL=data:application/json" public/electron/main.js
```
Expected: 打印 `1`（inline sourcemap 仍生成，调试不受影响）。

- [ ] **Step 3: 确认工作区无意外残留改动**

Run:
```bash
git status --short
```
Expected: 只剩计划/spec 文档等预期文件，`electron/controller/os.ts` 等被触碰的文件已还原。


