<!-- TODO: 发布时补充 Schema.org 结构化数据（BlogPosting），标注 headline / author / datePublished / mainEntity -->

# 【鸿蒙PC开发】使用AI编程工具Codex开发完整应用实践

> **欢迎加入开源鸿蒙PC社区：** [https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
>
> **欢迎在PC社区平台申请新建项目：** [https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)

## 摘要

本文记录了使用 Codex 辅助开发鸿蒙 PC 应用的完整实践，覆盖环境准备、ArkTS/ArkUI 编码、运行时诊断、真机调试与打包发布。其中，运行时诊断部分引入 `arkts-runtime-fix` Agent Skill，并以一次真实安装为例，说明如何在执行第三方安装命令前核对来源、审查脚本风险、处理已有安装冲突，以及验证技能目录和解析脚本是否完整可用。

## 一、Codex 简介

<!-- TODO: 介绍 Codex 的定位：可用于鸿蒙 PC 开发的 AI 编程工具，核心能力（代码生成、补全、问答、ArkTS 语法纠错、鸿蒙 API 建议等）。-->

### 1.1 它能做什么

<!-- TODO: 能力清单 -->

- 代码生成与补全
- 鸿蒙 ArkTS / ArkUI 语法纠错
- 鸿蒙系统能力（@ohos.* / @kit.*）API 建议与用法
- 运行时崩溃（jscrash / hilog）辅助诊断
- 按任务加载 Agent Skill，复用可审查的诊断流程和脚本
- <!-- TODO: 其他能力 -->

### 1.2 与传统开发方式对比

开发鸿蒙 PC 应用有两种典型路径：一种是传统手写开发，从零学习 ArkTS 语法与 ArkUI 组件体系，在 `@ohos.*` / `@kit.*` 文档中逐条查找接口，遇到运行时崩溃再在 `jscrash` / `hilog` 日志里手工定位；另一种是借助 Codex 这类 AI 编程工具，用自然语言描述需求、生成代码，并把排障方法固化为可复用的 Agent Skill。两者的差异不只在打字速度上，更体现在学习成本、排错方式与经验沉淀方式上。

| 维度 | 传统手写开发 | Codex AI 辅助 |
| --- | --- | --- |
| 上手门槛 | 需先掌握 ArkTS 语法、ArkUI 组件体系与工程结构，新手通常要数周才能独立写出可运行的界面 | 用自然语言描述界面与逻辑即可生成骨架代码，新手当天即可跑通可运行的 Demo |
| ArkTS 语法熟悉成本 | 需系统阅读官方语法规范，靠编译器报错逐步纠正，容易卡在类型限制（禁止 `any`、严格空安全）与声明式 UI 写法上 | 生成代码默认贴合 ArkTS 规范；编译报错可直接交给 Codex 解释并修复，熟悉成本明显下降 |
| 鸿蒙 API 查找效率 | 在 `@ohos.*` / `@kit.*` 文档、社区帖子与示例工程之间反复切换，还需自行判断接口是否已过时 | 直接提问即可得到符合当前 SDK 的 API 建议、用法与权限说明，还能获得替代方案 |
| 崩溃定位速度 | 面对 `jscrash` / `hilog` 的海量日志手工逐行分析，调用栈与源码对不上时尤其耗时 | 通过 `arkts-runtime-fix` 等 Agent Skill 自动提取异常类型、源码位置与调用栈，必要时再用 `hdc` 拉取设备日志，快速收敛根因 |
| 排错经验与知识的沉淀 | 结论散落在个人记忆与聊天记录中，难以复用和共享 | 把稳定的排障方法固化到 Agent Skill，一次审查、处处复用，新成员也能按同一套流程排障 |
| 结果可靠性 | 代码完全可控，质量取决于个人经验与审查习惯 | 生成速度快，但需人工 review，边界条件与权限、安全细节必须由人确认，不能盲信 |

#### 三处关键变化

**从「查文档」到「对话式生成」**。传统开发有相当一部分时间花在「找 API」上：先确认接口名，再看参数、权限与版本，最后还要贴进工程验证。Codex 可以直接根据需求给出可用写法，把「找到可用 API」的耗时压缩到一次对话。不过生成结果是否适用于当前 SDK 版本，仍要以[华为开发者文档](https://developer.huawei.com/consumer/cn/doc/)与 [OpenHarmony 官方文档](https://docs.openharmony.cn/)为准。

**从「读报错」到「解释报错」**。ArkTS 在 TypeScript 基础上做了严格类型限制，新手常被一长串编译错误挡住。传统做法是把错误粘贴到搜索框逐条理解；Codex 能直接解释错误成因并给出最小修复，把「理解错误」本身变成一项辅助能力。

**从「个人经验」到「可审查的 Skill」**。传统排障依赖个人积累；借助 Agent Skill，可以把一套经过审查的诊断流程交给 AI 按需调用，流程公开、脚本可审查、结论可复现（见第 2.3 节）。这能让「排障能力」从个人属性变成团队资产。

#### 边界与原则

对比不是为了说明「AI 能替代开发」，而是强调「AI 辅助可以缩短到第一个可运行版本的距离」。Codex 生成的代码仍可能引用过时的 API、遗漏权限声明，或在边界条件下出错，因此本文贯穿两条原则：**先审查后执行**——安装命令、脚本与设备访问都要核对来源再运行；**逐段 review、最小化修改**——不整段盲贴生成结果，只采纳理解并验证过的改动。这两条原则在 2.3 节（技能安装）与 3.4 节（代码 review）中都有具体演示。

## 二、开发环境准备

<!-- TODO: 列出前置依赖与安装步骤 -->

### 2.1 软件与硬件要求

<!-- TODO: DevEco Studio 版本、SDK、Node、操作系统、鸿蒙 PC 真机/模拟器 等 -->

### 2.2 安装 Codex

<!-- TODO: 安装方式（插件市场 / 命令行 / 离线包）、配置与登录 -->

### 2.3 安装 ArkTS 运行时诊断 Skill

Agent Skill 可以把一套稳定的排障方法、参考资料和辅助脚本交给 AI 编程工具按需调用。本次安装的是 `arkts-runtime-fix`，用于处理 ArkTS/JavaScript 的 `jscrash`、未捕获异常、调用栈、`faultlogger` 和 `hilog` 等运行时问题。技能发布者为 CarSmallGuo，公开介绍页与源码如下：

- 技能介绍：[SkillsMP - arkts-runtime-fix](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-runtime-fix)
- 固定版本源码：[CarSmallGuo/deveco-code 0.1.0-TD.4](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-runtime-fix)
- 本次审查的提交：`567c83c8fa7299196864b2710566bdcc73f3c271`

#### 2.3.1 安装前先审查来源和完整目录

不要只下载一个 `SKILL.md`。技能的行为还可能由 `scripts/`、`reference/`、`assets/`、`agents/` 等伴随目录决定，遗漏文件会导致说明与实际能力不一致。安装前应同时打开技能介绍页和源码，固定到明确的标签或提交，然后完整阅读 `SKILL.md` 及其引用的文件。可以先把固定版本检出到临时目录：

```bash
git clone --depth 1 --branch 0.1.0-TD.4 \
  https://github.com/CarSmallGuo/deveco-code.git \
  /tmp/deveco-code-0.1.0-TD.4

find /tmp/deveco-code-0.1.0-TD.4/packages/opencode/resources/skills/arkts-runtime-fix \
  -type f -print | sort
```

本次审查确认，固定版本目录不只有中英文说明，还包含 `evals/evals.json`、可直接执行的 `.mjs` 脚本、对应的 `.ts` 源文件以及 `scripts/shared/` 公共模块。脚本没有发现删除数据、提权、静默上传或安装时访问设备的行为，但运行时存在以下边界：

| 行为 | 风险与使用建议 |
| --- | --- |
| 调用 DevEco `hdc` | 只有明确执行脚本时才会访问已连接设备；运行前确认目标设备 |
| 读取 `faultlogger` 与 `hilog` | 日志可能包含应用路径、Bundle 名称、调用栈和运行时数据，对外分享前应脱敏 |
| 拉取故障日志到本机 | 文件会写入调用者指定的输出目录，应使用专用目录并检查剩余空间 |
| 执行 `.ts` 源文件 | `shared/hdc.ts` 依赖原仓库内部模块；脱离仓库时使用自包含的 `.mjs` 脚本 |

#### 2.3.2 首选安装命令与已有安装冲突

对于尚未安装该技能的环境，发布页给出的首选命令是：

```bash
npx skills add https://github.com/CarSmallGuo/deveco-code --skill arkts-runtime-fix
```

执行后还要确认工具实际选择的目标目录，不能仅凭命令退出码判断安装成功。本次机器上已经存在系统级 DevEco 技能目录，并通过符号链接提供给 Codex 发现：

```text
~/.local/share/deveco/skills/arkts-runtime-fix   # 唯一内容源
~/.codex/skills/arkts-runtime-fix                # 指向上方目录的符号链接
```

现有版本还带有扩展的 `reference/` 崩溃知识库，而首选命令没有固定标签。直接执行可能因目标是符号链接而失败，也可能覆盖或降级已有增强内容。因此本次没有盲目重装，而是把固定版本与现有目录逐项比较：固定版本的全部 `.mjs` 文件与本地版本字节一致，本地仅缺少 8 个 `.ts` 源码伴随文件。最终保留现有 `SKILL.md`、`SKILL_CN.md`、`.version` 和 `reference/`，只补齐缺失的 `.ts` 文件，继续维持单一全局内容源。

如果是全新环境，可以使用首选命令；如果目标已经存在，应先确认它是普通目录还是符号链接，再比较文件树和内容差异。不要直接覆盖，更不要把系统级技能复制进单个项目形成多个失去同步的副本。

#### 2.3.3 安装后验证

验证分为目录完整性、脚本语法和最小功能三层。首先检查发现路径、符号链接目标和关键文件：

```bash
readlink ~/.codex/skills/arkts-runtime-fix
test -f ~/.local/share/deveco/skills/arkts-runtime-fix/SKILL.md
find ~/.local/share/deveco/skills/arkts-runtime-fix -type f -print | sort
```

然后检查所有可执行 JavaScript 脚本的语法：

```bash
find ~/.local/share/deveco/skills/arkts-runtime-fix/scripts \
  -name '*.mjs' -exec node --check {} \;
```

本次结果为：`SKILL.md`、中英文说明、评测文件、脚本、共享模块、8 个 `.ts` 源码伴随文件和本地扩展参考资料全部存在；全部 `.mjs` 通过 `node --check`。最后用一段脱敏的 `TypeError` 日志做冒烟测试，解析器返回 `status: detected`、`error_type: TypeError`，并正确提取了疑似源码文件与行列号。该测试只解析本地样例，没有连接鸿蒙 PC 设备。

这套流程的关键不是“把命令跑完”，而是形成可追溯闭环：固定来源版本、审查全部文件、说明设备与日志风险、保护已有安装，最后用文件树、语法检查和最小样例证明技能确实可用。

### 2.4 安装 ArkTS 编译、语法与 ArkUI 知识 Skill

为把 ArkTS 的问题按阶段处理，本次又安装了三个互补技能：`arkts-error-fixes` 用于编译与类型错误的定位和修复；`arkts-grammar-standards` 用于在首次编写或修改 `.ets` 前核对 ArkTS 基础语法、限制及与 TypeScript 的差异；`arkui-knowledge` 覆盖 ArkUI 组件、布局、状态、渲染、导航、交互和 UI 质量检查。它们的发布者均为 CarSmallGuo，审查时固定到 `deveco-code` 的 `0.1.0-TD.4` 标签（提交 `567c83c8fa7299196864b2710566bdcc73f3c271`）。

| 技能 | 用途 | 固定版本目录内容 |
| --- | --- | --- |
| `arkts-error-fixes` | 编译错误与类型不匹配修复 | `README.md`、`SKILL.md`、32 个 ArkTS 示例和 31 篇参考资料，共 65 个文件 |
| `arkts-grammar-standards` | ArkTS 语法、限制和 TypeScript 差异 | `SKILL.md` 与 4 个 `references/` 文件，共 5 个文件 |
| `arkui-knowledge` | ArkUI 组件与 UI 开发知识 | `SKILL.md` 与 4 个 `references/` 文件，共 5 个文件 |

#### 2.4.1 审查结论与安装边界

安装前同时打开了三个 SkillsMP 介绍页和对应的固定标签源码，完整阅读各自的 `SKILL.md`，并检查目录树、伴随文件和可执行权限。三个目录中没有 `scripts/`、二进制文件或带可执行权限的文件；内容为 Markdown、JSON 和用于说明的 `.ets` 示例。针对常见高风险命令（如管道执行下载脚本、`rm -rf`、`sudo`、`eval`）的文本扫描没有命中。也就是说，安装动作仅复制本地知识资料，不会自动执行示例或连接设备。

仍需保留两类风险意识：参考资料和示例可能随 DevEco SDK 与 ArkUI API 演进而过时；`arkts-error-fixes` 给出的修改建议应在当前 SDK 中重新编译，并在目标鸿蒙 PC 设备或模拟器中验证，不能把示例结论直接当作无条件修复方案。固定标签安装的目的，是避免把审查后新增的上游变更一并引入。

#### 2.4.2 首选命令的实际结果与回退安装

发布页给出的首选命令如下，三个技能均可按同一模式指定名称：

```bash
npx skills add https://github.com/CarSmallGuo/deveco-code --skill arkts-error-fixes
npx skills add https://github.com/CarSmallGuo/deveco-code --skill arkts-grammar-standards
npx skills add https://github.com/CarSmallGuo/deveco-code --skill arkui-knowledge
```

本次实际尝试第一条命令后，安装器能够克隆仓库，但只能发现仓库根级登记的技能，报出 `No matching skills found for: arkts-error-fixes`；原因是三个目标位于仓库深层的 `packages/opencode/resources/skills/`，没有被该安装器识别。因此没有把“命令执行过”误写成安装成功，而是采用完整目录回退安装。

最终按 Codex 的目录约定，将每个完整技能目录直接安装到 `~/.codex/skills/`，而不是仅以符号链接暴露给 Codex。安装时从固定标签源码复制每个完整技能目录，保留其相对结构；已有的 `arkts-error-fixes` 和 `arkts-grammar-standards` 在原 DevEco 目录中的旧版本先移动到 `/private/tmp/deveco-skill-backup-20260814/` 备份，随后再安装固定版本。这样既不会把 `SKILL.md` 单独拆出，也不会在项目目录中留下难以同步的副本。

```bash
# 以固定标签源码目录为输入；对每个技能复制完整目录，而非单个 SKILL.md
cp -pR /private/tmp/deveco-code-skills-review/packages/opencode/resources/skills/arkui-knowledge \
  ~/.codex/skills/arkui-knowledge
```

#### 2.4.3 安装后验证

安装后逐个确认三个 Codex 目标目录含有 `SKILL.md`、且不是符号链接；随后使用 `diff -qr` 将安装目录与固定标签源码逐文件比较。结果为三个目录均完全一致，文件数分别为 65、5、5。可复用以下命令进行验证：

```bash
for skill in arkts-error-fixes arkts-grammar-standards arkui-knowledge; do
  test -d ~/.codex/skills/$skill
  test ! -L ~/.codex/skills/$skill
  test -f ~/.codex/skills/$skill/SKILL.md
  find ~/.codex/skills/$skill -type f | wc -l
done

diff -qr \
  /private/tmp/deveco-code-skills-review/packages/opencode/resources/skills/arkui-knowledge \
  ~/.codex/skills/arkui-knowledge
```

Codex 通常会在下一次会话或重新加载技能清单时发现新安装的目录；在当前会话中，应以实际可见的技能清单为准。

### 2.5 创建并配置项目

<!-- TODO: 新建鸿蒙 PC 工程的步骤、关键配置项（bundleName、设备类型等） -->

## 三、用 AI 编写完整应用：从 0 到 1

<!-- TODO: 以一个具体 demo 应用为例（如待办/记事本/计算器），演示 AI 辅助开发的完整过程 -->

### 3.1 需求与界面设计

<!-- TODO: 用自然语言向 Codex 描述需求，生成 ArkUI 界面骨架 -->

### 3.2 业务逻辑生成

<!-- TODO: 用 AI 生成状态管理、数据持久化等核心逻辑，并人工 review -->

### 3.3 鸿蒙系统能力接入

<!-- TODO: 调用 @ohos.* / @kit.* 能力（如文件、网络、通知），让 AI 给出正确 API 用法 -->

### 3.4 代码 review 与最小修改

<!-- TODO: 强调不盲信 AI 生成结果，逐段核对、最小化修改 -->

## 四、调试与真机运行

<!-- TODO: 在鸿蒙 PC 设备/模拟器上运行、断点调试、日志查看 -->

### 4.1 运行到鸿蒙 PC

<!-- TODO: 连接设备、签名、运行 -->

### 4.2 运行时崩溃定位

遇到 ArkTS/JavaScript 运行时崩溃时，可以让 Codex 调用前文安装的 `arkts-runtime-fix`：先从已有 `jscrash` 日志中提取异常类型、源码位置和调用栈；证据不足时再通过 `hdc` 检查 `faultlogger`、拉取故障日志或采集限定时间范围的 `hilog`。日志采集与代码修改应分开进行，先保留原始证据，再根据最小复现定位根因，修复后重新构建并在同一设备上验证。

### 4.3 运行截图

<!-- TODO: 插入在鸿蒙 PC 上运行的完整界面截图，需能一眼看出是鸿蒙 PC（含 ALT 描述） -->

![鸿蒙PC运行效果](<!-- TODO: 截图路径 -->)

## 五、打包与发布

<!-- TODO: HAP / APP 打包、签名、上架 AppGallery Connect 流程 -->

### 5.1 打包 HAP

<!-- TODO -->

### 5.2 签名与发布

<!-- TODO -->

## 六、踩坑与经验

<!-- TODO: 列出开发过程中遇到的典型问题与解决办法 -->

| 问题 | 原因 | 解决办法 |
| --- | --- | --- |
| 本地已由 DevEco 管理同一 Skill，Codex 也需要发现它 | 分别复制到两个目录会形成多份内容，升级或修复时容易产生版本漂移 | 以 `~/.local/share/deveco/skills/<skill>` 作为唯一内容源，再在 `~/.codex/skills/<skill>` 创建同名符号链接；创建前确认链接目标和目录完整性 |
| 已存在的 Skill 无法直接重装 | 发现路径是符号链接，且本地内容比远端固定版本更完整 | 固定远端版本，比较完整目录，仅合并缺失文件并保留单一内容源 |
| 日志解析脚本可运行，但设备日志采集失败 | `hdc` 不可用、设备未连接或目标设备选择错误 | 先检查 `hdc` 和设备列表，再运行设备侧采集脚本 |
| 故障日志包含不宜公开的信息 | `faultlogger`/`hilog` 可能记录路径、Bundle 名称和运行时数据 | 对外粘贴或提交日志前进行脱敏 |

如果本地已经通过 DevEco 管理某项技能，推荐使用软链接而不是再复制一份：DevEco 目录保存完整技能，Codex 目录只负责发现。这样维护、升级和回滚都只作用于唯一内容源。若希望 Codex 独立管理技能，则像本次新增的三个技能一样直接安装到 `~/.codex/skills/`，不要同时把两份目录都当作可写主副本。

## 七、总结

<!-- TODO: 回顾全流程，总结 Codex 在鸿蒙 PC 开发中的价值与适用场景，给出后续学习/进阶方向 -->

## 参考与延伸

- 开源鸿蒙 PC 社区：[https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
- PC 社区项目平台（AtomGit）：[https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)
- `arkts-runtime-fix` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-runtime-fix)
- `arkts-runtime-fix` 固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-runtime-fix)
- `arkts-error-fixes` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-error-fixes)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-error-fixes)
- `arkts-grammar-standards` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-grammar-standards)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-grammar-standards)
- `arkui-knowledge` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkui-knowledge)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkui-knowledge)
- <!-- TODO: Codex 官方文档链接 -->
- <!-- TODO: 本文 demo 代码仓库（托管至 AtomGit PC 仓） -->
