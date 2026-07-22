# AGENT.md

本文件为 AI Agent 在 `ohos_hap/` 目录及其子目录中工作时提供指引。仓库根目录的 `AGENTS.md` 仍然适用；本文件只补充 HarmonyOS HAP 移植层的结构、边界和工作流。若两者冲突，以作用域更具体且更新的指令为准。

## 1. 子项目定位

`ohos_hap/` 是 **electron-egg (ee-v5)** 的 HarmonyOS HAP 移植层，基于 ArkUI-X：

- 外层 `ee-demo-ohos/` 负责 Electron 主进程、Vue 前端及应用构建。
- 本目录负责 Ability 生命周期、ArkUI 页面、Web/Electron 容器、多进程适配、原生库和 HAP 打包。
- 外层应用构建产物由 `ee-bin ohos` 注入 `web_engine` 的 `resfile`，再随 HAP 分发。
- `electron/` 是入口 HAP 模块；`web_engine/` 是核心 HAR 模块，两者不是外层根目录 `electron/` 主进程源码的同一个目录。

当前关键配置：

| 项目 | 值 |
|---|---|
| bundleName | `com.electronegg.demo` |
| 设备类型 | `2in1`、`tablet` |
| compatible/target SDK | `HarmonyOS 6.1.0(23)` |
| APP 模式 | `multiInstance`，最多 2 个实例 |
| 主 Ability | `EntryAbility` |
| 构建模块 | `electron@default` |

## 2. 修改边界

先判断问题属于哪一层，再修改对应位置：

| 需求或问题 | 修改位置 |
|---|---|
| ElectronEgg 控制器、服务、配置、preload、jobs | 仓库根目录 `electron/` |
| Vue 页面和浏览器端逻辑 | 仓库根目录 `frontend/` |
| HAP Ability、ArkUI 页面、模块权限 | `ohos_hap/electron/` |
| HarmonyOS Web/Electron 容器及平台适配 | `ohos_hap/web_engine/` |
| HAP 资源注入规则 | 根目录 `cmd/bin.js` 的 `ohos` 配置 |
| 鸿蒙版 `better-sqlite3` | `ohos_hap/common/` |
| `ee-core`、`ee-bin` 框架源码 | 独立的 `ee-dev` 仓库，不在本 demo 中修改 |

重要约束：

- `ee-core`、`ee-bin` 是 npm 依赖。不要直接修改 `node_modules/ee-core` 或 `node_modules/ee-bin` 作为正式修复。
- 不要把外层根目录 `electron/` 与 `ohos_hap/electron/` 混淆：前者是 Node.js 主进程源码，后者是 HarmonyOS entry HAP。
- 不要手工修改资源注入生成的 `resources/app/` 来代替源代码修复；应修改源文件后重新构建、注入。
- 签名文件、密码、本地 SDK 路径属于机器私有配置，不要写入文档、日志或提交内容。

## 3. 目录结构

```text
ohos_hap/
├── AGENT.md
├── build-profile.json5          # APP 构建、SDK、签名、模块声明
├── hvigorfile.ts                # APP Hvigor 入口
├── local.properties             # 本地 ArkUI-X SDK 路径，已忽略
├── AppScope/
│   ├── app.json5                # bundleName、版本、多实例模式
│   └── resources/               # APP 级资源
├── electron/                    # entry HAP：Ability 壳和 ArkUI 页面
│   ├── src/main/ets/
│   │   ├── Application/         # AbilityStage
│   │   ├── entryability/        # Entry/Browser/Stateless 等 Ability
│   │   ├── extensionAbility/    # embeddedUI 扩展
│   │   ├── pages/               # ArkUI 页面
│   │   └── process/             # CustomChildProcess
│   ├── src/main/module.json5    # 权限、Ability、进程、skills
│   ├── libs/arm64-v8a/          # HAP 原生库
│   └── oh-package.json5         # file:../web_engine
├── web_engine/                  # HAR：Web/Electron 引擎核心
│   ├── Index.ets                # 公共导出
│   ├── childProcess.ets         # 子进程导出
│   └── src/main/
│       ├── ets/
│       │   ├── ability/         # WebAbility 等基类
│       │   ├── application/     # WebAbilityStage
│       │   ├── components/      # WebWindow/WebSubWindow 等
│       │   ├── adapter/         # HarmonyOS/Electron 适配
│       │   ├── jsbindings/      # JS 绑定
│       │   ├── process/         # WebChildProcess
│       │   ├── interface/       # 公共接口
│       │   ├── common/
│       │   └── utils/
│       ├── cpp/types/           # NAPI 类型定义
│       └── resources/resfile/   # Electron 运行时和注入的应用资源
├── common/                      # 鸿蒙原生模块编译辅助
└── docs/                        # 项目导读和目录说明
```

## 4. 核心架构与不变量

### 4.1 继承与职责分层

`electron` 模块应保持为薄壳，主要生命周期和平台能力实现在 `web_engine`：

| electron 类 | web_engine 基类 | 职责 |
|---|---|---|
| `MyAbilityStage` | `WebAbilityStage` | 应用初始化 |
| `EntryAbility` | `WebAbility` | 主窗口生命周期 |
| `BrowserAbility` | `WebAbility` | `:browser` 进程窗口 |
| `StatelessAbility` | `WebAbility` | 无状态窗口 |
| `BrowserEmbeddedAbility` | `WebEmbeddedAbility` | embeddedUI 扩展 |
| `CustomChildProcess` | `WebChildProcess` | 子进程通信 |

修改生命周期时：

- 先确认逻辑是应用定制还是通用引擎能力。
- 通用行为优先放在 `web_engine` 基类；应用入口只做必要配置和委托。
- 覆盖生命周期方法时保留必要的 `super` 调用和原有调用顺序。
- 不要把只属于 `EntryAbility` 的状态无条件扩散到 `BrowserAbility` 或 `StatelessAbility`。

### 4.2 多进程与多实例

- `EntryAbility` 运行在默认进程，`launchType` 为 `specified`。
- `BrowserAbility`、`StatelessAbility` 通过 `module.json5` 的 `process: ':browser'` 运行在独立进程。
- `CustomChildProcess` 继承 `WebChildProcess`，通过 `web_engine/childProcess.ets` 暴露。
- APP 使用 `multiInstance`，最大实例数为 2；新增全局状态时必须考虑进程隔离和实例隔离。
- 不要假设不同 Ability、进程或实例共享同一份内存单例。

### 4.3 页面入口

`electron/src/main/ets/pages/Index.ets` 是主页面入口：

- 通过 `@Entry(storage)` 绑定 `LocalStorage`。
- 读取 `xcomponentId`、`updateStyle` 等状态。
- 渲染 `web_engine` 导出的 `WebWindow`。
- 通过 `registerUpdateStyleFunction` 连接窗口样式更新。

调整入口页面时，应保持 `LocalStorage` key、XComponent 标识和引擎侧约定一致。

### 4.4 外层 ElectronEgg 运行时

HAP 中运行的应用仍遵循 ee-v5 的构建和加载规则：

- `npm run build-electron` 将根目录 `electron/` 打包到 `public/electron/main.js`。
- controller/config registry 在 bundle 构建时生成，并在真实 `main.js` 之前注册。
- ElectronEgg 初始化顺序为：`loadException → loadConfig → loadDir → loadLog`。
- 运行阶段顺序为：`loadController → loadSocket → Ready → loadElectron`。
- 通信服务创建顺序为：`SocketServer → HttpServer → IpcServer`。
- `ee-core` 不打包进 `main.js`，运行时从注入应用的 `node_modules` 加载；这也是 fork 子进程能找到真实磁盘入口的前提。

如果 HAP 启动成功但 ElectronEgg 控制器、配置或通信服务异常，应检查注入的应用资源和 ee-core DEBUG 日志，而不是先修改 Ability。

## 5. 资源注入

资源规则定义在根目录 `cmd/bin.js` 的 `ohos` 字段。

### 5.1 测试模式

适合日常调试，不依赖 electron-builder 的完整 macOS APP：

```bash
# 在仓库根目录执行
npm run build-frontend   # 仅当前端有变化时需要
npm run ohos-test        # 内含 build-electron，然后注入测试资源
```

注入关系：

| 来源 | 目标 |
|---|---|
| `public/` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public/` |
| `ohos_hap/common/better-sqlite3/` | `.../resources/app/node_modules/better-sqlite3/` |

注意：`npm run ohos-test` 会构建 Electron 主进程，但不会自动执行 `build-frontend`。

### 5.2 生产模式

```bash
# 在仓库根目录执行
npm run build-m
npm run ohos
```

注入关系：

| 来源 | 目标 |
|---|---|
| `out/mac-arm64/ee.app/Contents/Resources/app/` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app/` |
| `out/mac-arm64/ee.app/Contents/Resources/extraResources/` | `.../resources/extraResources/` |

`npm run ohos` 只提取已有打包产物，因此必须先确认 `out/mac-arm64/ee.app/` 是最新的。

### 5.3 resfile 内容分类

`web_engine/src/main/resources/resfile/` 同时包含：

1. 随引擎维护的 Electron 运行时：`electron`、`icudtl.dat`、`*.pak`、`locales/`、V8 snapshot、Vulkan 资源等。
2. 由 `ee-bin ohos` 注入的 ElectronEgg 应用：`resources/app/` 和 `resources/extraResources/`。

排查时先区分是“运行时文件缺失”还是“应用资源陈旧/未注入”。不要用一次性的手工复制掩盖 `cmd/bin.js` 注入规则问题。

## 6. 开发与验证

### 6.1 环境要求

- Node.js 20 或更高版本。
- 根项目推荐 pnpm，也兼容 npm；不要无故更换包管理器或重写锁文件。
- DevEco Studio 和匹配的 HarmonyOS / ArkUI-X SDK。
- `local.properties` 中 `arkui-x.dir` 指向本机 ArkUI-X SDK。
- `build-profile.json5` 的本地签名配置有效。
- 构建 HAP 前，外层应用资源已经按测试或生产流程注入。

### 6.2 HAP 构建和运行

在 `ohos_hap/` 中执行：

```bash
build_project --module electron@default
start_app --module electron --ability EntryAbility
```

需要构建全部模块时可执行：

```bash
build_project
```

构建模式包括 `debug` 和 `release`；release 混淆规则见 `electron/obfuscation-rules.txt`。

### 6.3 最小验证原则

根据改动范围选择验证，不要默认跳过：

| 改动 | 至少验证 |
|---|---|
| 单个 `.ets` 实现 | 对改动文件执行 ArkTS 检查，或运行对应模块构建 |
| Ability / `module.json5` | 构建 `electron@default`，必要时真机启动 |
| `web_engine` 公共接口 | 同时检查 HAR 和依赖它的 `electron` 模块 |
| 外层 Electron 主进程 | `npm run build-electron`，再重新注入 |
| 前端 | `npm run build-frontend`，再重新注入 |
| 注入规则 | 检查目标目录内容，并至少执行一次对应的 `ohos-test` 或 `ohos` 流程 |
| 原生库 | ARM64 产物、ABI、加载路径和 HAP 构建 |

若环境提供 ArkTS 独立检查工具，可使用：

```bash
arkts_check --files <file1.ets> <file2.ets>
```

如果本机没有 `build_project`、`start_app` 或 `arkts_check`，应明确说明未执行的验证及原因，不能把“命令不存在”描述为代码已验证。

## 7. ArkTS 编码约束

- 遵循 ArkTS 严格模式和当前目录已有代码风格。
- 避免 `any`、`unknown`、无上下文对象字面量、动态属性访问和不必要的类型断言。
- 优先定义明确的 interface/class/type，保持跨模块公共类型稳定。
- 不要用 JavaScript 的动态技巧绕过 ArkTS 编译器。
- 涉及系统 API 时检查 SDK 版本、权限声明、错误码和 `BusinessError` 处理。
- 修改 `Index.ets`、窗口组件或 adapter 时，关注 Ability 生命周期、窗口销毁和跨进程回调清理，避免残留监听器。

## 8. 配置、权限与敏感信息

- APP 级 SDK、模块和签名配置位于 `build-profile.json5`。
- bundle、版本和多实例配置位于 `AppScope/app.json5`。
- HAP 权限、Ability、ExtensionAbility、进程和 deep link 位于 `electron/src/main/module.json5`。
- 权限变更应最小化，并同步检查 `reason`、`usedScene`、Ability 名称和系统审核要求。
- 不要在输出中展示 `build-profile.json5` 内的证书密码、密钥口令或完整私有签名材料。
- 不要把本机绝对 SDK 路径固化到可共享文档或业务源码中。

## 9. 生成物与忽略文件

以下通常是本地依赖、构建产物或自动生成内容，不应作为常规源码编辑目标：

- `local.properties`
- `.hvigor/`、`**/build/`、`.cxx/`、`.test/`
- `oh_modules/`、`oh-package-lock.json5`
- `web_engine/BuildProfile.ets`
- 注入生成的 `web_engine/src/main/resources/resfile/resources/app/`
- 前端或引擎生成的 rawfile/resfile 内容（除非任务明确要求维护运行时资源）

开始修改前先检查 `git status`。仓库可能已有用户改动；不要覆盖、清理或回滚无关内容。

## 10. 故障排查顺序

按层定位，避免在错误层面反复试改。

### 10.1 ElectronEgg 业务未运行

1. 确认根目录依赖和 `ee-core`、`ee-bin` 版本满足需求；需要最新版时使用正常包管理流程更新。
2. 确认 `public/electron/main.js` 或生产 APP 是最新构建。
3. 确认 `resources/app/` 已重新注入，且存在 `package.json`、`public/`、运行时 `node_modules`。
4. 优先开启最窄的 ee-core DEBUG 命名空间复现，例如配置或控制器加载日志。
5. controller、http、socket 同时失败时，优先检查共享上游：配置 registry、资源注入和 ee-core 加载，而不是分别修改三个服务。

根项目常用诊断命令：

```bash
npm run debug-electron
npm run debug-dev
DEBUG='ee-core:config:*' npm run dev-electron
```

### 10.2 HAP 构建或启动失败

1. 检查 `local.properties` 的 ArkUI-X SDK 路径。
2. 检查 SDK 版本是否与 `6.1.0(23)` 匹配。
3. 检查签名证书文件是否存在；签名失效时在 DevEco Studio 重新配置。
4. 检查 `electron/libs/arm64-v8a/` 及引擎运行时原生库是否齐全。
5. 检查 `module.json5` 中 Ability、进程、权限及资源引用。

### 10.3 原生模块失败

- `better-sqlite3` 必须是 HarmonyOS ARM64 对应版本，不能直接复用桌面 Electron 的二进制。
- 参考 `common/better-sqlite3编译指南.md`，核对 Node/Electron ABI、`.node` 文件位置和注入后的包结构。
- 桌面 Electron 的 `npm run re-sqlite` 只解决桌面端 Electron 原生模块重建，不能替代 HarmonyOS 原生模块编译。

## 11. 提交前检查

- 改动位于正确层级，没有误改注入产物或 `node_modules`。
- 未泄露签名密码、本地证书、密钥或机器私有路径。
- Ability 生命周期中的 `super` 调用和调用顺序未被破坏。
- 多进程、多实例和资源注入场景已考虑。
- 已执行与改动匹配的最小构建/检查，并如实记录未执行项。
- `git diff` 中没有无关格式化、生成物或用户已有改动。
