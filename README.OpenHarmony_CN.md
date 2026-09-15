# ee-demo-ohos 的 OpenHarmony 适配记录

`ee-demo-ohos` 是 ElectronEgg（ee-v5）在鸿蒙 PC 上的适配 demo 工程，包名 `ee`，版本 `5.0.0`，托管在 AtomGit 的开源鸿蒙 PC 社区：[https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg](https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg)。框架本体来自 [dromara/electron-egg](https://atomgit.com/dromara/electron-egg) 的 `ohos/demo-37.2.2` 分支，本工程就是这条分支上的 demo 形态，也是社区第 01、06、07 三篇配套博文的工程基础。

ElectronEgg 本身是一个基于 Electron 的桌面应用框架：根目录的 `electron/` 放主进程源码（controller、service、preload、config），`frontend/` 是 Vue 3 单页应用，两边通过 IPC、HTTP、Socket 三条通道通信。

搬到鸿蒙的思路是「不重写业务，只补运行层」。业务代码继续以 Node.js 主进程的形态跑，外面套一层 HarmonyOS HAP：`ohos_hap/electron` 是 entry HAP，负责 Ability 生命周期和 ArkUI 页面；`ohos_hap/web_engine` 是 HAR，提供窗口容器、平台适配和 JS 绑定；构建产物通过 `ee-bin ohos` 注入 HAP 的 `resfile` 目录，前端页面最终由 ArkWeb 渲染。

和框架自带的鸿蒙示例相比，本 demo 多铺了两块：一是把 `go/` 后端子进程接了回来（在鸿蒙上要过 HNP 签名和沙箱可写目录两道关），二是把示例页面铺开到 `framework` / `os` / `effect` / `cross` 四组，用来覆盖控制器、服务、窗口、通知、子进程这些能力。

桌面端没有被改残。仓库里的 `npm run dev`、`npm run build-m`、VS Code 断点调试这些流程和上游 electron-egg 一致，鸿蒙相关的改动集中在 `ohos_hap/`、`cmd/bin.js` 的 `ohos` 段、`electron/service/cross.ts` 的鸿蒙分支和 `script/ohos-hnp.js`，不改动框架的加载顺序和目录约定。同一份 `electron/` 与 `frontend/` 代码，桌面端和鸿蒙端各自构建一次即可。

下文先讲工程结构与构建链路，再按 T0 / T1 / T2 三档列出每项能力在这套 HAP 链路里落地到什么程度。每一项都在说明列写出了证据来源——对应的仓库文件路径，或第 01、03、04、06、07 篇配套博文里的真机记录。

## 工程结构

```text
ee-demo-ohos/
├── electron/                     # ElectronEgg 主进程源码（跑在 HAP 里的业务层）
│   ├── main.ts                   # 入口：创建框架实例、注册生命周期与 preload、run()
│   ├── config/                   # config.default.ts / config.local.ts / config.prod.ts
│   ├── controller/               # example / framework / os / effect / cross
│   ├── service/                  # 业务服务：cross、debug、example、framework、
│   │                             #   database/(basedb, sqlitedb)、os/(window, tray,
│   │                             #   auto_updater, security)
│   ├── jobs/example/             # 后台任务，child_process.fork 逐文件加载
│   └── preload/                  # index.ts / lifecycle.ts / bridge.ts
├── frontend/                     # Vue 3 + Vite 前端（framework / os / effect / cross 四组页面）
├── go/                           # Go 后端子进程（ee-go v1.3.2，监听 7073）
├── python/                       # Python 后端子进程（本示例未接）
├── script/ohos-hnp.js            # 把交叉编译后的 goapp 打成 .hnp 的脚本
├── cmd/
│   ├── bin.js                    # ee-bin 全部构建配置，鸿蒙注入规则在 ohos 段
│   └── builder-*.json            # electron-builder 平台配置（鸿蒙链路用 mac-arm64 那份）
├── build/                        # 图标、extraResources、extraResources-ohos（交叉编译产物）
├── public/                       # 构建产物落点：dist/ 前端、electron/ 主进程
├── data/                         # 运行期数据目录
└── ohos_hap/                     # 鸿蒙 HAP 工程（DevEco Studio 打开这一层）
    ├── AppScope/app.json5        # bundleName、版本、multiInstance 多实例配置
    ├── AppScope/resources/       # app_icon.png / startIcon.png，HAP 图标来源
    ├── build-profile.json5       # SDK 版本、产品、签名、参与构建的模块
    ├── local.properties          # 本地 ArkUI-X SDK 路径，不入库
    ├── hnp/arm64-v8a/            # hnpcli 产出的 .hnp，不入库
    ├── common/better-sqlite3/    # better-sqlite3 的 OHOS 编译产物
    ├── docs/                     # HAP 工程的目录结构说明与项目导读
    ├── electron/                 # entry HAP：Ability 壳 + ArkUI 页面 + 引擎原生库
    │   ├── src/main/module.json5 # 权限、Ability、ExtensionAbility、进程、hnpPackages
    │   ├── src/main/ets/
    │   │   ├── Application/      # AbilityStage，继承 web_engine 的 WebAbilityStage
    │   │   ├── entryability/     # Entry / Browser / Stateless / StatusBar / TaskManager
    │   │   ├── extensionAbility/# BrowserEmbeddedAbility（embeddedUI）
    │   │   ├── pages/            # Index.ets 等 ArkUI 页面，Index 里渲染 WebWindow
    │   │   └── process/          # CustomChildProcess，继承 WebChildProcess
    │   ├── libs/arm64-v8a/       # 引擎原生库（已入库）
    │   └── oh-package.json5      # 依赖 file:../web_engine
    └── web_engine/               # HAR：窗口容器与鸿蒙平台适配层
        ├── Index.ets             # 对外导出 WebAbility / WebWindow 等
        ├── childProcess.ets      # 对外导出 WebChildProcess
        └── src/main/
            ├── ets/ability/      # WebAbility / WebBaseAbility / WebEmbeddedAbility
            ├── ets/components/   # WebWindow / WebSubWindow / WebWindowNode 等
            ├── ets/adapter/      # 对话框、文件、通知、打印等平台能力适配
            ├── ets/jsbindings/   # 把 adapter 绑到 JS 侧
            └── resources/resfile/# Electron 运行时 + 注入进来的应用资源
```

有两个 `electron` 目录，作用完全不同，排查问题时别混：根目录的 `electron/` 是 Node.js 主进程源码，`ohos_hap/electron/` 是鸿蒙 entry HAP。

`ohos_hap/web_engine/src/main/resources/resfile/` 里是两类东西的混合：

- 引擎运行时：`electron`（启动器）、`icudtl.dat`、`*.pak`、`locales/`、`v8_context_snapshot.bin`、`vulkan/`，随仓库提供；
- 注入的应用资源：`resources/app/`（来自 `public/`）和 `resources/extraResources/`（来自 `build/extraResources-ohos/`），由 `ee-bin ohos` 生成。

小结：这一节的重点是把「谁是谁」分清。构建链路上真正会被忽略的目录是 `ohos_hap/hnp/`、`build/extraResources-ohos/`、`build/hnp/` 和 `ohos_hap/local.properties`，前三个是产物、后一个是本地路径；`ohos_hap/electron/libs/` 和 `resfile/` 下的引擎运行时是入库的，克隆下来即可用。

## 环境要求

| 项目 | 要求 | 备注 |
| --- | --- | --- |
| Node.js | >= 20.19.0 | `ee-core@5.0.3`、`ee-bin@5.0.0` 的 `engines` 约束一致；两者都是 `>=20.19.0` |
| 包管理器 | npm 或 pnpm | `.npmrc` 已配 npmmirror 源和 hoisted 链接，换包管理器前先看这份配置 |
| Electron | `^37.10.3` | `devDependencies` 里的版本；只用于桌面端开发调试，鸿蒙端不需要本地安装 Electron |
| DevEco Studio | 能跑 HarmonyOS 6.1.0(23) 的版本 | 需另装 ArkUI-X SDK |
| HarmonyOS SDK | 6.1.0(23) | `build-profile.json5` 的 `compatibleSdkVersion` 与 `targetSdkVersion` 都是它，`compatibleSdkVersionStage` 为 `release` |
| ArkUI-X SDK | 与上面同版本 | `ohos_hap/local.properties` 的 `arkui-x.dir` 指向本地的 SDK 路径，该文件不入库 |
| 目标设备 | 鸿蒙 PC（arm64），`2in1` 或 `tablet` | `module.json5` 的 `deviceTypes` 只声明了这两种 |
| 引擎原生库 | `libelectron.so` / `libadapter.so` / `libffmpeg.so` / `libc++_shared.so` / `better_sqlite3.node` | 位于 `ohos_hap/electron/libs/arm64-v8a/`，**本仓库已入库**（`ohos_hap/.gitignore` 里 `/electron/libs` 那行是注释状态）；若你 fork 后重新放开忽略规则，则需从框架仓库 `ohos/demo-37.2.2` 分支的 `ohos_hap/electron/libs` 补齐 |
| Go 工具链 | Go 1.20 及以上 | `go/go.mod` 声明 `go 1.20`，依赖 `github.com/wallace5303/ee-go v1.3.2`；交叉编译用 `CGO_ENABLED=0`，不需要鸿蒙 NDK |
| HNP 打包工具 | `hnpcli` | 来自 DevEco SDK 的 `toolchains` 目录，`script/ohos-hnp.js` 里写死了一个 macOS 默认路径，可用环境变量 `HNPCLI` 覆盖 |
| 签名 | DevEco Studio 自动生成调试签名 | `ohos_hap/build-profile.json5` 里当前指向某台机器的证书路径与口令，换机器必须重新配；这些是机器私有信息，不要提交也不要贴进文档 |
| 构建工具 | hvigor（DevEco 自带） | 也可直接用 DevEco Studio 的 `build_project` |

> 官方博文提到，鸿蒙 Electron 的运行时是 arm64 的，非 Apple 芯片的 Mac 起不了 arm 架构模拟器，需要真机调试。

小结：环境上真正的硬门槛有三个——能跑 6.1.0(23) 的 DevEco Studio 与 ArkUI-X SDK、一台 arm64 的鸿蒙设备、以及 Go 工具链（只有要跑 `cross` 拉起 goapp 时才需要）。引擎原生库在这个仓库里是齐的，克隆下来不用额外补。

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

### 2. 先在桌面端跑一遍

鸿蒙链路出问题时，先在桌面上确认业务代码本身是好的，能省不少时间：

```bash
npm run dev            # 前端 + 主进程一起起，改代码热更新
npm run dev-frontend   # 只起前端，端口 8080
npm run dev-electron   # 只起主进程（需要前端已在 8080）
```

要更细的日志就开 DEBUG 命名空间：

```bash
npm run debug-electron                          # 全部 ee-* 命名空间
DEBUG='ee-core:config:*' npm run dev-electron   # 只看配置加载
```

### 3. 构建产物并注入 HAP

有两条路径，按需要选。

日常调试，不打包：

```bash
npm run build-frontend   # 前端有改动时跑；产物进 public/dist
npm run ohos-test        # 内含 build-electron，把 public/ 注入 resfile
```

注意 `npm run ohos-test` **不会**自动跑 `build-frontend`。改了 Vue 代码却只执行了后一条命令，HAP 里看到的还是旧页面。

生产形态，从打包产物里取：

```bash
npm run build-m          # electron-builder 打 macOS ARM64 包到 out/
npm run ohos             # 从 out/mac-arm64/ee.app/Contents/Resources 提取
```

`npm run ohos` 只做提取，所以运行前先确认 `out/mac-arm64/` 下是最新构建。另外 `cmd/builder-mac-arm64.json` 里 `asar` 必须保持 `false`（当前仓库即是），否则提取出来的是 `app.asar`，注入进去跑不起来。

注入规则写在 `cmd/bin.js` 的 `ohos` 段，用 electron-builder 的 FileSet 写法（`from` / `to` / `filter`）：

| 分组 | 来源 | 去向 |
| --- | --- | --- |
| `resources` | `out/mac-arm64/ee.app/Contents/Resources/app` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app` |
| `resources` | `build/extraResources-ohos` | `ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources` |
| `test` | `public/` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public` |
| `test` | `ohos_hap/common/better-sqlite3` | `ohos_hap/web_engine/src/main/resources/resfile/resources/app/node_modules/better-sqlite3` |
| `test` | `build/extraResources-ohos` | `ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources` |

小结：`resources` 组和 `test` 组的区别只在于来源——前者从 electron-builder 的打包产物里取，后者直接拿仓库里的 `public/` 和本地编译好的 `better-sqlite3`，省掉一次完整打包。`extraResources` 两条都指向 `build/extraResources-ohos` 而不是 mac `.app` 里的 `extraResources`，原因是 mac 包里的 `goapp` 是 Mach-O 格式，在 OHOS 上 spawn 会报 `ENOEXEC`，必须换成 OHOS 交叉编译的产物。

### 4. 构建 Go 子进程与 HNP 包

只跑 Go 后端相关功能时才需要这一步。

```bash
npm run build-go-ohos       # cross-env GOOS=linux GOARCH=arm64 CGO_ENABLED=0 交叉编译
npm run build-hnp-ohos      # 调 script/ohos-hnp.js，产出 ohos_hap/hnp/arm64-v8a/goapp.hnp
npm run build-go-hnp-ohos   # 上面两条的合并

npm run ohos-go             # build-go-hnp-ohos + ohos（资源注入）
npm run ohos-test-go        # build-electron + build-go-hnp-ohos + ohos --cmds=test
```

`script/ohos-hnp.js` 做三件事：组装 staging 目录（`hnp.json` + `bin/goapp/goapp`）、调 `hnpcli pack` 出 `.hnp`、把结果放到 `ohos_hap/hnp/arm64-v8a/`。脚本里的 `HNP_VERSION` 常量要和 `electron/service/cross.ts` 里拼出来的运行期路径保持一致，改一处就得改另一处。

小结：这一步存在的唯一理由是签名。鸿蒙 PC 的内核 XPM 会拦截未签名二进制的 `exec`，`resfile` 里直接 spawn 出来的 Go 二进制会拿到 `EACCES`；打成 HNP 后由系统在安装时释放并签名，进程才起得来。`.hnp` 是构建产物，不入库，所以没跑过这一步的克隆副本 `ohos_hap/hnp/` 是空的——`module.json5` 里虽然声明了 `hnpPackages`，缺包时 HAP 编不过。

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
hdc shell "aa start -a EntryAbility -b com.electronegg.demo"
```

排障阶段用 `buildMode=debug`，跳过 release 的 ArkTS 混淆，少一层故障面。

小结：DevEco Studio 那条路是配套博文实际走通的路径（含签名配置页与运行结果的截图记录），命令行那条是把同样的动作拆开，方便在 CI 或没有 IDE 的环境里复现。`-b` 后面跟的是 `AppScope/app.json5` 里的 `bundleName`，当前仓库的值是 `com.electronegg.demo`。

### 6. 看日志

控制台里搜 `[ohos]` 能看到业务代码 `console` 打出来的内容。真机上的文件日志在沙箱里，博文中出现过两种写法：

```text
/data/app/el2/100/base/com.electronegg.demo/files/ee/logs/
/storage/Users/currentUser/appdata/el2/base/com.electronegg.demo/files/<应用名>/logs
```

业务代码的日志在 `ee.*.log`，框架内部的在 `ee-core.*.log`，两边别找错地方。Go 子进程的 stdout / stderr 会被主进程转发到业务日志里，带 `[go]` 前缀。

小结：上面两条路径分别来自第 07 篇和第 01 篇的真机记录。可以确定的是目录怎么分层：`ee.*.log` 与 `ee-core.*.log` 是两套 logger，找子进程的问题要去前者。

### 改完代码设备上还是旧页面

八成是构建链路没走全。按改动位置对照：

| 改了哪里 | 至少跑这些 |
| --- | --- |
| `frontend/` | `npm run build-frontend` → `npm run ohos-test` |
| `electron/` | `npm run ohos-test` |
| `go/` | `npm run build-go-hnp-ohos` → `npm run ohos-test` |
| `ohos_hap/electron/` | 重新 `build_project` / DevEco Studio 运行 |
| `ohos_hap/web_engine/` | 同时检查 HAR 和依赖它的 `electron` 模块 |
| `cmd/bin.js` 注入规则 | 检查注入目标目录内容是否更新 |

最快的定位方法是比一比两处 `main.js` 的修改时间：仓库根目录的 `public/electron/main.js`，和 HAP 里的 `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public/electron/main.js`。两者不一致，就是注入没跑。

小结：这一节里最容易踩的是第一条——`build-frontend` 和 `ohos-test` 是两条独立命令，谁也不会替谁跑；其次是顺序，`build-electron → encrypt → ohos 注入 → HAP 构建` 是固定次序，先注入再加密，进 HAP 的仍然是明文。

## 具体改了哪些地方

这一节列的是相对上游 electron-egg 的改动，每条说清为什么这么改。

### 1. 新增 `ohos_hap/` 整个 HAP 工程

上游没有这一层。新增它是为了让同一套业务代码能装进鸿蒙应用模型：`electron` 模块是 entry HAP，只保留 Ability 生命周期和 ArkUI 页面；`web_engine` 是 HAR，承担窗口容器、平台适配、JS 绑定。拆成两层是为了让 entry 保持为薄壳——`EntryAbility` 里每个生命周期方法都只调用 `super`，真正的实现都在 `WebAbility` 基类里。以后升级引擎只要换 `web_engine`，业务侧入口不用跟着改。

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

鸿蒙打包用的资源目录（`resfile`）和构建产物目录（`public/`、`out/`、`build/`）是几份拷贝。新增这段配置是给 `ee-bin` 一个声明式的抽取规则，复用 electron-builder 的 FileSet 语义，避免每次手工复制、也避免漏复制。

```javascript
ohos: {
  resources: [
    { from: './out/mac-arm64/ee.app/Contents/Resources/app',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app',
      filter: ["**/*", "!README.md", "!README.zh-CN.md"] },
    // extraResources 使用 OHOS 交叉编译产物；mac .app 里的 goapp 是 Mach-O，
    // OHOS 上 spawn 会报 ENOEXEC
    { from: './build/extraResources-ohos',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources',
      filter: ["**/*"] },
  ],
  test: [
    { from: './public',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app/public',
      filter: ["**/*", "!README.md", "!README.zh-CN.md"] },
    { from: './ohos_hap/common/better-sqlite3',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app/node_modules/better-sqlite3',
      filter: ["**/*", "!README.md", "!README.zh-CN.md"] },
    { from: './build/extraResources-ohos',
      to: './ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources',
      filter: ["**/*"] },
  ],
}
```

### 4. 新增 `go_ohos` 构建段与一组 npm 脚本

`go_w` / `go_m` / `go_l` 打出来的是宿主机架构的 `goapp`，直接塞进 HAP 会在 `exec` 时格式不符。新增 `go_ohos` 段并让它把产物单独放到 `build/extraResources-ohos/`，避免覆盖桌面端的 `goapp`：

```javascript
// 产物单独放 extraResources-ohos，避免覆盖 mac/linux 的 goapp
go_ohos: {
  directory: './go',
  cmd: 'go',
  sync: true,
  args: ['build', '-o=../build/extraResources-ohos/goapp'],
},
```

`package.json` 里配套加了脚本，并把资源注入拆成带不带 Go 两套，避免每次注入都强制触发一次交叉编译：

```json
"build-go-ohos": "cross-env GOOS=linux GOARCH=arm64 CGO_ENABLED=0 ee-bin build --cmds=go_ohos",
"build-hnp-ohos": "node ./script/ohos-hnp.js",
"build-go-hnp-ohos": "npm run build-go-ohos && npm run build-hnp-ohos",
"ohos": "ee-bin ohos --cmds=resources",
"ohos-go": "npm run build-go-hnp-ohos && npm run ohos",
"ohos-test": "npm run build-electron && ee-bin ohos --cmds=test",
"ohos-test-go": "npm run build-electron && npm run build-go-hnp-ohos && ee-bin ohos --cmds=test"
```

`--cmds` 接 `ohos` 段下的 key。`ohos-test` 把构建和注入串起来，是因为调试时这两步几乎总是一起做，漏掉任何一步的表现都是「改了没生效」。

### 5. 新增 `script/ohos-hnp.js` 做 HNP 打包

这是本 demo 相对框架示例最关键的新增件。内核 XPM 拦未签名二进制的 `exec`，`resfile` 里直接 spawn 必然 `EACCES`；HNP 是官方给出的签名放行方案：把二进制打进 `.hnp` 包，随 HAP 安装时由系统释放并签名。

脚本先组装 staging（`hnp.json` + `bin/goapp/goapp`），再调 `hnpcli pack`，产物落在 `ohos_hap/hnp/arm64-v8a/goapp.hnp`。每次重建前会 `rmSync` 掉 staging，避免脏产物。`hnpcli` 的默认路径写的是 macOS 上的 DevEco SDK，换平台要设 `HNPCLI`。

### 6. `module.json5` 声明 `hnpPackages`、权限、Ability 与进程

```json5
"hnpPackages": [
  { "package": "goapp.hnp", "type": "private" }
]
```

只打包不声明，系统不会去解包签名，前面那步就白做了。除此之外：

- `deviceTypes` 只留 `2in1` 和 `tablet`，对应鸿蒙 PC 和平板；
- 权限按需声明：网络、窗口置顶、打印、剪贴板、下载/文档/桌面目录读写、相机麦克风定位等，带 `reason` 的几项在 `resources/base/element/string.json` 里都有对应文案；
- `EntryAbility` 用 `specified` 启动模式，`BrowserAbility` 和 `StatelessAbility` 通过 `process: ':browser'` 跑在独立进程里。拆进程是为了让子窗口和主窗口隔离，代价是不能假设它们共享同一份内存单例。

### 7. `electron/service/cross.ts` 增加鸿蒙分支

三处改动，都是被真机现象逼出来的：

**启动路径换成 HNP 释放后的签名路径。** `resfile` 里的原始拷贝不可执行，必须指向系统释放出来的物理路径：

```typescript
function getOhosGoAppCmd(): string {
  const home = process.env.HNP_PRIVATE_HOME || '/data/app';
  return path.join(home, 'goapp.org', 'goapp_1.0', 'bin', 'goapp', 'goapp');
}
```

**把可写目录喂给子进程。** 鸿蒙沙箱下从父进程继承的 `$HOME`（`/storage/Users/currentUser`）只读不可写，ee-go 的 `initUserDir()` 会在 `$HOME/.config` 下建目录，`mkdir` 失败进程直接退出。`CrossTargetConfig.env` 在当前 `ee-core` 版本里不会被转发给 `cross-spawn`，所以改成直接覆盖 `process.env.HOME`，子进程默认继承：

```typescript
if (is.openharmony()) {
  process.env.HOME = getAppUserDataDir();
}
```

**打开 stdio 并挂监听。** `cross.run()` 默认不转发子进程的 stdout / stderr，子进程秒退时业务日志里一个字都看不到。鸿蒙分支改成 `['ignore', 'pipe', 'pipe', 'ipc']`，并把 stdout / stderr / exit / error 四个事件都转进 logger，带 `[go]` 前缀。

### 8. 新增 `electron/service/debug.ts` 目录与执行权限探针

鸿蒙真机上没有文件管理器可以翻沙箱，排查「进程为什么秒退」只能靠应用自己把现场打出来。这个文件提供两个工具：`printEnvTree()` 打印运行时关键路径 + 安装包目录树（同时落盘到 `logDir/dirs-tree.txt`），`probeGoExec()` 依次验证「bundle 路径下的权限位与挂载选项」「复制到可写目录后能否执行」「HNP 释放路径是否存在」，用四条证据把 `EACCES` 的来源钉死。两个调用在 `preload/index.ts` 里默认是注释状态，用完可以删。

### 9. `better-sqlite3` 走单独的编译与注入链路

`better-sqlite3` 是原生模块，桌面端那份 `.node` 在鸿蒙上加载不了。仓库里保留了 OHOS 侧的编译产物 `ohos_hap/common/better-sqlite3/`，并在 `cmd/bin.js` 的 `test` 组里单独把它注入到 `resfile/resources/app/node_modules/better-sqlite3`，绕开 `npm install` 拉下来的宿主机版本。`ohos_hap/common/better-sqlite3编译指南.md` 记录了编译方法。

### 10. `AppScope/app.json5` 定义包名与多实例

```json5
"bundleName": "com.electronegg.demo",
"multiAppMode": { "multiAppModeType": "multiInstance", "maxCount": 2 }
```

包名换成鸿蒙侧的标识，和桌面端 `cmd/builder-mac-arm64.json` 里的 `appId` 分开。开多实例是因为 HAP 工程本身允许同应用起多个实例，但示例没有多实例业务，这条只到配置层面。

### 11. 图标资源分成两份

桌面端图标在 `build/icons/`（含 `icon.png`、`icon.ico`、`icon.icns`），鸿蒙端要单独放到 `ohos_hap/AppScope/resources/base/media/`：

```bash
cp build/icons/icon.png ohos_hap/AppScope/resources/base/media/app_icon.png
cp build/icons/icon.png ohos_hap/AppScope/resources/base/media/startIcon.png
```

`app_icon.png` 被 `AppScope/app.json5` 的 `icon` 字段和各 Ability 的 `icon` 引用，`startIcon.png` 被 `EntryAbility` 的 `startWindowIcon` 引用。两个文件不要塞进 `resfile/`——那个目录是应用资源注入区，放进去会被下次注入覆盖。

### 12. `cmd/bin.js` 的 `encrypt` 段

加密是框架自带能力，不是鸿蒙专有改动，但本 demo 的配置值得记一笔：主进程 `type: 'confusion'`，`specificFiles` 单列了 `main.js` 和 `preload/bridge.js`（包入口和 preload 的文件名约束最严，单列出来便于调整策略时不误伤），前端保持 `type: 'none'`——前端资源最终由 ArkWeb 加载，Vite 产物已经 minify 过，进一步混淆收益有限。顺序上要记牢：`build-electron → encrypt → ohos 注入 → HAP 构建`，先注入再加密的话，进 HAP 的还是明文。

## 功能能用到什么程度

下面按 T0 / T1 / T2 三档列。状态只有 `能用` / `未适配` 两种取值：仓库代码或配套博文能支撑的写 `能用`，其余按原因归到 `未适配`。每一行的说明里都标出了证据来源，即对应的仓库文件路径或配套博文中的真机记录。

### T0 基础能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| HAP 工程可编译 | 能用 | `ohos_hap/` 是完整的 stage 模型工程，`build-profile.json5` 声明了 `electron` 与 `web_engine` 两个模块和 `default` 产品；配套博文记录了 `build_project --module electron@default` 通过。|
| 引擎运行时与原生库齐全 | 能用 | `resfile/` 下的 `electron`、`icudtl.dat`、`*.pak`、`locales/`、`v8_context_snapshot.bin`、`vulkan/` 与 `ohos_hap/electron/libs/arm64-v8a/` 下的四个 `.so` 加 `better_sqlite3.node` 都已入库，不再依赖外部补齐 |
| HAP 能装到设备 | 能用 | 配套博文（第 01 篇）记录了 DevEco Studio 编译签名后安装到鸿蒙设备的完整流程与截图。|
| EntryAbility 能启动 | 能用 | `mainElement` 为 `EntryAbility`，`srcEntry` 指向 `Application/AbilityStage.ets`，Ability `exported` 为 true，`skills` 里带 `entity.system.home`。|
| 首页不白屏 | 能用 | 前端产物已注入 `resfile/resources/app/public/dist`，`windowsOption.show` 为 `true`，`windowReady` 里也保留了 `ready-to-show` 延迟显示的分支；第 01 篇有应用在鸿蒙设备上启动后的界面截图，第 03 篇有主界面在鸿蒙 PC 上运行、前端资源随 HAP 加载的截图。|

小结：从构建到安装的四步链路，仓库里每一步都有对应的配置或脚本，配套博文也记录了在鸿蒙设备上走通的全过程。这一档真正的门槛不在代码，而在目标设备的 SDK 版本与签名——`build-profile.json5` 里的签名与具体开发机绑定，换机器必须重配，配不上连 HAP 都签不出来。

### T1 主要能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| Vue 页面与路由 | 能用 | `frontend/src/router/routerMap.js` 注册了 `framework` / `os` / `effect` / `cross` 四组路由共十余个页面，构建产物随 HAP 注入；第 03 篇有主界面及各功能页面在鸿蒙 PC 上的运行截图。|
| 控制器 / 服务路由 | 能用 | `controller/` 下的 `example`、`framework`、`os`、`effect`、`cross` 五个控制器按 `controller/{name}/{method}` 解析，第 06 篇记录了真机上「控制器 / service 全部回归」。|
| IPC 通道 | 能用 | 前端经 `frontend/src/api/index.js` 的频道表调用，配置里 `contextIsolation: false` + `nodeIntegration: true`；第 06 篇记录了真机 IPC 调用回归 |
| HTTP 服务 | 能用 | `config.default.ts` 中 `httpServer.enable = true`，监听 `127.0.0.1:7071`；第 03 篇有该控制器经 HTTP 通道被调用的记录。|
| Socket 服务 | 能用 | 同一份配置里 `socketServer.enable = true`，端口 7070。|
| 后台 jobs 子进程 | 能用 | `electron/jobs/example/` 下的任务经 `child_process.fork` 拉起，构建链对 `jobs/` 逐文件转译以保证 fork 能找到独立文件；第 06 篇记录了真机上「jobs 子进程」回归 |
| 主进程日志落盘 | 能用 | pino 日志按天切分，写入应用沙箱的 `logs/` 目录，业务日志与框架日志分文件；第 01 篇记录了真机上的日志目录。|
| 窗口尺寸与居中 | 能用 | `electron/preload/lifecycle.ts` 的 `windowReady` 按主屏工作区 70% × 80% 计算尺寸并居中；`electronAppReady` 里处理二次启动时还原主窗口 |
| Go 后端子进程（HNP 签名） | 能用 | `script/ohos-hnp.js` + `module.json5` 的 `hnpPackages` + `service/cross.ts` 的 HNP 路径三处配套；第 07 篇记录了真机上 `ps -ef` 显示 `goapp --port=7073` 常驻、`curl http://127.0.0.1:17073/api/hello` 返回数据，并有截图。|
| 沙箱可写目录适配 | 能用 | `service/cross.ts` 在 `is.openharmony()` 时把 `process.env.HOME` 指到 `getAppUserDataDir()`，绕开 `$HOME` 不可写导致的 `mkdir` 失败；第 07 篇记录了修复前后的报错对照 |
| better-sqlite3 原生模块 | 能用 | OHOS 侧编译产物在 `ohos_hap/common/better-sqlite3/`，由 `cmd/bin.js` 的 `test` 组注入；第 04 篇记录了鸿蒙 PC 真机上把 CRUD、事务、聚合、Pragma 逐项跑通的截图，方法名与用法同样见该篇。|
| 代码混淆加密 | 能用 | 主进程走 `type: 'confusion'`，`specificFiles` 单列入口与 preload；第 06 篇记录了真机上加密产物按 T0/T1/T2 走完一遍、行为与明文版一致，并有截图 |
| 多进程渲染容器 | 能用 | `web_engine/childProcess.ets` 导出 `WebChildProcess`，入口侧 `CustomChildProcess` 继承它；`BrowserAbility`、`StatelessAbility` 声明了独立进程 `:browser`；第 03 篇有鸿蒙 PC 上以窗口形式运行的真机记录。|

小结：框架的核心能力——三条通信通道、控制器与服务的路由、窗口生命周期、日志、后台任务——在示例里都保留了，主进程侧不依赖 Electron 特有 API 的部分能直接复用。真正取决于鸿蒙侧的是三样：ArkWeb 给出的 WebGL / 渲染能力、沙箱内的端口与目录权限、以及内核对外部二进制的放行策略。这三样在配套博文里都有真机记录：ArkWeb 承载的前端页面在真机上正常渲染，沙箱内的可写目录与端口访问在第 07 篇有真机验证过程，外部二进制的放行则由本 demo 用 HNP 给出了解法。

### T2 增强能力

| 能力 | 状态 | 说明 |
| --- | --- | --- |
| HAP 应用图标与启动图标 | 能用 | `AppScope/resources/base/media/app_icon.png` 与 `startIcon.png` 已在仓库中，分别被 `AppScope/app.json5` 和 `EntryAbility` 的 `startWindowIcon` 引用 |
| Release 构建 ArkTS 混淆 | 能用 | `ohos_hap/electron/build-profile.json5` 与 `web_engine/build-profile.json5` 的 release 变体都开了 ArkTS 混淆并指定了规则文件。|
| 系统对话框（消息框 / 选择目录 / 选图） | 能用 | `controller/os.ts` 已实现调用，引擎侧有 `DialogAdapter` / `FilePickerAdapter` 做平台适配；第 03 篇有鸿蒙 PC 上选择文件与图片的真机截图。|
| 系统通知 | 能用 | `controller/os.ts` 的 `sendNotification` 与 `service/os/window.ts` 已实现，引擎侧有 `NotificationAdapter`。|
| 多窗口 | 能用 | `module.json5` 声明了多个 Ability，`main_pages.json` 里也有 `SubWindow`、`NodeHandleWindow` 等页面，引擎侧有 `WebSubWindow` / `SubWindowAdapter`；示例前端只有 `subwindow` / `login` 两个入口；第 03 篇有窗口创建与页面在鸿蒙 PC 上运行的真机记录。|
| 多实例 | 未适配 | `AppScope/app.json5` 开了 `multiInstance`、上限 2，但示例没有多实例业务代码，这条只到配置层面，多开实例的业务场景不在本示例覆盖范围内 |
| 系统托盘 | 未适配 | 主动取舍。`preload/index.ts` 里 `trayService.init()` 是默认调用的，`service/os/tray.ts` 依赖 Electron 的 `Tray`；托盘能力不在本示例覆盖范围内 |
| 自动更新 | 未适配 | 主动取舍。`electron-updater` 在依赖里，但 `cmd/builder-mac-arm64.json` 的 `publish[0].url` 为空，没有配置更新源 |
| Go 之外的 Java / Python 子进程 | 未适配 | 主动取舍。`controller/cross.ts` 保留了 `createJavaServer` / `createPythonServer` 分支，但 `build/extraResources/jre1.8.0_201/` 在 `.gitignore` 里，本示例不提供 Java 运行时；`python/` 目录只有示例脚本，没有 OHOS 侧的打包与签名方案 |
| 桌面端单实例锁 | 未适配 | `config.default.ts` 里 `singleLock: true` 是桌面端的行为，鸿蒙侧应用模型是多实例，两者语义不同，单实例锁不在本示例覆盖范围内 |
| 打印 / 剪贴板 / 相机等系统能力 | 未适配 | 主动取舍。引擎侧有 `PrintAdapter`、`PasteBoardApadter`、`MediaAdapter` 等适配件，`module.json5` 也声明了对应权限，但示例前端没有接这些入口 |
| 上架 AppGallery 的完整发布链路 | 未适配 | 仓库只到「能编译、能签名、能装到设备」，正式上架的签名、隐私声明、审核材料都不在本示例范围内 |

小结：T2 这一档大部分是主动取舍——示例的定位是展示「框架本体连同 Go 子进程能不能在鸿蒙上跑通」，不是覆盖桌面端的全部能力。剩下的几项里，系统对话框、通知、多窗口的代码和适配层都在，其中对话框与多窗口在第 03 篇有鸿蒙 PC 上的真机截图；多实例与单实例锁属于「语义还没对齐」，上架链路属于「完全没开始」。要在鸿蒙上交付真实产品，这几项都得按业务实际用到的部分，在目标 SDK、目标设备、目标业务场景上逐项重新验收——桌面端能跑不等于 HAP 自动具备同样的权限和能力。

## 参考与延伸

- 开源鸿蒙 PC 社区：[https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
- PC 社区项目平台（AtomGit）：[https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)
- 本工程仓库地址（AtomGit PC 社区）：[https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg](https://atomgit.com/OpenHarmonyPCDeveloper/ohos_electron-egg)
- ElectronEgg 框架仓库（AtomGit）：[https://atomgit.com/dromara/electron-egg](https://atomgit.com/dromara/electron-egg)
- 第 01 篇《鸿蒙PC软件开发框架：ElectronEgg》：框架介绍、环境搭建、HAP 运行流程与 T0/T1/T2 分档
- 第 03 篇《鸿蒙PC迁移：ElectronEgg框架功能适配鸿蒙PC》：工程分层、资源注入、控制器与通信通道适配
- 第 04 篇《better-sqlite3 鸿蒙 PC 适配实践》：原生模块的编译与注入
- 第 06 篇《使用混淆加密代码，让你的项目更加安全》：`cmd/bin.js` 加密配置与参数取舍
- 第 07 篇《如何让 electron 拉起 go 服务并运行在鸿蒙 PC 上》：HNP 签名、沙箱可写目录与资源同步
- ee-go（Go 后端框架）：[https://github.com/wallace5303/ee-go](https://github.com/wallace5303/ee-go)
- DevEco Studio 下载：[https://developer.huawei.com/consumer/cn/download/deveco-studio](https://developer.huawei.com/consumer/cn/download/deveco-studio)
- OpenHarmony 官方文档：[https://docs.openharmony.cn/](https://docs.openharmony.cn/)
- 华为开发者文档：[https://developer.huawei.com/consumer/cn/doc/](https://developer.huawei.com/consumer/cn/doc/)
