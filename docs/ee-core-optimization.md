# ee-core 优化分析报告

> 分析日期：2026-05-30
> 分析范围：`packages/ee-core/` 全部源码、类型定义、配置
> 修复进度：见文末 [九、修复记录](#九修复记录)

---

## 目录

- [一、Bug 和潜在缺陷](#一bug-和潜在缺陷)
- [二、类型安全问题](#二类型安全问题)
- [三、代码重复](#三代码重复)
- [四、错误处理问题](#四错误处理问题)
- [五、安全隐患](#五安全隐患)
- [六、性能问题](#六性能问题)
- [七、死代码和命名问题](#七死代码和命名问题)
- [八、优化建议优先级排序](#八优化建议优先级排序)

---

## 一、Bug 和潜在缺陷

### 1.1 拼写错误 `.defalut` 导致 bytecode 回退失效

**文件**：`src/loader/index.ts:50`

**问题**：`filepath.endsWith('.defalut')` 拼写错误，应为 `.default`。这导致 `config.default.js` 这类文件在 bytecode 模式下无法正确回退到 `.jsc` 文件。

```ts
// 当前
if (filepath.endsWith('.defalut') || filepath.endsWith('.prod') || filepath.endsWith('.local')) {

// 修复
if (filepath.endsWith('.default') || filepath.endsWith('.prod') || filepath.endsWith('.local')) {
```

**影响**：bytecode 模式下 `.default` 配置文件的回退机制完全失效。

---

### 1.2 `execFile` 未展开 `inject` 参数

**文件**：`src/loader/index.ts:36,38`

**问题**：`execFile` 中将 `inject` 数组作为单个参数传入，而 `loadFile` 中使用 `...inject` 展开。行为不一致，会导致运行时参数传递错误。

```ts
// loadFile 正确展开
(ret)(...inject);

// execFile 错误：未展开
new (ret)(inject);  // 应为 new (ret)(...inject)
(ret)(inject);      // 应为 (ret)(...inject)
```

**影响**：使用 `execFile` 并传入 `inject` 参数时，controller 构造函数/函数收到的是数组而非展开的参数。

---

### 1.3 `ElectronAppReady` 在 `whenReady` 完成前触发

**文件**：`src/electron/app/index.ts:42`

**问题**：`eventBus.emitLifecycle(ElectronAppReady)` 是同步调用，放在 `createElectron()` 函数末尾，但 `app.whenReady().then(...)` 的回调在之后才执行。这意味着 "ready" 生命周期事件在 Electron App 真正 ready 之前就触发了。

```ts
// 当前逻辑（简化）
function createElectron() {
  app.whenReady().then(() => {
    // 真正 ready 后的逻辑
  });
  eventBus.emitLifecycle(ElectronAppReady); // 此时 app 尚未 ready
}

// 修复：移入 whenReady 回调内
function createElectron() {
  app.whenReady().then(() => {
    // 真正 ready 后的逻辑
    eventBus.emitLifecycle(ElectronAppReady);
  });
}
```

**影响**：依赖 `ElectronAppReady` 事件的下游代码可能在 App 未就绪时执行，导致不可预期的行为。

---

### 1.4 IPC Server 同时注册 `on` 和 `handle` 到同一 channel

**文件**：`src/socket/ipcServer.ts:54,67`

**问题**：同一 channel 同时注册了 `ipcMain.on`（同步返回 `event.returnValue`）和 `ipcMain.handle`（异步 Promise 返回）。当 renderer 端通过 `ipcRenderer.invoke()` 调用时，两个 handler 都会触发，导致不可预期的行为。

**建议**：根据业务需求选择其中一种模式，或者按 channel 区分使用 `on` 还是 `handle`。

**影响**：renderer 端 IPC 调用行为不可预期，可能产生重复响应或竞态问题。

---

### 1.5 `loadControllerAsync` 缺少 registry 支持

**文件**：`src/controller/controller_loader.ts:49-68`

**问题**：`load()` 方法检查 `globalThis.__EE_CONTROLLER_REGISTRY__` 并走 registry 分支，但 `loadAsync()` 完全没有 registry 支持。在 bundled 模式下调用 async 加载会回退到文件系统扫描，可能找不到 controller。

**影响**：bundled 模式下使用 `runAsync()` 会导致 controller 加载失败。

---

### 1.6 `getControllers()` 异步竞态条件

**文件**：`src/controller/index.ts:17-22`

**问题**：`getControllers()` 使用懒初始化模式——如果 `controllers === null` 就触发同步加载。如果 `runAsync()` 正在进行异步加载，此时 `getControllers()` 看到 `controllers === null` 会再次触发同步加载，导致双重初始化。

**建议**：引入加载状态标记（如 `loading`），或在 `runAsync` 期间锁定同步加载路径。

**影响**：在 async 初始化期间访问 controller 可能导致重复加载和不可预期的状态。

---

### 1.7 `fnDebounce` 实现有问题

**文件**：`src/utils/helper.ts:7-36`

**问题**：

1. 函数引用作为对象 key（`fn as unknown as string`）不可靠——不同函数可能产生相同字符串，或相同函数不同引用产生不同字符串
2. `if/else` 分支都调用 `setTimer()`，`else` 分支冗余
3. leading edge 模式下返回 `undefined` 而非函数执行结果

**建议**：使用 `WeakMap` 或 `Map` 替代对象存储 timer；简化分支逻辑。

---

### 1.8 `sleepNaive` 是忙等待，阻塞事件循环

**文件**：`src/utils/helper.ts:116-121`

**问题**：`sleepNaive` 使用 `while` 循环持续检查 `Date.now()`，CPU 密集且完全阻塞 Node.js 事件循环。虽然是 `Atomics.wait` 不可用时的 fallback，但仍应标注风险或改用 `setTimeout` + Promise。

---

### 1.9 ESM 默认导出处理不一致

**文件**：`src/core/utils/index.ts:30,84-85`

**问题**：`loadFile` 检查 `obj.__esModule` 后返回 `obj.default`；`loadFileAsync` 检查 `obj.__esModule || obj.default !== undefined`。后者在 `obj.default` 为空字符串、`0`、`false` 时也会触发默认导出提取，即使 `__esModule` 为 false。

```ts
// loadFile
if (obj.__esModule) return obj.default;

// loadFileAsync — 条件更宽松，行为不同
if (obj.__esModule || obj.default !== undefined) return obj.default;
```

**影响**：同步和异步路径对 ESM 默认导出的处理逻辑不一致，可能导致同一个模块在两种加载方式下行为不同。

---

## 二、类型安全问题

### 2.1 自定义 `koa` 模块声明遮蔽了 `@types/koa`

**文件**：`src/types/declarations.d.ts:52-100`

**问题**：项目中已安装 `@types/koa` 作为 devDependency，但 `declarations.d.ts` 自定义了简化版的 `koa` 模块声明，遮蔽了官方类型。自定义声明缺失大量属性：`state`、`cookies`、`throw`、`assert`、`query` 的类型不正确等。

**建议**：移除 `declarations.d.ts` 中的 `declare module 'koa'` 块，直接使用 `@types/koa`。如有类型不兼容，可通过 `declare module 'koa'` 的方式扩展而非替换。

**影响**：所有使用 Koa 类型的代码类型安全被大幅削弱。

---

### 2.2 `HttpServerConfig` 缺少 `koaConfig` 属性

**文件**：`src/types/index.ts:51-70`，`src/socket/httpServer.ts:48`

**问题**：`httpServer.ts` 中通过双重类型断言 `as unknown as Record<string, unknown>` 来访问 `config.koaConfig`，说明类型定义与实际使用不匹配。

**建议**：在 `HttpServerConfig` 中增加 `koaConfig` 属性：

```ts
interface KoaConfig {
  preMiddleware?: Koa.Middleware[];
  postMiddleware?: Koa.Middleware[];
  errorHandler?: ((err: Error, ctx: Koa.Context) => void) | null;
}

interface HttpServerConfig {
  // ... 现有属性
  koaConfig?: KoaConfig;
}
```

---

### 2.3 关键类型未从主入口导出

**文件**：`src/index.ts`

以下类型在内部定义并使用，但未从主入口导出，包的消费者无法导入：

| 类型 | 定义位置 | 消费者使用场景 |
|------|----------|----------------|
| `ProcessExitEventData` | `types/index.ts:175` | 子进程事件处理 |
| `PidInfo` | `jobs/load-balancer/types.ts:20` | `LoadBalancer.refreshParams()` 参数 |
| `CrossRunOptions` | `cross/cross.ts:10` | `Cross.run()` 参数类型 |
| `EeLogger` | `log/index.ts:4` | 日志消费者核心类型 |
| `PinoLoggers` | `log/logger.ts:12` | `getLoggers()` 返回类型 |

---

### 2.4 `LoggerConfig` 字段类型过于宽泛

**文件**：`src/types/index.ts:74,80,82`

| 字段 | 当前类型 | 建议类型 |
|------|----------|----------|
| `level` | `string` | `'trace' \| 'debug' \| 'info' \| 'warn' \| 'error' \| 'fatal' \| string` |
| `rotator` | `string` | `'daily' \| 'hourly' \| string` |
| `redactCensor` | `string` | `string \| ((value: string, path: string) => unknown)` |

`redactCensor` 当前仅支持字符串，但 pino 的 `redact.censor` 还支持函数。

---

### 2.5 `Config` 接口的 `[key: string]: unknown` 索引签名

**文件**：`src/types/index.ts:108`

**问题**：`Config` 接口的索引签名使得 `config.foo` 返回 `unknown` 而非类型错误，削弱了类型安全。`CrossConfig` 同理，实际使用时总是 `Record<string, CrossTargetConfig>`。

**建议**：移除索引签名，或使用更精确的映射类型。对于 `CrossConfig`，直接使用 `Record<string, CrossTargetConfig>`。

---

### 2.6 全局配置访问缺少运行时验证

**问题**：几乎所有模块都通过 `getConfig()` + 类型断言访问配置（如 `as { singleLock: boolean }`、`as Record<string, CrossTargetConfig>`），配置拼写错误只能在运行时发现，没有编译期保护。

**建议**：考虑在配置加载后增加 schema 验证（如 zod），或在类型层面使用 branded type 确保配置经过验证后才能使用。

---

### 2.7 重复/不一致的类型定义

| 类型 | 位置 | 问题 |
|------|------|------|
| `RegistryEntry` | `types/index.ts:143` | `{ fullpath, properties, module }` — controller registry 用 |
| `ConfigRegistryEntry` | `config/config_loader.ts:13` | `{ filename, module }` — config registry 用 |
| `LoaderItem` | `core/loader/file_loader.ts:15` | `{ fullpath, properties, exports }` — FileLoader 内部用 |

三者都表示"已加载模块条目"，但字段命名不一致（`module` vs `exports`），且分散在不同文件中。`LoaderItem` 是私有类型，无法与 `RegistryEntry` 统一使用。

---

## 三、代码重复

### 3.1 `FileLoader` 三方法大量重复

**文件**：`src/core/loader/file_loader.ts`

**问题**：`parse()`、`parseFromRegistry()`、`parseAsync()` 共享大量结构相同的逻辑——类检测、bytecode 检测、函数调用、prototype 赋值等，约 60 行核心逻辑重复三次。任何修改需在三处同步。

**建议**：提取公共的"处理单个导出"方法，三个方法调用它并处理各自的差异。

```
parse()          ──┐
parseFromRegistry() ──┤── 共享: _processExport()
parseAsync()     ──┘
```

---

### 3.2 Socket 三服务端重复的函数解析逻辑

**文件**：`src/socket/httpServer.ts`、`ipcServer.ts`、`socketServer.ts`

**问题**：三个服务端实现中有几乎相同的 controller 函数解析代码（~15行 × 3），逻辑为：遍历 `actions` → 按 `key` 路径走 `obj[key]` → 找不到则抛错。

**建议**：提取为 `resolveControllerFn(obj, actions)` 共享工具函数。

---

### 3.3 `loadController`/`loadControllerAsync` 的 initializer 重复

**文件**：`src/controller/controller_loader.ts:30-37,55-62`

**问题**：initializer 回调完全一样地复制了两份。

**建议**：提取为模块级常量或工厂函数。

---

### 3.4 窗口轮询等待逻辑重复

**文件**：`src/electron/window/index.ts:121-152,241-262`

**问题**：等待前端 dev server 和等待 cross service 的轮询模式几乎相同——`while` 循环 + `sleep` + `axios` 请求 + try/catch + 计数器。

**建议**：提取为 `waitForService(url, options)` 工具函数。

---

### 3.5 `dir.ts` 重复的目录创建模式

**文件**：`src/app/dir.ts:9-22`

**问题**：三次重复 `if (!fs.existsSync(dir)) { mkdir(dir, ...); }` 模式。

**建议**：循环处理目录数组。

---

## 四、错误处理问题

### 4.1 EventBus 吞错误且忽略重复注册

**文件**：`src/app/events.ts:13-14,29-30,21,36`

**问题**：
1. 重复注册 handler 被静默丢弃，无警告
2. handler 抛出异常时无 try/catch，可能导致进程崩溃
3. TODO 注释承认 async handler 未正确处理

**建议**：
- 重复注册时至少输出警告
- 包裹 handler 调用在 try/catch 中，将错误转发到 error 事件或日志
- 支持 async handler（`Promise.resolve().then(fn).catch(...)`）

---

### 4.2 `httpServer._dispatch` 错误时返回 200

**文件**：`src/socket/httpServer.ts:149-151`

**问题**：dispatch 出错时只 log 不设置错误状态码，客户端收到 200 空响应。`ctx.response.status = 200` 在顶部无条件设置。

**建议**：在 catch 块中设置 `ctx.response.status = 500` 并返回错误信息。

---

### 4.3 异步初始化在构造函数中未 await

**文件**：`src/socket/socketServer.ts:23`、`httpServer.ts:29`

**问题**：构造函数中调用 `async init()` 但未 await，对象可能在未完全初始化时被使用。

**建议**：改为工厂模式（`static async create()`），或确保调用方在 init 完成前不使用实例。

---

### 4.4 错误处理策略不一致

**问题**：各模块错误处理方式混乱，没有统一规范：

| 模块 | 错误处理方式 |
|------|-------------|
| `cross` | throw |
| `storage` | `assert`（抛 AssertionError） |
| `socket/httpServer` | 静默吞掉 |
| `socket/socketServer` | log and continue |
| `load-balancer` | `console.warn` |
| 其他模块 | `coreLogger.warn` |

**建议**：制定统一策略——框架核心错误应使用 `coreLogger` + 有意义的异常类，避免 `assert` 和 `console.warn`。

---

### 4.5 `resolveModule` 静默返回 `undefined`

**文件**：`src/loader/index.ts:68`

**问题**：路径无法解析时返回 `undefined` + `console.warn`，调用方 `loadFile` 用 `|| fullpath` 回退，可能产生更难诊断的下游错误。

**建议**：在 `loadFile` 中对回退路径增加明确的错误信息，说明原始路径解析失败。

---

### 4.6 `requireFile` 无存在性检查

**文件**：`src/loader/index.ts:28-30`

**问题**：直接委托给 `coreLoadFile`，如果文件不存在，错误来自 `require` 机制深层，缺乏上下文信息。对比 `loadFile` 有明确的 `fs.existsSync` 检查。

---

## 五、安全隐患

### 5.1 不安全的默认 Electron WebPreferences

**文件**：`src/config/default_config.ts:17-18`

**问题**：`contextIsolation: false` + `nodeIntegration: true` 是已知的 Electron 安全风险组合，允许 renderer 进程直接访问 Node.js API。

**建议**：
- 短期：在注释中明确标注安全风险，引导用户在业务配置中覆盖
- 长期：改为安全默认值（`contextIsolation: true`），通过 preload 脚本暴露必要 API

---

### 5.2 `ChildApp.run()` 无 `jobFunc` 白名单校验

**文件**：`src/jobs/child/app.ts:65`

**问题**：通过 IPC 消息传入的 `jobFunc` 直接用于 `instance[jobFunc]` 访问，恶意消息可访问 `constructor`、`__proto__` 等危险属性。

**建议**：增加 `hasOwnProperty` 检查或方法白名单：

```ts
const allowedMethods = new Set(Object.getOwnPropertyNames(Object.getPrototypeOf(instance)));
if (!allowedMethods.has(jobFunc)) {
  throw new Error(`Method ${jobFunc} is not accessible`);
}
```

---

### 5.3 Socket/HTTP dispatch 无输入校验

**文件**：`src/socket/httpServer.ts:106-154`、`socketServer.ts:50-78`

**问题**：请求路径/命令直接用于解析和调用 controller 方法，无路径合法性校验。虽然 `extend` 工具过滤了 `__proto__`，但理论上精心构造的路径仍可能调用到非预期的方法。

**建议**：对 channel/cmd 路径增加格式校验（只允许字母数字和 `/`），或维护可调用方法的白名单。

---

### 5.4 `SqliteStorage` 无路径遍历保护

**文件**：`src/storage/sqliteStorage.ts`

**问题**：`name` 参数直接用于路径构造，`../../etc/passwd` 这类输入可能越界写入。虽然 `.db` 扩展名要求和 `path.basename` 处理提供了一定限制，但 `mode === 'relative'` 分支可能绕过。

**建议**：对 `name` 参数进行路径遍历检查：

```ts
if (name.includes('..')) throw new Error('Invalid database name: path traversal detected');
```

---

### 5.5 `ChildApp._handleMessage` 不校验消息格式

**文件**：`src/jobs/child/app.ts:33`

**问题**：IPC 消息 `m` 未经格式校验直接使用 `m.cmd`、`m.params`，格式错误的消息可能导致运行时异常。

**建议**：增加基本的消息格式校验。

---

## 六、性能问题

### 6.1 热路径中大量同步 I/O

**文件**：`src/core/loader/file_loader.ts`、`src/loader/index.ts`、`src/app/dir.ts`

**问题**：`globby.sync()`、`fs.existsSync()`、`fs.statSync()`、`fs.mkdirSync()` 在启动热路径中广泛使用。`loadAsync()` 中仍使用 `fs.statSync()`，未完全异步化。

**影响**：启动时阻塞 Node.js 事件循环，可能造成 Electron 应用 UI 卡顿。

**建议**：
- `loadAsync()` 路径全部改为异步 API（`fs.promises.stat`、`fs.promises.mkdir` 等）
- 开发模式可保留同步路径（启动速度优先），生产模式推荐异步路径

---

### 6.2 `isBytecodeClass` 对每个导出调用 `String()`

**文件**：`src/core/utils/index.ts:56`

**问题**：`String(exports).indexOf('[class')` 对大型对象可能很慢，且依赖 `toString()` 字符串匹配本身很脆弱。

**建议**：考虑更可靠的检测方式，或缓存结果。

---

### 6.3 `methodToMiddleware` 每次调用创建新 Controller 实例

**文件**：`src/controller/controller_loader.ts:101`

**问题**：每次中间件调用都 `new Controller()`，开销大且无法在方法间保持状态（如数据库连接）。

**建议**：考虑单例模式或实例池，至少提供配置选项让用户选择。

---

### 6.4 `Object.keys(this.children).length` 重复创建数组

**文件**：`src/jobs/child-pool/index.ts:70,83,112`

**问题**：多次调用 `Object.keys()` 创建新数组来获取长度。

**建议**：维护数值计数器，`add/del` 时增减。

---

### 6.5 `chmodPath` 同步递归遍历

**文件**：`src/utils/helper.ts:49-62`

**问题**：使用 `fs.readdirSync`、`fs.statSync`、`fs.chmodSync` 递归遍历大目录时会长时间阻塞事件循环。无异步替代方案。

---

## 七、死代码和命名问题

### 7.1 拼写错误

| 文件 | 行号 | 当前 | 修正 |
|------|------|------|------|
| `src/app/boot.ts` | 19 | `environmet` | `environment` |
| `src/app/boot.ts` | 20 | `debuger` | `debugger` |
| `src/utils/pargv.ts` | 12 | `typeof x === 'number'`（参数类型为 string，永远为 false） | 移除该行 |

---

### 7.2 死代码

| 代码 | 文件 | 说明 |
|------|------|------|
| `EXPORTS` Symbol | `core/loader/file_loader.ts:14` | 定义后无任何读取 |
| `Timing` 数据 | `core/utils/timing.ts` | 收集后从未消费，`toJSON()` 从未调用 |
| `getController()` | `controller/index.ts:24-26` | 只是 `getControllers()` 的误导性别名 |
| `ChildJob.execPromise` | `jobs/child/index.ts:84-86` | `async` 包装同步方法，无意义 |
| `ChildPoolJob.runPromise` | `jobs/child-pool/index.ts:130-132` | 与 `run` 完全相同 |
| `if (!proc)` 检查 | `jobs/child/index.ts:64` | 构造函数总是返回对象，条件永远不成立 |
| 注释掉的 sleep | `cross/cross.ts:37` | `//await sleep(5 * 1000);` |
| `systemSleep` | `utils/helper.ts:128-140` | 无调用者，且阻塞事件循环 |

---

### 7.3 `wrapClass`/initializer 原型链副作用

**文件**：`src/controller/controller_loader.ts:32-33`、`core/loader/file_loader.ts:143-144`

**问题**：直接修改 `obj.prototype.pathName` / `fullPath`，如果同一类被不同路径加载会互相覆盖。

**建议**：将路径信息存储在实例上（`instance.__pathName`）或使用 WeakMap 关联。

---

### 7.4 Load Balancer 权重算法偏差

**文件**：`src/jobs/load-balancer/algorithm/weights.ts:16-24`

**问题**：`max` 初始化为 `first.weight`，首次比较 `sum >= max` 几乎总是成立（因为 sum 包含 `Math.random() * weightTotal`），导致第一个 target 系统性地不被选中。`weightsMinimumConnection.ts` 存在类似问题。

---

### 7.5 `getValueFromArgv` 重复解析

**文件**：`src/utils/helper.ts:156-175`

**问题**：先调用 `parseArgv(argv)` 解析参数，找不到 key 时又用手工字符串扫描重新解析。两种方式对边界情况可能产生不同结果。

**建议**：统一使用 `parseArgv`，移除手工解析分支。

---

### 7.6 `fileIsExist` TOCTOU 竞态

**文件**：`src/utils/helper.ts:177-179`

**问题**：`fs.existsSync` 和 `fs.statSync` 之间文件可能被删除，导致 `statSync` 抛出异常。

---

### 7.7 子进程资源清理不完整

**问题**：`cross/cross.ts` 和 `jobs/child/jobProcess.ts` 各自管理子进程，没有统一清理机制。`electron/app/index.ts` 的 `before-quit` 只调用 `cross.killAll()`，job 子进程未被清理。

---

### 7.8 Load Balancer 端口锁 interval 未清理

**文件**：`src/utils/port/index.ts:96-104`

**问题**：`setInterval` 创建的端口管理定时器从未被 `clearInterval`，虽然 `unref()` 防止了进程不退出，但资源未正式释放。

---

## 八、优化建议优先级排序

### P0 — 必须修复（功能缺陷）

| # | 项目 | 文件 |
|---|------|------|
| 1 | 修复 `.defalut` 拼写 | `loader/index.ts:50` |
| 2 | 修复 `execFile` 未展开 `inject` | `loader/index.ts:36,38` |
| 3 | 修复 `ElectronAppReady` 时序 | `electron/app/index.ts:42` |
| 4 | 修复 IPC 双注册 | `socket/ipcServer.ts:54,67` |

### P1 — 高优先级（类型安全 / 正确性）

| # | 项目 | 文件 |
|---|------|------|
| 5 | 移除自定义 koa 声明，使用 @types/koa | `types/declarations.d.ts:52-100` |
| 6 | 补全缺失的类型导出 | `index.ts` |
| 7 | 补全 `HttpServerConfig.koaConfig` | `types/index.ts` |
| 8 | 提取 FileLoader 重复逻辑 | `core/loader/file_loader.ts` |
| 9 | 修复 `loadControllerAsync` registry 支持 | `controller/controller_loader.ts` |
| 10 | 修复 ESM 默认导出处理不一致 | `core/utils/index.ts:30,84-85` |
| 11 | 统一错误处理策略 | 多文件 |

### P2 — 中优先级（安全 / 可靠性）

| # | 项目 | 文件 |
|---|------|------|
| 12 | 修复 `fnDebounce` | `utils/helper.ts:7-36` |
| 13 | 异步初始化统一 await | `socket/socketServer.ts`、`httpServer.ts` |
| 14 | 提取 socket 函数解析公共逻辑 | `socket/` 三文件 |
| 15 | 增加 `ChildApp` jobFunc 白名单校验 | `jobs/child/app.ts:65` |
| 16 | 增加 `SqliteStorage` 路径遍历保护 | `storage/sqliteStorage.ts` |
| 17 | 增加 Socket/HTTP dispatch 输入校验 | `socket/httpServer.ts`、`socketServer.ts` |
| 18 | 修复 `httpServer._dispatch` 错误返回 200 | `socket/httpServer.ts:149-151` |
| 19 | 修复 EventBus 错误处理 | `app/events.ts` |
| 20 | 标注/改进不安全的默认 WebPreferences | `config/default_config.ts:17-18` |

### P3 — 低优先级（代码质量 / 性能）

| # | 项目 | 文件 |
|---|------|------|
| 21 | 消除同步 I/O（异步路径） | 多文件 |
| 22 | 修复 Load Balancer 权重算法偏差 | `jobs/load-balancer/algorithm/weights.ts` |
| 23 | 清理死代码 | 多文件 |
| 24 | 修正拼写错误 | `boot.ts`、`pargv.ts` |
| 25 | `methodToMiddleware` 改为实例复用 | `controller/controller_loader.ts:101` |
| 26 | `CrossConfig` 类型精确化 | `types/index.ts:103-105` |
| 27 | `LoggerConfig` 字段类型收窄 | `types/index.ts:74,80,82` |
| 28 | 统一子进程清理机制 | `cross/`、`jobs/` |
| 29 | 清理 Load Balancer 端口锁 interval | `utils/port/index.ts` |

---

## 九、修复记录

> 以下为已完成的修复，按修复批次分组

### 第一批修复（P0 + P1 + P2 + P3 核心）

| # | 原编号 | 修复内容 | 涉及文件 |
|---|--------|----------|----------|
| 1 | P0-1 | 修复 `.defalut` → `.default` 拼写 | `loader/index.ts` |
| 2 | P0-2 | 修复 `execFile` 中 `inject` 展开为 `...inject` | `loader/index.ts` |
| 3 | P0-3 | 修复 `ElectronAppReady` 移入 `whenReady()` 回调 | `electron/app/index.ts` |
| 4 | P0-4 | IPC `on` handler 改为同步返回，不再与 `handle` 冲突 | `socket/ipcServer.ts` |
| 5 | P1-5 | 移除自定义 koa 声明，使用 `@types/koa` | `types/declarations.d.ts` |
| 6 | P1-6 | 补全类型导出：`ProcessExitEventData`、`PidInfo`、`CrossRunOptions`、`EeLogger`、`PinoLoggers` | `index.ts` |
| 7 | P1-7 | 新增 `KoaConfig` 接口，`HttpServerConfig` 增加 `koaConfig`；`CrossConfig` 收窄为 `Record<string, CrossTargetConfig>`；`LoggerConfig` 字段收窄 | `types/index.ts`、`socket/httpServer.ts` |
| 8 | P1-8 | 统一 `loadFile`/`loadFileAsync` 的 ESM 默认导出检测逻辑 | `core/utils/index.ts` |
| 9 | P1-9 | `loadControllerAsync` 增加 registry 支持 | `controller/controller_loader.ts` |
| 10 | P1-10 | `getControllers` 增加 `loading` 状态锁防止竞态 | `controller/index.ts` |
| 11 | P2-18 | `_dispatch` 错误时返回 500 而非 200 | `socket/httpServer.ts` |
| 12 | P2-19 | EventBus 增加 try/catch、async handler 支持、重复注册警告 | `app/events.ts` |
| 13 | P3-24 | 修正 `environmet`→`environment`、`debuger`→`debugger`、移除 `isNumber` 死代码 | `boot.ts`、`pargv.ts` |
| 14 | P3-23 | 清理注释掉的 `sleep` 代码 | `cross/cross.ts` |
| 15 | — | `CrossTargetConfig` 统一到 `types/index.ts`，`crossProcess.ts` 改为从 types 导入并 re-export | `cross/crossProcess.ts`、`cross/cross.ts` |

### 第二批修复（复查后新增）

| # | 修复内容 | 涉及文件 |
|---|----------|----------|
| 16 | 导出 `loadFileAsync` 和 `loadControllerAsync` 到主入口 | `index.ts` |
| 17 | 修复 `fnDebounce`：用 `Map` 替代对象 key、正确清除对应 timer | `utils/helper.ts` |
| 18 | 增加 `ChildApp` jobFunc 的 `hasOwnProperty` 安全校验 | `jobs/child/app.ts` |
| 19 | 增加 `SqliteStorage` 路径遍历保护（`..` 检查） | `storage/sqliteStorage.ts` |
| 20 | `Cross.getUrl()` 增加 null safety，返回 `string \| undefined` | `cross/cross.ts` |
| 21 | `Cross.create()` 改为 `await this.run(key)` | `cross/cross.ts` |
| 22 | `CrossProcess.getUrl()` port=0 时增加 warn 日志 | `cross/crossProcess.ts` |
| 23 | 修复 `fileIsExist` TOCTOU：改为 `statSync` + try/catch | `utils/helper.ts` |
| 24 | 提取 `resolveControllerFn` 共享工具，三处 socket 服务端复用 | `socket/utils.ts`（新建）、`httpServer.ts`、`ipcServer.ts`、`socketServer.ts` |
| 25 | 标注 `default_config.ts` 不安全 WebPreferences 的安全警告 | `config/default_config.ts` |
| 26 | 修复 `CrossProcess.kill` _exitElectron 双重调用，增加 killed 检查 | `cross/crossProcess.ts` |
| 27 | 补充 `CrossProcessOptions`/`CrossHost` 到主入口导出；`Cross` 增加 `implements CrossHost` | `index.ts`、`cross/cross.ts` |
| 28 | `window/index.ts` 适配 `getUrl()` 返回 `string \| undefined` | `electron/window/index.ts` |

### 第三批修复（复查后持续优化）

| # | 修复内容 | 涉及文件 |
|---|----------|----------|
| 29 | FileLoader 提取 `_processExport`/`_assignToTarget` 消除三方法重复 | `core/loader/file_loader.ts` |
| 30 | 提取 `waitForUrl` 工具，消除窗口两处轮询等待重复 | `electron/window/index.ts` |
| 31 | 修复 Load Balancer 权重算法偏差（`-Infinity`/`Infinity` 初始值） | `jobs/load-balancer/algorithm/weights.ts`、`weightsMinimumConnection.ts` |
| 32 | 移除 `getValueFromArgv` 冗余手工解析分支 | `utils/helper.ts` |
| 33 | 精简 `log/index.ts` 三个 getter 为 `_getLoggerBy` 工厂 | `log/index.ts` |
| 34 | `parseAsync` 中 `fs.statSync` → `fs.promises.stat`；`loadFileAsync` 中 `fs.readFileSync` → `fs.promises.readFile` | `core/loader/file_loader.ts`、`core/utils/index.ts` |
| 35 | 新增 `releasePortLocks()` 清理端口锁 interval 并导出 | `utils/port/index.ts`、`index.ts` |

### 仍未修复的项目

| # | 原编号 | 内容 | 原因 |
|---|--------|------|------|
| 1 | P2-13 | 异步初始化统一 await（构造函数中 `async init()`） | 需改为工厂模式，API 变更 |
| 2 | P3-25 | `methodToMiddleware` 改为实例复用 | 行为变更，需评估影响 |
| 3 | P3-28 | 统一子进程清理机制 | ✅ 已修复 |
| 4 | — | `__filename` ESM 兼容性（`import.meta.url`） | ✅ 已修复 |

### 第四批修复（最后 4 项）

| # | 修复内容 | 涉及文件 |
|---|----------|----------|
| 36 | SocketServer/HttpServer 改为 `static async create()` 工厂模式，确保 init 完成 | `socket/socketServer.ts`、`socket/httpServer.ts`、`socket/index.ts`、`app/application.ts` |
| 37 | ~~`methodToMiddleware` 改为实例复用~~ **已回退** — 每次请求创建新实例是更安全的做法，保证并发请求状态隔离 | `controller/controller_loader.ts` |
| 38 | 新增 `jobs/registry.ts`，提供 `registerJobManager`/`killAllJobs`，`before-quit` 中统一清理 | `jobs/registry.ts`（新建）、`electron/app/index.ts`、`index.ts` |
| 39 | `__filename` 增加 CJS 不可用时的 fallback（`process.cwd()` 替代） | `core/utils/index.ts` |

### 全部修复完成，无剩余项
