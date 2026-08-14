# 鸿蒙PC软件开发框架：ElectronEgg一套代码，从桌面到鸿蒙

> **欢迎加入开源鸿蒙PC社区：** [https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
>
> **欢迎在PC社区平台申请新建项目：** [https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)

## 摘要

ElectronEgg 是一个基于 Electron 的企业级桌面应用框架，累计获得 8000+ Star，经过大量团队长期实践验证。v5 版本完成了全新升级，最重磅的能力之一是**支持鸿蒙（HarmonyOS）平台**——一套代码，打包 Windows、Mac、Linux，还能直接跑在鸿蒙上。本文将介绍 ElectronEgg 的鸿蒙支持能力、开发环境搭建、资源构建与配置的完整流程，帮助开发者快速上手鸿蒙PC应用开发。

## 一、ElectronEgg 简介

ElectronEgg 自开源以来，愿景很简单：**让所有开发者都能学会桌面软件研发**。它把前端、服务端的工程化思维带进桌面开发，用一套清晰的 controller / service / preload 分层架构，把 Electron 的复杂度封装起来。

![ElectronEgg 官网展示的跨平台桌面软件开发能力](./ee-example-1.png)

v5 版本在此基础上完成了一次全新升级，最重磅的能力之一，就是——**轻松开发鸿蒙应用**。经过不断尝试，终于把 ElectronEgg 运行在鸿蒙设备上，虽然现在是**测试阶段**，但已经跑通了整个流程。

### 1.1 鸿蒙支持：一套代码，跑在 HarmonyOS 上

过去，把 Electron 应用搬到鸿蒙上几乎是一件"重新写一遍"的事。v5 会把资源应用到 HarmonyOS HAP 中，由 HAP 工程的 web 引擎加载。**你现有的 ElectronEgg 业务代码，几乎不用改，就能以鸿蒙应用的形式运行。**

原本在 Windows / Mac 上运行的桌面应用，在鸿蒙端从安装到各项功能都跑得很顺畅。这就是 v5 鸿蒙支持想表达的核心：**跨端不再是口号，鸿蒙是一等公民。**

![ElectronEgg 文档中的 HarmonyOS 鸿蒙支持说明](./ee-example-2.png)

### 1.2 框架功能

除了鸿蒙支持，v5 还有哪些功能：

1. **TypeScript 全面重构** ：所有 API 均有完整类型定义。
2. **双模块格式输出** ：同时支持 CJS 和 ESM 两种格式。
3. **Node.js 版本提升** ：最低要求 Node.js >= 20.19.0。
4. **Pino 日志体系** ：更强大的日志记录功能。
5. **Bundle 注册表机制** ：启动更快。
6. **异步控制器加载** ：支持 ESM 动态导入，避免同步/异步并发竞争。
7. **主进程打包** ： 主进程代码可以像前端 bundle 。
8. **构建注册表插件** ：复现运行时属性名映射逻辑。
9. **构建配置全面增强** ：新增大量精细控制项。
10. **构建后独立转译** ：对不可打包文件独立转译。
11. **加密系统升级** ： 更安全。
12. **资源原子化移动** ：防止数据丢失。
13. **ee-bin 全面升级** ：新增完整 TypeScript 类型体系。
14. **EventBus 事件隔离** ：生命周期事件优化。
15. **配置加载 ESM 兼容** ：自动解包 `__esModule` 格式，支持函数/类导出。
16. **控制器并发安全** ：明确保证并发请求间无状态污染。
17. **Cross 跨进程改进** ：优化。

### 1.3 谁适合用

- 想用前端技术栈（Vue / React / HTML）做桌面软件的开发者
- 需要把内部工具、管理后台、办公软件交付为桌面应用团队
- 要同时覆盖 Windows、Mac、Linux，**以及鸿蒙**的产品
- 希望降低 Electron 上手成本、想要一套清晰架构的团队

无论你是前端、服务端、运维还是客户端开发者，都能很快入门。

### 1.4 开源仓库

- AtomGit：[https://atomgit.com/dromara/electron-egg](https://atomgit.com/dromara/electron-egg)
---

## 二、开发准备

> 当前鸿蒙支持处于实验阶段，请持续关注更新。

### 2.1 开发资料

- [鸿蒙应用知识地图](https://developer.huawei.com/consumer/cn/app/knowledge-map/)（必看）
- [鸿蒙系统开发导读](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/application-dev-guide)（非必看）
- [Electron 鸿蒙化指导文档](https://gitcode.com/CPF-Electron/Electron)（非必看）
- [鸿蒙三方库](https://ohpm.openharmony.cn/#/cn/home)（了解）
- [鸿蒙 PC 开发者社区](https://harmonypc.csdn.net/)

### 2.2 环境准备

- 准备一台 **macOS M 芯片电脑**，方便本地模拟器调试。如果是 Windows 或 macOS Intel 芯片电脑，需要鸿蒙真机设备调试。因为鸿蒙 Electron 是构建好的 arm64 架构软件，非 M 芯片电脑无法运行 arm 架构模拟器。
- 下载 [DevEco Studio](https://developer.huawei.com/consumer/cn/download/deveco-studio)
- 下载 [鸿蒙 Electron](https://devcloud.cn-north-4.huaweicloud.com/codehub/project/b19f5ea8ffd4492ea8c06ca2ebf3f858/codehub/2821214/home?ref=electron37-release)

### 2.3 DevEco 设置资源目录（macOS 可忽略）

可选：把系统组件、SDK、模拟器等，下载到非 C 盘，避免占用 C 盘空间：

1. ark-ui 目录修改：`D:\dev_soft\harmony\ArkUI-X\Sdk`
2. codeGenie / 知识库 / 文档：`D:/dev_soft/harmony/Doc`
3. OpenHarmonySdk：`D:\dev_soft\harmony\OhSdk`
4. 设备管理器：`D:/dev_soft/harmony/emulator`

### 2.4 获取一个示例项目

1. 下载示例项目

```bash
# atomgit （推荐）

# 示例项目
git clone https://atomgit.com/wallace5303/electron-egg-ohos.git
```

2. 下载官方框架，主要是为了获取 ohos_hap/electron 资源

```bash
# 框架项目
git clone https://atomgit.com/dromara/electron-egg.git

# 检出 demo-ohos 分支并切换
git checkout -b demo-ohos remotes/origin/ohos/demo-37.2.2
```

3. 把 electron-egg/ohos_hap/electron/libs 文件夹 复制/替换 到 electron-egg-ohos/ohos_hap/electron/libs

因为 libs 文件比较大，所以没放到electron-egg-ohos示例项目中，开发者自己尽量上传到你自己的仓库中


4. 工程目录结构

```text
electron-egg-ohos
├── ohos_hap          # 鸿蒙 HAP 工程目录
│   ├── docs          # 文档目录
```

### 2.5 构建资源

把 electron-egg-ohos 项目构建产物，同步到 `ohos_hap` 工程的资源目录中。

> 注意：`cmd/builder-xxx.json` 中的 `asar` 属性需要是 `false`。

1. 构建 ElectronEgg 产物

```bash
# v5 版本默认生成 arm64 架构软件
npm run build-m
```

2. 同步资源到 ohos_hap 资源目录

```bash
npm run ohos
```

3. （可选）不打包，直接复制资源到 ohos_hap 资源目录，用于代码修改后的快速测试

```bash
npm run ohos-test
```

---

## 三、使用 DevEco Studio 运行项目

### 3.1 打开项目

- 启动 DevEco Studio
- 选择 File -> Open
- 打开 `./ohos_hap` 目录

### 3.2 配置签名

如果是首次运行，需要配置应用签名：自动生成调试签名或配置发布签名。

![DevEco Studio 中 ohos_hap 工程的签名配置页面](./ee-example-3.png)

### 3.3 连接鸿蒙真机设备

使用 USB Type-C 数据线连接开发电脑和鸿蒙设备。

在设备上启用开发者模式和 USB 调试模式：

- **激活开发者模式**：进入「设置」> 搜索或找到「软件版本」，连续快速点击 7 次，弹出确认框后点击"确定"；部分版本需重启设备生效。
- **进入开发者选项**：重启后返回「设置」>「系统」>「开发者选项」（若未显示请确认已重启且处于机主模式）。
- **开启 USB 调试**：在开发者选项列表中找到"USB 调试"，点击开关并确认弹窗授权；HarmonyOS 5+ 可能需同步开启"仅充电模式下允许 ADB 调试"（若存在该选项）。
- **连接验证**：使用原装 USB 线连接电脑，手机端弹出"允许 USB 调试"对话框时勾选"始终允许"并确认；通知栏 USB 用途建议选择"文件传输/MTP"。

在 DevEco Studio 中确认设备已连接（顶部工具栏会显示设备名称）。

### 3.4 编译和运行

点击「运行」按钮，系统会自动进行以下操作：

- 编译 HAP 包
- 重新签名
- 安装到设备
- 启动应用

过一会，就可以在鸿蒙设备上看到应用了。

![应用在鸿蒙设备上的运行结果](./ee-example-5.png)

---

## 四、调试

### 4.1 渲染进程调试

调用 `openDevTool()` API 来打开开发者工具。

### 4.2 主进程调试

#### 控制台日志

由于 IDE 打印的日志较多，你可以在控制台搜索过滤。其中 `... [ohos] xxx ...` 是代码里 `console` 打印的日志。

![DevEco Studio 的 HiLog 控制台显示 ElectronEgg 运行日志](./ee-example-4.png)

#### 文件日志

真机设备上，日志目录：

```text
/storage/Users/currentUser/appdata/el2/base/com.electronegg.ohos/files/应用名/data
/storage/Users/currentUser/appdata/el2/base/com.electronegg.ohos/files/应用名/logs
```

---

## 五、鸿蒙资源配置

### 5.1 介绍

ElectronEgg 支持将应用打包为鸿蒙（HarmonyOS）版本。Electron 构建产物会被提取并拷贝到 HarmonyOS HAP 的资源目录中，由 HAP 工程的 web 引擎加载。

该能力由 `ee-bin` 的 `ohos` 命令实现，遵循 electron-builder 的 `extraResources` FileSet 规范（`from` / `to` / `filter`），可灵活选择资源。

### 5.2 配置方法

在 `bin.js` 配置的 `ohos` 字段下声明要提取的资源，每个条目为一个 FileSet：

```javascript
// config/bin.js（或 bin.json）
module.exports = {
  // ...其它 ee-bin 配置
  ohos: {
    resources: [
      {
        from: './out/mac-arm64/ee.app/Contents/Resources/app',
        to: './ohos_hap/web_engine/src/main/resources/resfile/resources/app',
        filter: [
          "**/*",
          "!README.md",
          "!README.zh-CN.md"
        ]
      },
      {
        from: './out/mac-arm64/ee.app/Contents/Resources/extraResources',
        to: './ohos_hap/web_engine/src/main/resources/resfile/resources/extraResources',
        filter: [
          "**/*"
        ]
      }
    ]
  }
}
```

### 5.3 配置字段说明

| 字段       | 类型         | 说明                                                                       |
| ---------- | ------------ | -------------------------------------------------------------------------- |
| `from`   | `string`   | 源路径（相对项目根目录），即要拷贝的构建产物                               |
| `to`     | `string`   | 目标路径（相对项目根目录），位于 HAP 资源目录内                            |
| `filter` | `string[]` | glob 匹配规则。`**/*` 匹配所有；`!pattern` 表示排除。默认 `['**/*']` |

### 5.4 使用命令

运行 `package.json` 中定义的 `ohos` 脚本：

```bash
# 构建并同步资源
npm run ohos

# 自定义测试命令（不打包，直接复制资源）
npm run ohos-test
```

其等价于：

```bash
# 构建并同步资源
ee-bin ohos --cmds=resources

# 自定义测试命令
ee-bin ohos --cmds=resources_public
```

`--cmds` 接受逗号分隔的 `ohos` 下的 key 列表。若省略，则处理 `ohos` 下所有数组类型的配置项。

---

## 六、总结

ElectronEgg v5 的鸿蒙支持，让前端开发者无需学习全新的鸿蒙原生开发体系，就能用熟悉的技术栈（Vue / React / HTML + Electron）快速构建鸿蒙PC应用。核心思路是：Electron 构建产物通过 `ee-bin ohos` 命令同步到 HAP 工程资源目录，由鸿蒙 web 引擎加载运行。

整个流程可以概括为：

1. **搭建环境**：安装 DevEco Studio，下载鸿蒙 Electron
2. **构建产物**：`npm run build-m` 生成 arm64 架构 Electron 产物
3. **同步资源**：`npm run ohos` 将产物拷贝到 HAP 工程目录
4. **运行调试**：用 DevEco Studio 打开 `ohos_hap`，连接真机运行

桌面软件（办公方向、个人工具）仍然是未来十几年 PC 端的刚需之一。ElectronEgg 想做的，是让这件事变得简单——而现在，这份"简单"也延伸到了鸿蒙。框架已广泛应用于记账、政务、企业、医疗、学校、股票交易、ERP、娱乐、视频等领域的客户端，欢迎放心使用。

如果对你有帮助，欢迎 Star 支持，也欢迎加入社区一起交流。
