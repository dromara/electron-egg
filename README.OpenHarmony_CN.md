# electron-egg-ohos 的 OpenHarmony 适配记录

electron-egg-ohos 是 [ElectronEgg](https://atomgit.com/dromara/electron-egg)（ee-v5）在鸿蒙 PC 上的示例工程。ElectronEgg 本身是一个基于 Electron 的桌面应用框架：根目录的 `electron/` 放主进程源码（控制器、服务、preload、配置），`frontend/` 是 Vue 3 单页应用，两边通过 IPC、HTTP、Socket 三条通道通信。

搬到鸿蒙的思路是「不重写业务，只补运行层」。业务代码继续以 Node.js 主进程的形态跑，外面套一层 HarmonyOS HAP：`ohos_hap/` 里的 `electron` 模块负责 Ability 生命周期和 ArkUI 页面，`web_engine` 模块提供窗口容器与平台适配，构建产物通过资源注入进到 HAP 的 `resfile` 目录。前端页面最终由 ArkWeb 渲染，而不是在 Windows/Mac 上那套 Chromium。

桌面端没有被改残。仓库里的 `npm run dev`、`npm run build-m`、VS Code 断点调试这些流程和上游 electron-egg 一致，鸿蒙相关的改动全部收在 `ohos_hap/` 和 `cmd/bin.js` 的 `ohos` 段里，不改动框架的加载顺序和目录约定。同一份 `electron/` 与 `frontend/` 代码，桌面端和鸿蒙端各自构建一次即可。

需要提前说清楚的边界：本示例只覆盖到「框架本体能不能在鸿蒙上跑起来」，托盘、通知、多窗口、原生模块这些增强能力没有包含进来；另外本文件里的状态判断来自仓库代码和配套博文，没有在本机真机上复跑，具体到每一项的说明里会标出来。

仓库地址：https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg

## 工程结构

```text
electron-egg-ohos/
├── electron/                    # ElectronEgg 主进程源码（跑在 HAP 里的业务层）
│   ├── main.ts                  # 入口：创建框架实例、注册生命周期与 preload、run()
│   ├── config/                  # config.default.ts / config.local.ts / config.prod.ts
│   │                            # 窗口、日志、socketServer、httpServer 等配置
│   ├── controller/
│   │   └── example.ts           # 示例控制器，方法 test 返回一行字符串
│   └── preload/
│       ├── index.ts             # 预加载钩子，启动时打一行日志
│       ├── lifecycle.ts         # ready / electron-app-ready / window-ready / before-close
│       └── bridge.ts            # 开了上下文隔离时给渲染进程导出 ipcRenderer
├── frontend/                    # Vue 3 + Vite 前端
│   ├── src/views/example/hello/ # 首页 /example
│   ├── src/views/example/scene/ # /scene，three.js 3D 场景
│   ├── src/views/example/cosmos/# /cosmos，three.js 太阳系模型
│   ├── src/utils/ipcRenderer.js # 渲染进程取 ipcRenderer 的入口
│   ├── src/api/index.js         # IPC 频道表，示例里只有 controller/example/test
│   └── vite.config.js           # 开发端口 8080，产物输出到 dist/
├── cmd/
│   ├── bin.js                   # ee-bin 全部构建配置，鸿蒙注入规则在 ohos 段
│   └── builder-*.json           # electron-builder 平台配置（鸿蒙链路用 mac-arm64 那份）
├── build/                       # 图标、extraResources、安装脚本
├── public/                      # 构建产物落点：dist/ 前端、electron/ 主进程
├── data/                        # 示例数据目录
└── ohos_hap/                    # 鸿蒙 HAP 工程（DevEco Studio 打开这一层）
    ├── AppScope/
    │   ├── app.json5            # bundleName、版本、multiInstance 多实例配置
    │   └── resources/base/media/# app_icon.png / startIcon.png，HAP 图标来源
    ├── build-profile.json5      # SDK 版本、运行形态、签名、参与构建的模块
    ├── local.properties         # 本机 ArkUI-X SDK 路径，不入库
    ├── electron/                # entry HAP：只做 Ability 壳和 ArkUI 页面
    │   ├── src/main/module.json5# 权限、Ability、ExtensionAbility、进程、skills
    │   ├── src/main/ets/
    │   │   ├── Application/     # AbilityStage，继承 web_engine 的 WebAbilityStage
    │   │   ├── entryability/    # Entry/Browser/Stateless/StatusBar 等 Ability
    │   │   ├── extensionAbility/# BrowserEmbeddedAbility（embeddedUI）
    │   │   ├── pages/           # Index.ets 等 ArkUI 页面，Index 里渲染 WebWindow
    │   │   └── process/         # CustomChildProcess，继承 WebChildProcess
    │   ├── libs/arm64-v8a/      # 引擎原生库（未入库，需自行补齐，见下文）
    │   └── oh-package.json5     # 依赖 file:../web_engine
    └── web_engine/              # HAR：窗口容器与鸿蒙平台适配层
        ├── Index.ets            # 对外导出 WebAbility / WebWindow 等
        ├── childProcess.ets     # 对外导出 WebChildProcess
        └── src/main/
            ├── ets/ability/     # WebAbility / WebBaseAbility / WebEmbeddedAbility
            ├── ets/components/  # WebWindow / WebSubWindow / WebWindowNode 等
            ├── ets/adapter/     # 对话框、文件、通知、打印等平台能力适配
            ├── ets/jsbindings/  # 把 adapter 绑到 JS 侧
            └── resources/resfile/
                                 # Electron 运行时 + 注入进来的应用资源
```

有两个 `electron` 目录，作用完全不同，排查问题时别混：根目录的 `electron/` 是 Node.js 主进程源码，`ohos_hap/electron/` 是鸿蒙 entry HAP。

`ohos_hap/web_engine/src/main/resources/resfile/` 里是两类东西的混合：

- 引擎运行时：`electron`、`icudtl.dat`、`*.pak`、`locales/`、`v8_context_snapshot.bin`、`vulkan/`，随仓库提供；
- 注入的应用资源：`resources/app/`（来自 `public/`）和 `resources/extraResources/`，由 `ee-bin ohos` 生成。

## 环境要求

| 项目 | 要求 | 备注 |
| --- | --- | --- |
| Node.js | >= 20.19.0 | `ee-core@5.0.2`、`ee-bin@5.0.0` 的 `engines` 约束；开发机用的是 v22 |
| 包管理器 | npm 或 pnpm | `.npmrc` 已配 npmmirror 源和 hoisted 链接，换包管理器前先看这份配置 |
| Electron | ^37.10.3 | 桌面端调试用；鸿蒙端不需要本机 Electron |
| DevEco Studio | 能跑 HarmonyOS 6.1.0(23) 的版本 | 需另装 ArkUI-X SDK |
| HarmonyOS SDK | 6.1.0(23) | `build-profile.json5` 里 `compatibleSdkVersion` 与 `targetSdkVersion` 都是它，`compatibleSdkVersionStage` 为 `release` |
| ArkUI-X SDK | 与上面同版本 | `ohos_hap/local.properties` 的 `arkui-x.dir` 指向本机路径，该文件不入库 |
| 目标设备 | 鸿蒙 PC（arm64），`2in1` 或 `tablet` | `module.json5` 的 `deviceTypes` 只声明了这两种 |
| 引擎原生库 | `libelectron.so` / `libadapter.so` / `libffmpeg.so` / `libc++_shared.so` | `ohos_hap/electron/libs` 被 gitignore，克隆后需要自行补齐 |
| 签名 | DevEco Studio 自动生成调试签名 | `build-profile.json5` 里的证书路径与口令是机器私有配置，不要提交，也不要贴进文档 |
| 构建工具 | hvigor（DevEco 自带） | 也可直接用 DevEco Studio 的 `build_project` |

> 官方博文提到，鸿蒙 Electron 的运行时是 arm64 的，非 Apple 芯片的 Mac 起不了 arm 架构模拟器，需要真机调试。

## 编译与运行

### 1. 拉代码、装依赖

```bash
git clone https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg.git
cd ohos_electron-egg

# 根目录（主进程 + 构建工具）
npm install

# 前端依赖是独立的一份
cd frontend && npm install && cd ..
```

### 2. 补齐引擎原生库

`ohos_hap/electron/libs` 在 `.gitignore` 里，克隆下来是空的，HAP 缺了它编不过。按官方流程从 electron-egg 框架仓库取：

```bash
# 框架仓库，取 ohos_hap/electron/libs
git clone https://atomgit.com/dromara/electron-egg.git
cd electron-egg && git checkout -b demo-ohos remotes/origin/ohos/demo-37.2.2 && cd ..

# 用 libs 目录覆盖过来
cp -r electron-egg/ohos_hap/electron/libs/. ohos_electron-egg/ohos_hap/electron/libs/
```

目录里应该有 `libadapter.so`、`libc++_shared.so`、`libelectron.so`、`libffmpeg.so` 四个文件。这几个文件加起来接近 200MB，替换时整组换，别单独换某一个，容易踩 ABI 不一致。

### 3.（可选）先在桌面端跑一遍

鸿蒙链路出问题时，先在桌面上确认业务代码本身是好的，能省不少时间：

```bash
npm run dev            # 前端 + 主进程一起起，改代码热更新
npm run dev-frontend   # 只起前端
npm run dev-electron   # 只起主进程（需要前端已在 8080）
```

要更细的日志就开 DEBUG 命名空间：

```bash
npm run debug-electron                    # 全部 ee-* 命名空间
DEBUG='ee-core:config:*' npm run dev-electron   # 只看配置加载
```

### 4. 构建产物并注入 HAP

两条路径，按需要选。

日常调试，不打包：

```bash
npm run build-frontend   # 前端有改动时跑；产物进 public/dist
npm run ohos-test        # 内含 build-electron，把 public/ 注入 resfile
```

注意 `npm run ohos-test` **不会**自动跑 `build-frontend`。改了 Vue 代码却只执行了后一条命令，HAP 里看到的还是旧页面。

生产形态，从打包产物里取：

```bash
npm run build-m          # electron-builder 打 macOS ARM64 包到 out/
npm run ohos             # 从 out/mac-arm64/electron-egg-ohos.app/Contents/Resources 提取
```

`npm run ohos` 只做提取，所以运行前先确认 `out/mac-arm64/` 下是最新构建。另外 `cmd/builder-mac-arm64.json` 里 `asar` 必须是 `false`，否则提取出来的是 `app.asar`，注入进去跑不起来。

注入规则写在 `cmd/bin.js` 的 `ohos` 段，用 electron-builder 的 FileSet 写法（`from` / `to` / `filter`）：

| 分组 | 来源 | 去向 |
| --- | --- | --- |
| `resources` | `out/mac-arm64/electron-egg-ohos.app/Contents/Resources/app` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app` |
| `resources` | `.../Contents/Resources/extraResources` | `ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources` |
| `test` | `public/` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public` |

### 5. 跑起来

推荐用 DevEco Studio：`File -> Open` 打开 `ohos_hap` 目录，首次运行先在 `File -> Project Structure -> Signing Configs` 里配好签名，连上鸿蒙设备（开发者模式 + USB 调试打开），点运行即可，编译、签名、安装、启动一条龙。

想走命令行：

```bash
export DEVECO_SDK_HOME=/Applications/DevEco-Studio.app/Contents/sdk
export JAVA_HOME=/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"

node /Applications/DevEco-Studio.app/Contents/tools/hvigor/hvigor/bin/hvigor.js \
  --mode module -p product=default -p buildMode=debug -p module=electron@default \
  assembleHap --no-daemon

hdc install ohos_hap/electron/build/default/outputs/default/electron-default-signed.hap
hdc shell "aa start -a EntryAbility -b com.electronegg.ohos"
```

排障阶段用 `buildMode=debug`，跳过 release 的 ArkTS 混淆，少一层故障面。

### 6. 看日志

控制台里搜 `[ohos]` 能看到业务代码 `console` 打出来的内容。真机上的文件日志在沙箱里：

```text
/storage/Users/currentUser/appdata/el2/base/com.electronegg.ohos/files/ElectronEgg/data
/storage/Users/currentUser/appdata/el2/base/com.electronegg.ohos/files/ElectronEgg/logs
```

业务代码的日志在 `ee.*.log`，框架内部的在 `ee-core.*.log`，两边别找错地方。

### 改完代码设备上还是旧页面

八成是构建链路没走全。按改动位置对照：

| 改了哪里 | 至少跑这些 |
| --- | --- |
| `frontend/` | `npm run build-frontend` → `npm run ohos-test` |
| `electron/` | `npm run ohos-test` |
| `ohos_hap/electron/` | 重新 `build_project` / DevEco Studio 运行 |
| `ohos_hap/web_engine/` | 同时检查 HAR 和依赖它的 `electron` 模块 |
| `cmd/bin.js` 注入规则 | 检查注入目标目录内容是否更新 |

最快的定位方法是比一比两处 `main.js` 的修改时间：仓库根目录的 `public/electron/main.js`，和 HAP 里的 `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public/electron/main.js`。两者不一致，就是注入没跑。

## 具体改了哪些地方

这一节列的是相对上游 electron-egg 的改动，每条说清为什么这么改。

### 1. 新增 `ohos_hap/` 整个 HAP 工程

上游没有这一层。新增它是为了让同一套业务代码能装进鸿蒙应用模型：`electron` 模块是 entry HAP，只保留 Ability 生命周期和 ArkUI 页面；`web_engine` 是 HAR，承担窗口容器、平台适配、JS 绑定。

拆成两层是为了让 entry 保持为薄壳——`EntryAbility` 里每个生命周期方法都只调用 `super`，真正的实现都在 `WebAbility` 基类里。以后升级引擎只要换 `web_engine`，业务侧入口不用跟着改。

```ts
// ohos_hap/electron/src/main/ets/entryability/EntryAbility.ets
export default class EntryAbility extends WebAbility {
  onWindowStageCreate(windowStage: window.WindowStage) {
    super.onWindowStageCreate(windowStage);
  }
}
```

### 2. 入口页面只做容器

`ohos_hap/electron/src/main/ets/pages/Index.ets` 里没有重写一遍界面，只渲染引擎导出的 `WebWindow`，外面用 `@Entry(storage)` 绑定 `LocalStorage` 接收窗口样式更新，顺带拦一下 ESC 键：

```ts
Row() {
  WebWindow()
}
.onKeyEvent((event?: KeyEvent) => {
  if (event && event.type == KeyType.Down && event.keyCode == KeyCode.KEYCODE_ESCAPE) {
    event.stopPropagation();
  }
})
.width('100%')
.height('100%')
```

如果在这里用 ArkUI 重新实现页面，前端那套 Vue 代码就白写了，后续每加一个功能都要改两遍。

### 3. `cmd/bin.js` 增加 `ohos` 段

鸿蒙打包用的资源目录（`resfile`）和构建产物目录（`public/`、`out/`）是两份拷贝。新增这段配置是给 `ee-bin` 一个声明式的抽取规则，复用 electron-builder 的 FileSet 语义，避免每次手工复制、也避免漏复制。

```javascript
ohos: {
  resources: [
    { from: './out/mac-arm64/electron-egg-ohos.app/Contents/Resources/app',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app',
      filter: ["**/*", "!README.md", "!README.zh-CN.md"] },
    { from: './out/mac-arm64/electron-egg-ohos.app/Contents/Resources/extraResources',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources',
      filter: ["**/*"] },
  ],
  test: [
    { from: './public',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app/public',
      filter: ["**/*", "!README.md", "!README.zh-CN.md"] },
  ],
}
```

### 4. `package.json` 增加两个脚本

```json
"ohos": "ee-bin ohos --cmds=resources",
"ohos-test": "npm run build-electron && ee-bin ohos --cmds=test"
```

`--cmds` 接 `ohos` 段下的 key。`ohos-test` 把构建和注入串起来，是因为调试时这两步几乎总是一起做，漏掉任何一步的表现都是「改了没生效」。

### 5. `AppScope/app.json5` 定义包名与多实例

```json5
"bundleName": "com.electronegg.ohos",
"multiAppMode": { "multiAppModeType": "multiInstance", "maxCount": 2 }
```

包名换成鸿蒙侧的标识，和桌面端的 `appId` 分开。开多实例是因为 HAP 工程本身允许同应用起多个实例，但示例没有多实例业务，这条只到配置层面。

### 6. `module.json5` 声明权限、Ability 与进程

- `deviceTypes` 只留 `2in1` 和 `tablet`，对应鸿蒙 PC 和平板；
- 权限按需声明：网络、窗口置顶、打印、剪贴板、下载/文档/桌面目录读写、相机麦克风定位等，带 `reason` 的几项在 `resources/base/element/string.json` 里都有对应文案；
- `EntryAbility` 用 `specified` 启动模式，`BrowserAbility` 和 `StatelessAbility` 通过 `process: ':browser'` 跑在独立进程里。

拆进程是为了让子窗口和主窗口隔离，代价是不能假设它们共享同一份内存单例。

### 7. 子进程容器接入引擎

`ohos_hap/electron/src/main/ets/process/CustomChildProcess.ets` 继承 `web_engine/childProcess.ets` 导出的 `WebChildProcess`，后者在 `onStart` 里通过 NAPI 把渲染进程拉起来。这是鸿蒙侧的渲染进程模型，和 Node 侧 `child_process.fork` 不是一回事。

```ts
import { WebChildProcess } from 'web_engine/childProcess';

export default class CustomChildProcess extends WebChildProcess {
  onStart(): void {
    super.onStart();
  }
}
```

### 8. 图标资源分成两份

桌面端图标在 `build/icons/`（含 `icon.png`、`icon.ico`、`icon.icns`），鸿蒙端要单独放到 `ohos_hap/AppScope/resources/base/media/`：

```bash
cp build/icons/icon.png ohos_hap/AppScope/resources/base/media/app_icon.png
cp build/icons/icon.png ohos_hap/AppScope/resources/base/media/startIcon.png
```

`app_icon.png` 被 `AppScope/app.json5` 的 `icon` 字段和各 Ability 的 `icon` 引用，`startIcon.png` 被 `EntryAbility` 的 `startWindowIcon` 引用。两个文件不要塞进 `resfile/`——那个目录是应用资源注入区，放进去会被下次注入覆盖。

### 9. 保留但未启用的部分

`package.json` 里 `dev-go`、`build-go-w/m/l`、`dev-python`、`build-python` 这些脚本还在，`cmd/bin.js` 也留着对应的构建段，但仓库里没有 `go/` 和 `python/` 目录，本示例不含这两条外部子进程链路。`electron-updater` 在依赖里，`cmd/builder-mac-arm64.json` 的 `publish.url` 是空的，更新源没配。

## 功能能用到什么程度

下面按 T0 / T1 / T2 三档列。状态只有 `能用` / `未适配` 两种；仓库代码或配套博文能支撑的写 `能用`，其余按原因归到 `未适配`。**本文件作者没有在真机上复跑过这些流程，凡是没有真机证据的都在说明里写明「未在真机验证」。**

### T0 基础能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| HAP 工程可编译 | 能用 | `ohos_hap/` 是完整的 stage 模型工程，`build-profile.json5` 声明了 `electron` 与 `web_engine` 两个模块和 `default` 产品；配套博文记录过 `build_project --module electron@default` 通过，本机未复跑 |
| 引擎运行时齐全 | 能用 | `resfile/` 下的 `electron`、`icudtl.dat`、`*.pak`、`locales/`、`v8_context_snapshot.bin`、`vulkan/` 已入库；`ohos_hap/electron/libs/arm64-v8a` 被 gitignore，需从框架仓库补齐 |
| HAP 能装到设备 | 能用 | 配套博文记录了 DevEco Studio 编译签名后安装到鸿蒙设备的完整流程与截图；未在真机验证 |
| EntryAbility 能启动 | 能用 | `mainElement` 为 `EntryAbility`，`srcEntry` 指向 `Application/AbilityStage.ets`，Ability `exported` 为 true；未在真机验证 |
| 首页不白屏 | 能用 | 前端产物已注入 `resfile/resources/app/public/dist`，`windowsOption.show` 为 `true`，`windowReady` 里也保留了 `ready-to-show` 延迟显示的分支。ArkWeb 上的实际首屏表现未在真机验证 |

小结：从构建到安装的四步链路，仓库里每一步都有对应的配置或脚本，缺的只是本机真机复跑。最大的外部依赖是那四个原生库，没补齐的话连编译都过不去。

### T1 主要能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| Vue 页面与路由 | 能用 | `/example`、`/scene`、`/cosmos` 三条路由已在 `frontend/src/router/routerMap.js` 注册，构建产物随 HAP 注入；未在真机验证 |
| three.js 3D 页面 | 能用 | `scene` 与 `cosmos` 走 WebGL 渲染，产物已注入。ArkWeb 下的 WebGL 支持与帧率未在真机验证 |
| IPC 通道 | 能用 | 前端经 `frontend/src/utils/ipcRenderer.js` 取 `ipcRenderer`，频道 `controller/example/test` 对应 `electron/controller/example.ts` 的 `test` 方法；配置里 `contextIsolation: false` + `nodeIntegration: true` |
| HTTP 服务 | 能用 | `config.default.ts` 中 `httpServer.enable = true`，监听 `127.0.0.1:7071`；端口在鸿蒙沙箱内的连通性未在真机验证 |
| Socket 服务 | 能用 | 同一份配置里 `socketServer.enable = true`，端口 7070 |
| 主进程日志落盘 | 能用 | pino 日志按天切分，写入应用沙箱的 `logs/` 目录；未在真机验证 |
| 窗口尺寸与居中 | 能用 | `electron/preload/lifecycle.ts` 的 `windowReady` 按主屏工作区 70% × 80% 计算尺寸并居中；`electronAppReady` 里处理二次启动时还原主窗口 |
| 多进程渲染容器 | 能用 | `web_engine/childProcess.ets` 导出 `WebChildProcess`，入口侧 `CustomChildProcess` 继承它；`BrowserAbility`、`StatelessAbility` 声明了独立进程 `:browser` |
| 代码混淆加密 | 能用 | `cmd/bin.js` 的 `encrypt` 段给主进程配了 `type: 'confusion'`，`specificFiles` 单列了 `main.js` 和 `preload/bridge.js`；前端保持 `type: 'none'` |

小结：框架的三条通信通道、窗口生命周期、日志这几样在示例里都保留了，主进程侧的路由和配置加载不依赖 Electron 特有 API 的部分能直接复用。真正取决于鸿蒙侧的，是 ArkWeb 给出的 WebGL/IPC 能力和沙箱内的端口与目录权限，这几项都需要在目标设备上单独确认。

### T2 增强能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| HAP 应用图标与启动图标 | 能用 | `AppScope/resources/base/media/app_icon.png` 与 `startIcon.png` 已在仓库中，分别被 `AppScope/app.json5` 和 `EntryAbility` 的 `startWindowIcon` 引用 |
| Release 构建混淆 | 能用 | `ohos_hap/electron/build-profile.json5` 与 `web_engine/build-profile.json5` 的 release 变体都开了 ArkTS 混淆并指定了规则文件 |
| 多实例 | 未适配 | `AppScope/app.json5` 开了 `multiInstance`、上限 2，但示例没有多实例业务代码，尚未验证 |
| 多窗口 | 未适配 | `module.json5` 声明了多个 Ability，`main_pages.json` 里也有 `SubWindow`、`EmbeddedWindow` 等页面，但示例前端没有多窗口入口，尚未验证 |
| 系统托盘 | 未适配 | 这是按平台特点主动取舍——示例的 `electron/preload/index.ts` 只打了一行日志，没有引入托盘服务，桌面端也不在示例范围内 |
| 系统通知 | 未适配 | 同上，主动取舍；`module.json5` 里有相关权限声明，但没有对应的控制器方法 |
| 文件选择 / 打开目录等系统对话框 | 未适配 | 主动取舍。示例控制器只有 `example.test` 一个方法，没有把桌面对话框能力收进来 |
| 自动更新 | 未适配 | 主动取舍。`electron-updater` 在依赖里，但 `cmd/builder-mac-arm64.json` 的 `publish.url` 为空，没有配置更新源 |
| better-sqlite3 等原生模块 | 未适配 | 主动取舍。本示例不依赖 `better-sqlite3`，`ohos_hap/` 下也没有原生模块编译目录；桌面端的 `npm run re-sqlite` 解决不了鸿蒙侧的问题 |
| Go / Python 后端子进程 | 未适配 | 主动取舍。`package.json` 保留了相关脚本，但仓库里没有 `go/`、`python/` 目录。这条链路在鸿蒙上还要额外处理二进制签名（HNP）和沙箱可写目录，工作量不在本示例范围内 |
| 桌面端单实例锁 | 未适配 | `config.default.ts` 里 `singleLock: true` 是桌面端的行为，鸿蒙侧应用模型是多实例，两者语义不同，尚未验证 |

小结：T2 这一档基本是空白，而且大部分是主动取舍——示例的定位是展示「框架本体能跑」，不是覆盖桌面端的全部能力。要在鸿蒙上交付真实产品，托盘、通知、多窗口、多实例、原生模块、外部子进程这些都得按业务实际用到的部分逐项在目标设备上重新验收，桌面端能跑不等于 HAP 自动具备同样的权限和能力。

## 参考与延伸

- 开源鸿蒙 PC 社区：[https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
- PC 社区项目平台（AtomGit）：[https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)
- 本示例工程（AtomGit PC 社区）：[https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg](https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg)
- ElectronEgg 框架仓库（AtomGit）：[https://atomgit.com/dromara/electron-egg](https://atomgit.com/dromara/electron-egg)
- 配套博文《鸿蒙PC软件开发框架：ElectronEgg》：框架介绍、环境搭建与 HAP 运行流程
- 配套博文《鸿蒙PC迁移：ElectronEgg 框架功能适配鸿蒙PC》：工程分层、资源注入、控制器与通信通道适配
- 配套博文《使用混淆加密代码，让你的项目更加安全》：`cmd/bin.js` 加密配置与参数取舍
- 配套博文《如何让 electron 拉起 go 服务并运行在鸿蒙 PC 上》：HNP 签名与沙箱可写目录适配
- DevEco Studio 下载：[https://developer.huawei.com/consumer/cn/download/deveco-studio](https://developer.huawei.com/consumer/cn/download/deveco-studio)
- OpenHarmony 官方文档：[https://docs.openharmony.cn/](https://docs.openharmony.cn/)
- 华为开发者文档：[https://developer.huawei.com/consumer/cn/doc/](https://developer.huawei.com/consumer/cn/doc/)
