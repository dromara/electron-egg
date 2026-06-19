# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指引。

## 项目概览

**electron-egg (ee-dev-v5)** — 基于 Electron 的企业级桌面应用框架。项目使用 TypeScript 包（`ee-core`、`ee-bin`）输出双 CJS + ESM 格式，替代原有的 JS 版本（`ee-core-js`、`ee-bin-js`）。

## 架构

pnpm workspace monorepo：

```
ee-dev/
├── packages/
│   ├── ee-core/        # TypeScript 框架核心（双 CJS/ESM）
│   │   └── src/
│   │       ├── app/        # boot, application, events, dir
│   │       ├── config/     # 配置加载/合并
│   │       ├── const/      # IPC 常量（Processes, SocketIO, Events, Receiver）
│   │       ├── controller/ # 控制器加载（registry + scanDirSync）
│   │       ├── core/       # FileLoader, utils
│   │       ├── cross/      # 外部进程管理（Go/Python 等）
│   │       ├── electron/   # Electron app/window 管理
│   │       ├── exception/  # 全局异常处理（uncaught/unhandled）
│   │       ├── html/       # 静态 HTML 页面路径（failure.html 等）
│   │       ├── jobs/       # ChildJob, ChildPoolJob, LoadBalancer
│   │       ├── loader/     # loadFile, requireFile, resolveModule
│   │       ├── log/        # Pino 日志（pino-roll + pino-pretty）
│   │       ├── message/    # ChildMessage（子进程→主进程消息）
│   │       ├── ps/         # 进程状态与路径工具（env, paths, isDev 等）
│   │       ├── socket/     # socketServer, httpServer, ipcServer
│   │       ├── storage/    # SqliteStorage (better-sqlite3)
│   │       ├── types/      # TypeScript 类型定义
│   │       └── utils/      # extend, is, json, wrap, helper
│   └── ee-bin/          # TypeScript CLI 构建工具（双 CJS/ESM）
│       └── src/
│           ├── config/     # bin_default.ts
│           ├── plugins/    # bundle_registry_plugin.ts (esbuild)
│           ├── tools/      # serve, encrypt, move, iconGen, incrUpdater
│           ├── lib/        # extend, helpers, utils（轻量替代库）
│           └── types/      # BinConfig, BundleConfig 等
├── electron/            # 应用代码（主进程源码）
│   ├── main.js          # 入口文件（也支持 main.ts）
│   ├── config/          # config.default.js / config.local.js / config.prod.js
│   ├── controller/      # 业务控制器
│   ├── service/         # 业务服务
│   ├── preload/         # bridge.js, lifecycle.js
│   └── jobs/            # 后台任务（child_process.fork）
├── frontend/            # Vue 3 + Ant Design (Vite)
├── cmd/                 # bin.js（项目配置），builder*.json
├── go/                  # 可选 Go 后端
├── python/              # 可选 Python/FastAPI 后端
├── build/               # Electron-builder 配置与脚本
└── public/              # 静态资源（images, html, ssl）
```

### Bundle 输出结构

`pnpm build-electron` 后，`public/electron/` 包含：

```
public/electron/
├── main.js              # 打包后的主进程（控制器、服务、配置全部打包在内）
├── jobs/                # 逐文件转译（esbuild bundle:false；child_process.fork 需要独立文件）
└── preload/
    └── bridge.js        # 从 bridge.{ts,js,...} 转译（BrowserWindow preload 脚本）
```

## 关键模式

### 控制器加载管线

**构建时** (ee-bin)：`bundleRegistryPlugin` esbuild 插件扫描 `electron/controller/`，计算属性路径（复现 `defaultCamelize` 的 `caseStyle: 'lower'`），生成虚拟模块 `app:controller-registry`，设置 `global.__EE_CONTROLLER_REGISTRY__`，使用**懒加载 getter**（`get module() { return require('./path'); }`）。

**Bundle 入口** (`app:bundle-entry`)：先 require config registry，再 require controller registry，最后 require 真实的 `main.js`。确保注册表在应用启动前填充，但模块仅在 `FileLoader.parseFromRegistry()` 执行时才加载（避免初始化顺序问题）。

**运行时** (ee-core)：`ControllerLoader.load()` 检查 `globalThis.__EE_CONTROLLER_REGISTRY__`。若存在（bundle 模式），`FileLoader.parseFromRegistry()` 从注册表读取。若不存在（dev 未 bundle），回退到 `scanDirSync()` 文件系统扫描 + `require()`。

### ElectronEgg 生命周期

两个阶段：

1. **init()**（构造器内）：`loadException → loadConfig → loadDir → loadLog`
2. **run()/runAsync()**（用户调用）：`loadController → loadSocket → emitLifecycle(Ready) → loadElectron`

顺序严格不可变：异常处理必须最先注册以捕获后续错误；配置是所有模块的基础；目录必须存在才能写日志；控制器先于通信服务；Ready 事件在基础+业务加载完成后触发。

### 生命周期事件

`EventBus` 管理五个框架里程碑：`Ready`、`ElectronAppReady`、`WindowReady`、`BeforeClose`、`Preload`。业务代码通过 `app.register(eventName, handler)` 注册钩子。自定义事件通过 `eventBus.on()/emit()`。

### 通信服务

三通道按序创建：`SocketServer` → `HttpServer` → `IpcServer`。共享同一套 `resolveControllerFn()` 路由机制。

- **IpcServer**：主进程↔渲染进程，使用 `ipcMain.handle/on` + `ipcRenderer.invoke/send`。通道格式：`controller/{name}/{method}`。
- **HttpServer**：Koa RESTful API，供外部 HTTP 客户端使用。
- **SocketServer**：SocketIO，供第三方进程（Go/Python 后端）使用。

`cross` 模块管理外部子进程（Go/Python），不是渲染进程 IPC。

### 配置加载管线

**构建时** (ee-bin)：`bundleRegistryPlugin` 扫描 `electron/config/`，生成虚拟模块 `app:config-registry`，设置 `global.__EE_CONFIG_REGISTRY__`，使用懒加载 getter。

**Bundle 入口** (`app:bundle-entry`)：加载 config registry → controller registry → 真实的 `main.js`。

**运行时** (ee-core)：`ConfigLoader._loadConfig()` 检查 `globalThis.__EE_CONFIG_REGISTRY__`。若存在（bundle 模式），按 filename 查找配置模块并用 `appInfo` 调用。若不存在（dev 未 bundle），回退到文件系统 `loadFile()`。

### 配置分层（仅 dev 模式）

`config.default.js` → `config.local.js` / `config.prod.js`，由 ee-core 配置加载器合并。

### 格式检测

`_bundleWithRegistry()` 检测入口文件是否存在（`main.ts` 优先于 `main.js`）。输出格式由 `bundleConfig.format` 独立控制（默认 `'cjs'`）。TypeScript 入口不意味着 ESM 输出——`main.ts` 也可以用 CJS 格式。

## 命令

### 开发
```bash
pnpm dev              # 启动完整开发（frontend + electron）
pnpm dev-frontend     # 仅开发前端
pnpm dev-electron     # 仅开发 electron
pnpm dev-go           # 运行 Go 后端
pnpm dev-python       # 运行 Python 后端
pnpm start            # 生产模式启动
```

### 构建
```bash
pnpm build            # 构建 frontend + electron + 加密
pnpm build-frontend   # 构建并移动前端 dist
pnpm build-electron   # 构建 electron（esbuild bundle）
```

### 平台打包
```bash
pnpm build-w          # Windows (64-bit)
pnpm build-m          # macOS
pnpm build-m-arm64    # macOS ARM64
pnpm build-l          # Linux
```

### 包开发
```bash
cd packages/ee-core
npm run build          # 构建 CJS + ESM + 生成 exports map
npm run build:cjs      # 仅构建 CommonJS
npm run build:esm      # 仅构建 ESM
npm run typecheck      # TypeScript 类型检查
npm run test           # 运行 vitest

cd packages/ee-bin
npm run build          # 构建 CJS + ESM
npm run typecheck      # TypeScript 类型检查
npm run test           # 运行 vitest
```

### 其他
```bash
pnpm encrypt           # 字节码/混淆加密
pnpm icon              # 生成应用图标
pnpm re-sqlite         # 为 Electron 重建 better-sqlite3
```

## 构建配置（cmd/bin.js）

`build.electron` 部分控制 esbuild 打包：

```js
electron: {
  bundleType: 'bundle',  // 'bundle' | 'copy'
  external: [],          // 用户自定义外部依赖（packages: 'external' 已覆盖大部分）
  sourcemap: false,      // 'inline' | 'external' | false；默认：dev→inline, prod→off
  minify: false,         // true | false；生产环境压缩代码
  drop: [],              // ['console', 'debugger']；生产环境移除语句
  keepNames: false,      // true | false；压缩时保留函数/类名
  legalComments: 'none', // 'inline' | 'eof' | 'none'；处理 license 注释
  define: {},            // { 'process.env.X': '"value"' }；编译时常量
  copy: [],              // ['assets', 'data/db.json']；electron/ 中额外复制到输出的目录/文件
  format: 'cjs',         // 'cjs' | 'esm'；默认: 'cjs'（推荐用于 Electron）
}
```

**框架管理的外部依赖**（显式列表用于文档+性能，大部分已被 `packages: 'external'` 覆盖）：`ee-core`、`ee-bin`、`electron`、`better-sqlite3`、`proxy-agent`、`pino-roll`、`pino-pretty`。

**Sourcemap 行为**：`false`（默认）表示自动——开发环境使用 `inline`，生产环境禁用。显式设为 `'inline'` 或 `'external'` 可覆盖。

**Format 行为**：默认 `cjs` 推荐 Electron 主进程使用。ESM 模式要求所有业务代码（控制器、服务、配置）兼容 ESM。

## VS Code 调试

`.vscode/launch.json` 中两个配置：

- **Debug Electron** (F5)：预构建任务以 `--env=dev` 打包（inline sourcemap），然后以 `--inspect=9229` 启动 Electron。断点设在 `electron/` 源文件——sourcemap 从 `public/electron/main.js` 回溯。
- **Attach Electron**：附加到已运行的 Electron 进程的 9229 端口。

## 故障排查

**诊断启动或运行问题时，先启用 DEBUG 日志。** ee-core 使用 `debug` 库的命名空间日志器（`ee-core:config:*`、`ee-core:controller:*`、`ee-core:core:loader:*` 等）。开启后可直接看到运行时实际状态（合并配置、加载的注册表、解析的路径），远比读源码推断行为更快。

```bash
pnpm debug-electron                      # 所有 ee-* 命名空间 (DEBUG=ee-*)
pnpm debug-dev                           # 所有 ee-* 命名空间，完整开发（frontend + electron）
DEBUG='ee-core:config:*' pnpm dev-electron     # 限定到某个子系统，如配置加载
```

推荐故障排查流程：
1. **先重新构建包，确保运行的代码是最新的。** ee-core 和 ee-bin 从 `node_modules/*/dist` 运行（symlink 到 `packages/*`），过期的 `dist` 是"修复无效"的常见原因——先重建两者再排查：
   ```bash
   (cd packages/ee-core && pnpm run build) && (cd packages/ee-bin && pnpm run build)
   ```
2. 用最窄的 DEBUG 命名空间重现问题，先读运行时实际输出（如合并后的配置对象）再假设原因。
3. 如果两个相关功能同时失败（如 http + socket 服务器都没启动），怀疑共享上游（配置/注册表加载），而非各自的实现。
4. 每次修改 ee-core/ee-bin 源码后，重建对应包再测试——否则运行的是旧代码。

详见 `docs/bugfix/` 中的具体排查案例。`docs/framework/` 中有框架核心模块的完整技术文档。

## 重要注意事项

- **ee-core 和 ee-bin 是独立的 npm 包**：将独立发布到 npm。当前 pnpm workspace monorepo（`packages/ee-core`、`packages/ee-bin`，根 `package.json` 中 `workspace:*`）仅为本地开发便利。生产使用时，用户通过 `npm install ee-core ee-bin` 安装。
- **ee-core 不打包进 main.js**：ee-core 是 esbuild external，运行时从 `node_modules` 加载。这让 `child_process.fork()` 能在 `node_modules/ee-core/` 中找到子进程入口 (`app.js`) 作为真实磁盘文件。ee-bin 是 CLI 构建工具，不参与 Electron 应用运行时。

- **包管理器**：仅 pnpm（`.npmrc` 设置 `shamefully-hoist=true` 以兼容 Electron）
- **镜像源**：`.npmrc` 配置了 npmmirror
- **根 `package.json` 以 `workspace:*` 引用 ee-core 和 ee-bin**——包变更立即生效
- **ee-core 源码中 ESM import 必须带 `.js` 扩展名**（`module: NodeNext` 要求）：`import { X } from './foo.js'` 而非 `from './foo'`
- **ee-core 的 `package.json` 中 `exports` map 由脚本自动生成**——`scripts/gen-exports.js`，勿手动编辑；添加新子路径模块后运行 `npm run gen-exports`
- **better-sqlite3 需要为 Electron 原生重建**：遇到原生模块错误时使用 `pnpm re-sqlite`
- **Node.js 最低版本**：v20
- **修改 ee-core 或 ee-bin TypeScript 源码后**，需在对应包目录下 `npm run build` 重建再测试
- **`debug-dev` 和 `debug-electron` 脚本**使用 `cross-env DEBUG=ee-*` 输出详细日志
