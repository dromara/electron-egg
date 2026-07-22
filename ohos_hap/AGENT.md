# AGENT.md

本文件为 AI Agent 在此 `ohos_hap` 目录中工作时提供指引。

## 项目概览

这是 **electron-egg** 的 HarmonyOS HAP 移植层。利用 ArkUI-X 框架将 Electron 桌面应用移植到鸿蒙系统。外层 `ee-demo-ohos/` 是完整的 Electron 应用（Node.js 主进程 + Vue 前端），本目录 (`ohos_hap/`) 负责在鸿蒙设备上提供 Web 渲染容器、Ability 生命周期管理和子进程通信。

- **bundleName**: `com.electronegg.demo`
- **目标设备**: 2in1、tablet
- **SDK 版本**: HarmonyOS 6.1.0(23) API
- **ArkUI-X SDK**: `/Users/gsx/Library/ArkUI-X/Sdk`（见 `local.properties`）

## 架构

```
ohos_hap/
├── build-profile.json5       # APP 级构建配置（签名、SDK 版本、模块声明）
├── hvigorfile.ts              # Hvigor 构建脚本入口
├── AppScope/
│   ├── app.json5              # 应用级配置（bundleName、版本、多实例模式）
│   └── resources/             # 应用级资源（图标、字符串）
├── electron/                  # 【入口模块 HAP】鸿蒙 Ability 壳，继承 web_engine 基类
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── Application/
│   │   │   │   └── AbilityStage.ets        # 继承 WebAbilityStage
│   │   │   ├── entryability/
│   │   │   │   ├── EntryAbility.ets        # 主入口 Ability（继承 WebAbility）
│   │   │   │   ├── BrowserAbility.ets      # 浏览器进程 Ability（:browser 进程）
│   │   │   │   ├── StatelessAbility.ets     # 无状态 Ability
│   │   │   │   ├── StatusBarEntryAbility.ets # 状态栏扩展 Ability
│   │   │   │   └── TaskManagerAbility.ets
│   │   │   ├── extensionAbility/
│   │   │   │   └── BrowserEmbeddedAbility.ets # embeddedUI 扩展（继承 WebEmbeddedAbility）
│   │   │   ├── pages/                      # ArkUI 页面
│   │   │   │   ├── Index.ets               # 主页面（加载 WebWindow 组件）
│   │   │   │   ├── WebPage.ets
│   │   │   │   ├── Login.ets
│   │   │   │   ├── SubWindow.ets
│   │   │   │   ├── EmbeddedWindow.ets
│   │   │   │   ├── NodeHandleWindow.ets
│   │   │   │   ├── NodeHandleSubWindow.ets
│   │   │   │   ├── WindowNode.ets
│   │   │   │   ├── StatusBarPage.ets
│   │   │   │   └── QuickLoginButtonComponent.ets
│   │   │   └── process/
│   │   │       └── CustomChildProcess.ets  # 子进程（继承 WebChildProcess）
│   │   ├── module.json5                    # 模块配置（权限、Ability 声明）
│   │   └── resources/                      # 模块级资源
│   ├── libs/arm64-v8a/                     # 原生库
│   └── oh-package.json5                    # 依赖 web_engine（file:../web_engine）
├── web_engine/                # 【HAR 模块】Web 引擎核心库
│   ├── Index.ets              # 对外导出接口
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── ability/      # WebAbility / WebEmbeddedAbility 基类
│   │   │   ├── application/  # WebAbilityStage 基类
│   │   │   ├── components/   # WebWindow / WebSubWindow / WebEmbeddedWindow 等
│   │   │   ├── adapter/      # 适配层
│   │   │   ├── jsbindings/   # JS 绑定
│   │   │   ├── process/      # WebChildProcess 基类
│   │   │   ├── interface/    # 公共接口定义
│   │   │   ├── common/       # 公共工具
│   │   │   └── utils/
│   │   ├── cpp/types/        # NAPI 类型定义（libadapter.so）
│   │   ├── module.json5
│   │   └── resources/
│   ├── childProcess.ets      # 子进程导出
│   ├── BuildProfile.ets      # 构建配置（自动生成，gitignore）
│   └── oh-package.json5      # 依赖 inversify + reflect-metadata
└── common/                    # 原生库编译辅助
    ├── better-sqlite3-ohos-v138/
    ├── better-sqlite3/
    └── better-sqlite3编译指南.md
```

## 核心模式

### 继承体系

`electron` 模块的所有类都继承自 `web_engine` 模块提供的基类：

| electron 模块类 | web_engine 基类 | 职责 |
|---|---|---|
| `MyAbilityStage` | `WebAbilityStage` | 应用初始化 |
| `EntryAbility` | `WebAbility` | 主窗口生命周期 |
| `BrowserAbility` | `WebAbility` | 浏览器进程（`:browser`） |
| `StatelessAbility` | `WebAbility` | 无状态窗口 |
| `BrowserEmbeddedAbility` | `WebEmbeddedAbility` | embeddedUI 扩展 |
| `CustomChildProcess` | `WebChildProcess` | 子进程通信 |

子类通过 `super.xxx()` 委托所有生命周期方法给基类，业务逻辑在 `web_engine` 中实现。

### 多进程架构

- **主进程**: `EntryAbility`，运行在默认进程
- **浏览器进程**: `BrowserAbility` 和 `StatelessAbility`，通过 `module.json5` 中 `"process": ":browser"` 指定独立进程
- **子进程**: `CustomChildProcess` 继承 `WebChildProcess`，通过 `childProcess.ets` 导出

### 多实例模式

`AppScope/app.json5` 配置了 `multiAppMode`:
- 类型: `multiInstance`（多实例）
- 最大实例数: 2

`EntryAbility` 的 `launchType` 为 `specified`（指定实例启动模式）。

### 页面结构

`Index.ets` 是主入口页面，通过 `@Entry(storage)` 装饰器绑定 `LocalStorage`：
- 从 `LocalStorage` 读取 `xcomponentId` 和 `updateStyle`
- 渲染 `WebWindow` 组件（来自 `web_engine`）
- 通过 `registerUpdateStyleFunction` 注册样式更新回调

## 外层 ElectronEgg 集成

本 HAP 是 ElectronEgg (`ee-demo-ohos/`) 的鸿蒙移植层。外层项目是完整的 Electron 应用（Node.js 主进程 + Vue 前端），通过 `ee-bin ohos` 命令将 Electron 构建产物注入到 HAP 的资源目录中，由 `web_engine` HAR 模块提供 Web 容器在鸿蒙上运行。

### 资源注入机制

外层项目通过两条路径将 Electron 资源注入到 HAP（配置在 `ee-demo-ohos/cmd/bin.js` 的 `ohos` 字段）：

**生产模式 (`npm run ohos`)**

前置条件：需要先执行 `npm run build-m`（macOS ARM64 打包），生成 `./out/mac-arm64/ee.app/`。

执行 `ee-bin ohos --cmds=resources`，从打包后的 macOS app 中提取：

| 来源 | 目标 |
|------|------|
| `./out/mac-arm64/ee.app/Contents/Resources/app` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app` |
| `./out/mac-arm64/ee.app/Contents/Resources/extraResources` | `ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources` |

其中 `app/` 包含完整的 Electron 应用（打包后的 `main.js`、`package.json`、`public/`（前端 dist + electron 主进程）、`node_modules/`）。

**测试模式 (`npm run ohos-test`)**

无需 electron-builder 打包，适合开发调试。先执行 `npm run build-electron`（esbuild 打包 `electron/` -> `public/electron/main.js`），再执行 `ee-bin ohos --cmds=test`：

| 来源 | 目标 |
|------|------|
| `./public` | `.../resfile/resources/app/public` |
| `./ohos_hap/common/better-sqlite3` | `.../resfile/resources/app/node_modules/better-sqlite3` |

`public/` 包含 `dist/`（前端构建产物）、`electron/`（打包后的主进程）、`html/`、`images/`、`ssl/`。`better-sqlite3` 是为鸿蒙 ARM64 编译的原生模块（编译指南见 `common/better-sqlite3编译指南.md`）。

### resfile 目录结构

`web_engine/src/main/resources/resfile/` 是 HAP 的原生资源目录，包含两类内容：

1. **Electron 运行时**（随 web_engine HAR 分发，非 npm 脚本复制）：
   - `electron` - Electron 二进制
   - `icudtl.dat` - ICU 国际化数据
   - `*.pak` - Chromium 资源包
   - `locales/` - 本地化文件
   - `v8_context_snapshot.bin` - V8 快照
   - `vulkan/` - 图形驱动

2. **ElectronEgg 应用资源**（由 `ee-bin ohos` 注入，`.gitignore` 忽略）：
   - `resources/app/` - Electron 应用代码（主进程、前端、node_modules）
   - `resources/extraResources/` - 额外资源（Go/Python 后端等）

### 两层架构关系

```
ee-demo-ohos/                     # 外层 ElectronEgg 项目
├── electron/                     # Electron 主进程源码（TypeScript）
│   ├── controller/               # 业务控制器（IPC/HTTP/Socket 入口）
│   ├── service/                  # 业务服务
│   ├── config/                   # 配置文件
│   └── main.ts                   # 主进程入口
├── frontend/                     # Vue 3 前端源码
├── public/                       # 构建产物（dev 模式）
│   ├── electron/main.js          # esbuild 打包后的主进程
│   └── dist/                     # Vite 构建的前端
├── out/                          # electron-builder 打包产物（prod 模式）
├── build/extraResources/         # 额外资源（Go/Python 后端等）
├── cmd/bin.js                    # ee-bin 配置（含 ohos 资源注入规则）
├── package.json                  # npm scripts（ohos / ohos-test）
│
└── ohos_hap/                     # 鸿蒙 HAP 项目（本目录）
    └── web_engine/src/main/resources/resfile/
        ├── electron              # Electron 运行时二进制
        └── resources/app/        # ← 外层注入的 ElectronEgg 应用
            ├── public/electron/main.js   # 主进程代码
            ├── public/dist/              # 前端页面
            ├── node_modules/             # 运行时依赖
            └── package.json              # 应用配置
```

### 开发流程

```
# 测试模式（开发调试）
cd ee-demo-ohos/
npm run build-frontend            # 构建前端 -> public/dist
npm run ohos-test                 # 打包 electron + 注入资源到 HAP

# 生产模式（完整打包）
npm run build-m                   # electron-builder 打包 macOS app
npm run ohos                      # 从打包产物注入资源到 HAP

# 然后在 ohos_hap/ 中构建和运行 HAP
cd ohos_hap/
build_project --module electron@default
start_app --module electron --ability EntryAbility
```

## 构建与运行

### 前置条件

- DevEco Studio 已安装
- `local.properties` 中 `arkui-x.dir` 指向 ArkUI-X SDK
- `build-profile.json5` 中签名配置有效（`/Users/gsx/.ohos/config/` 下的证书文件存在）
- 外层 ElectronEgg 资源已注入（执行过 `npm run ohos` 或 `npm run ohos-test`）

### 构建命令

```bash
# 构建整个 APP（在 ohos_hap 目录下）
# 使用 DevEco 的 build_project 工具，模块: electron@default
build_project --module electron@default

# 或构建整个 APP
build_project
```

### 构建模式

- `debug`（默认）
- `release`（启用代码混淆，见 `electron/obfuscation-rules.txt`）

### 运行

```bash
# 构建成功后启动到设备/模拟器
start_app --module electron --ability EntryAbility
```

### 静态检查

```bash
# 对修改的 .ets 文件运行 ArkTS 严格模式检查
arkts_check --files <file1.ets> <file2.ets>
```

## 关键配置

### module.json5 权限

`electron/src/main/module.json5` 声明了大量权限，主要包括：
- 网络: `INTERNET`、`GET_NETWORK_INFO`
- 文件: `READ_WRITE_DOWNLOAD_DIRECTORY`、`READ_WRITE_DOCUMENTS_DIRECTORY`、`READ_WRITE_DESKTOP_DIRECTORY`
- 窗口: `SYSTEM_FLOAT_WINDOW`、`WINDOW_TOPMOST`、`PRIVACY_WINDOW`、`LOCK_WINDOW_CURSOR`
- 媒体: `CAMERA`、`MICROPHONE`
- 其他: `ACCESS_BIOMETRIC`、`LOCATION`、`GYROSCOPE`、`ACCELEROMETER`、`PRINT`、`WEB_NATIVE_MESSAGING`

### 签名配置

`build-profile.json5` 中的 `signingConfigs` 使用 HarmonyOS 自动签名（`type: "HarmonyOS"`），证书在 `~/.ohos/config/` 下。如果签名失效，需在 DevEco Studio 中重新配置。

## ArkTS 规范

- 禁止使用 `any`、`unknown`（除非明确允许）
- 禁止 `as` 类型断言
- 禁止结构化类型，使用显式继承
- 对象字面量必须有显式类型上下文
- 禁止动态属性访问

详见 `arkts-grammar-standards` skill。

## 文件忽略

`.gitignore` 忽略的关键内容：
- `local.properties`（本地 SDK 路径）
- `**/build`、`.hvigor`（构建产物）
- `**/oh_modules`、`oh-package-lock.json5`（依赖锁文件）
- `web_engine/BuildProfile.ets`（自动生成）
- `web_engine/src/main/resources/rawfile`（前端构建产物）

## 故障排查

1. **签名失败**: 检查 `build-profile.json5` 中证书路径是否存在，或在 DevEco Studio 中重新生成签名
2. **SDK 版本不匹配**: 检查 `build-profile.json5` 中 `compatibleSdkVersion` 与本地 SDK 版本一致
3. **ArkUI-X SDK 未找到**: 检查 `local.properties` 中 `arkui-x.dir` 路径
4. **原生库缺失**: `electron/libs/arm64-v8a/` 下的 `.so` 文件需要从 web_engine 构建或预编译获取
5. **better-sqlite3 编译问题**: 参考 `common/better-sqlite3编译指南.md`
