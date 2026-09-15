# ElectronEgg 鸿蒙 PC 适配 demo（ee-demo-ohos）

> **欢迎加入开源鸿蒙PC社区：** [https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
>
> **欢迎在PC社区平台申请新建项目：** [https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)

让 ElectronEgg 运行在鸿蒙 PC 上。

基于 [ElectronEgg](https://atomgit.com/dromara/electron-egg)（ee-v5）的鸿蒙 PC demo 工程，来自框架仓库的 `ohos/demo-37.2.2` 分支。根目录的 `electron/` 与 `frontend/` 保持桌面端原样，鸿蒙侧的 Ability、窗口容器、平台适配和打包配置集中在 `ohos_hap/`，构建产物通过 `ee-bin ohos` 注入 HAP 的 `resfile` 目录，前端页面最终由 ArkWeb 渲染。示例额外接入了 `go/` 后端子进程，并用 HNP 打包解决鸿蒙内核 XPM 对未签名二进制的拦截。

迁移的详细记录、逐项适配说明和 T0/T1/T2 分档表在 [README.OpenHarmony_CN.md](./README.OpenHarmony_CN.md)，每项能力的证据来源都在说明里标了出来。

## 迁移能力分级

| 阶段 | 目标 | 最小验收内容 |
| --- | --- | --- |
| T0：可启动 | HAP 能安装并打开首页 | `build_project --module electron@default` 成功；EntryAbility 启动；主页面可见、不白屏 |
| T1：核心业务可用 | 前端资源与主进程能力可用 | 前端为最新注入版本；controller / service 路由正常；IPC 调用有返回；HTTP、Socket 服务可访问；日志落盘；Go 子进程经 HNP 签名后能常驻并可由 `curl` 访问 |
| T2：可发布 | 覆盖产品的实际使用边界 | 多窗口、多实例、托盘、通知、原生模块、外部子进程、自动更新、上架链路按目标设备与业务场景逐项回归 |

三档是递进的：T0 不通过后面都是空谈，T1 决定框架能力有没有真的用上，T2 决定能不能交付。仓库当前的状态是 T0 / T1 的配置链路完整、配套博文中有真机运行记录，T2 大部分为主动取舍或不在本示例覆盖范围内，具体口径见适配记录里的三张分档表。

---

[![star](https://gitee.com/dromara/electron-egg/badge/star.svg?theme=gvp)](https://gitee.com/dromara/electron-egg/stargazers)

<div align=center>
<img src="https://wallace5303.gitee.io/ee/images/electron-egg/logo.png" width="150" height="150" />
<h3>🎉🎉🎉 ElectronEgg V5 Has Been Released! 🎉🎉🎉</h3>
</div>
<br>

<div align=center>
<img src="./public/images/example/logo.png" width="150" height="150" />
</div>

<div align=center>
<h3><strong>An easy-to-learn, cross-platform, enterprise-grade desktop software development framework</strong></h3>
</div>
<br>

<!-- ## 🌏 [English](https://www.yuque.com/u34495/ee-doc) | [Chinese](https://www.kaka996.com/) -->

## 📋 Introduction

> The framework has been widely used in accounting, government, enterprise, healthcare, education, stock trading, ERP, entertainment, video, and other desktop application domains — feel confident using it!

## 👦 Who Can Use It

The project already has 5 community groups covering `frontend`, `Java`, `Go`, `Python`, `PHP`, and other developers.

Whether you are a frontend, backend, DevOps, game, or client developer, you can get started quickly.

## 🐶 Showcase

- [**Click to view**](#project-cases)

## 📺 Features
- 🍩 **Why use it?** Desktop software (office & personal tools) will remain one of the PC demands for the next decade, boosting work efficiency
- 🍉 **Simple:** Supports JS, TS, CJS, ESM
- 🍑 **Vision:** All developers can learn desktop software development
- 🍰 **Gitee:** https://gitee.com/dromara/electron-egg **6000+**
- 🍨 **GitHub:** https://github.com/dromara/electron-egg **2400+**
- 🏆 Gitee Most Valuable Open Source Project
    ![](./public/images/example/ee-zs.png)

## 📚 Documentation
- Quick start: [Tutorial Docs](https://www.kaka996.com/)
    ![](./public/images/example/v3-home.png)

## 📦 Highlights
1. 🍄 Cross-platform: One codebase can be packaged for Windows, macOS, Linux, national UOS, Deepin, Kylin, etc.
2. 🌹 Architecture: Single business process / modular / multi-task (process, thread, renderer process), making large-scale project development simple.
3. 🌱 Simple & efficient: Only need to learn JS
4. 🌴 Frontend-independent: Theoretically supports any frontend technology, such as Vue, React, HTML, etc.
5. 🍁 Engineering: You can write desktop software using frontend and backend development paradigms
6. 🌷 High performance: Event-driven, non-blocking I/O
7. 🌰 Feature-rich: Configuration, communication, plugins, database, upgrades, packaging, tools... everything you need
8. 💐 Security: Supports bytecode encryption and compression/obfuscation encryption
9. 🌻 Feature demos: Common desktop software features are integrated or provided as demos in the framework

## ✈️ Use Cases

### 1. 🚀 Conventional Desktop Software
- 🚖 Windows platform

    ![](./public/images/example/ee-win-home.png)

- 🚍 macOS platform
    ![](./public/images/example/ee-mac-home.png)

- 🚔 Linux platform - National UOS, Deepin
    ![](./public/images/example/uos-home.png)

- 🚔 Linux platform - Ubuntu
    ![](./public/images/example/ubuntu-db.png)

### 🚐 2. Convert Vue, React, Angular, and Web apps into Desktop Software
- 🚙 Vue Ant Design (local)

    ![](./public/images/example/vue-antd.png)

- 🚙 Zentao Project Management (web project URL)

    ![](./public/images/example/ee-project-7.png)

### 🚂 3. Games (developed with H5-related technologies)
- 🚊 Ninja 100 Floors

    ![](./public/images/example/ee_game_1.png)


## 📒 Getting Started

- ✒️ [Installation Guide](https://www.kaka996.com/pages/e64ff6/)

## Project Cases
- 🐟 The framework has been applied to desktop clients in healthcare, education, government, stock trading, ERP, entertainment, video, enterprise, and other domains

### 🐸 Remote Control

- RQ Center
![](./public/images/example/rq-1.png)
![](./public/images/example/rq-2.png)

### 🐸 Cloud Storage

- FM Cloud
![](./public/images/example/fm-p2.png)
![](./public/images/example/fm-p1.png)
![](./public/images/example/fm-p4.png)

### 🐸 IM

- Cede IM
![](./public/images/example/im-p1.png)
![](./public/images/example/im-p5.png)
![](./public/images/example/im-p1.png)

### 🐸 Wallpaper

- warpar
![](./public/images/example/aw-3.png)

### 🐸 League of Legends Assistant

- Serendlplty
![](./public/images/example/lol-zhanji.png)

### 🐸 More

- [More Cases](https://www.kaka996.com/pages/eadf46/)

## 💬 Community
1. [Discussion](https://www.kaka996.com/pages/c2720e/)
