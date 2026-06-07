# globby ESM-only 导致鸿蒙 OS CJS 运行时报错

日期：2026-06-07

## 影响范围 / 类型

跨平台兼容性 — macOS 正常运行，鸿蒙 OS（HarmonyOS）报致命错误退出

## 涉及文件

- `packages/ee-core/src/core/loader/file_loader.ts` — FileLoader 核心模块，运行时扫描 controller 目录
- `packages/ee-core/src/controller/controller_loader.ts` — 调用 FileLoader
- `packages/ee-core/package.json` — globby 依赖声明

## 现象

在 macOS Apple Silicon 上构建、运行一切正常。将 `public/` 资源复制到鸿蒙 OS 生成 HAP 包后，安装启动报错：

```
A JavaScript error occurred in the main process

Uncaught Exception:
Error [ERR_REQUIRE_ESM]: require() of ES Module
  .../node_modules/globby/index.js from
  .../node_modules/ee-core/dist/cjs/core/loader/file_loader.js
  not supported.
Instead change the require of index.js in file_loader.js
to a dynamic import() which is available in all CommonJS modules.
```

## 根因

**不是 ARM 架构问题，是 Node.js 版本的 ESM/CJS 互操作差异。**

1. `globby@16` 是纯 ESM 包（`"type": "module"`），不支持 `require()` 加载
2. ee-core 的 CJS 输出（`dist/cjs/core/loader/file_loader.js`）通过 `require('globby')` 加载它
3. macOS Electron v39 内置 Node.js v22+，支持 `require(esm)` 实验特性（`--experimental-require-module`），所以不报错
4. 鸿蒙 OS 的 Electron/Node.js 移植版本不支持此特性，严格拒绝 CJS `require()` 加载 ESM 包

**核心教训：纯 ESM 包在 CJS 运行环境中是隐患，即使当前环境能跑，将来也可能出问题。**

## 修复

将 `file_loader.ts` 中 `globby` 的文件扫描替换为 `fs.readdirSync` 递归扫描：

1. `parse()` — 用 `scanDirSync()`（基于 `fs.readdirSync` + `withFileTypes`）替代 `globbySync()`
2. `parseAsync()` — 用 `scanDirAsync()`（基于 `fs.promises.readdir`）替代 `globby()` 异步扫描
3. 两个扫描函数都支持 `.js, .ts, .mts, .cts, .tsx, .jsx, .mjs, .cjs` 扩展名，与 globby 的 glob 模式覆盖范围等价
4. 从 `ee-core/package.json` 的 dependencies 中移除 `globby@^16.2.0`
5. 更新 `controller_loader.ts` 和 `file_loader.ts` 中的注释（"globby" → "filesystem"/"fs recursive scan"）

ee-bin（CLI 构建工具）中的 `globby` 保留不变 — 它只在开发机 CLI 环境运行，不是 Electron 运行时的一部分。

## 验证

```bash
# ee-core 构建
pnpm run packages-build  # ✅ 通过

# macOS 开发模式运行
pnpm dev  # ✅ 正常启动，controller 正常加载

# CJS 输出中不再包含 require('globby')
grep "require.*globby" packages/ee-core/dist/cjs/core/loader/file_loader.js  # 无结果
```

## 同期修复的其他类型问题

本次排查过程中还修复了以下相关类型兼容性问题：

| 文件 | 问题 | 修复 |
|------|------|------|
| `ee-core/src/utils/extend.ts` | `extend()` 返回 `Record<string, unknown>`, 调用方需要 `as unknown as X` 双重转换 | 泛型化 `<T extends Record<string, unknown>>`，返回类型跟随 target，内部用 `Record<string, unknown>` 局部变量做写入 |
| `ee-core/src/electron/window/index.ts` | `DevFrontendConfig` / `DevElectronConfig` 缺少索引签名，不能赋给 `Record<string, unknown>` | 用 `as unknown as Record<string, unknown>` 中转传给 `extend()`，结果用 `as X` 直接转换 |
| `ee-core/src/log/logger.ts` | 同上，`LoggerConfig` 双重转换 | 简化为 `as LoggerConfig` |
| `ee-core/src/config/config_loader.ts` | `Config` 双重转换 | 简化为 `as Config` |
| `ee-core/src/jobs/child/jobProcess.ts` | `JobProcessOptions` 缺少索引签名 | 加 `[key: string]: unknown` 索引签名 |
| `ee-bin/src/types/config.ts` | `DevConfig` 缺少索引签名，不能赋给 `Record<string, ExecConfig>` | 加 `[key: string]: ExecConfig | undefined` |
| `ee-bin/src/tools/serve.ts` | `multiExec` 参数类型 `Record<string, ExecConfig>` 与 `DevConfig` 不兼容 | 改为 `Record<string, ExecConfig | undefined>` |
| `ee-core/src/electron/window/index.ts` | DevTools 在窗口创建时打开，页面切换导致 "devtools was disconnected from the page" | DevTools 改为在 `loadMainUrl` 中通过 `did-finish-load` 事件延迟打开 |

## 经验教训

1. **纯 ESM 包是 CJS 运行环境的隐患**：即使当前 Node.js 版本支持 `require(esm)` 实验特性，低版本或移植版本可能不支持。运行时模块应避免依赖纯 ESM 包，或确保只走 ESM 加载路径
2. **"能跑"不等于"没问题"**：macOS 正常运行掩盖了 `require(esm)` 的脆弱性，跨平台部署才暴露根因
3. **fs 递归扫描足够覆盖实际场景**：扫描 `controller/` 和 `config/` 目录下的脚本文件，`fs.readdirSync` + 扩展名过滤完全够用，不需要 glob 模式匹配
4. **具体接口缺少索引签名时**：用 `as unknown as Record<string, X>` 中转，而非直接 `as Record<string, X>`（TypeScript 不允许不充分重叠的直接转换）
5. **泛型函数内部写入索引时**：用局部 `Record<string, unknown>` 变量做写入操作，避免 "generic type T can only be indexed for reading" 错误，最后 `return result as T`