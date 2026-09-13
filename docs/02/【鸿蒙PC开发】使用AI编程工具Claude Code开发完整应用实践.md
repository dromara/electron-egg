<!-- TODO: 发布时补充 Schema.org 结构化数据（BlogPosting），标注 headline / author / datePublished / mainEntity -->

# 【鸿蒙PC开发】使用AI编程工具Claude Code开发完整应用实践

> **欢迎加入开源鸿蒙PC社区：** [https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
>
> **欢迎在PC社区平台申请新建项目：** [https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)

## 摘要

本文记录了使用 Claude Code 辅助开发鸿蒙 PC 应用的完整实践，覆盖环境准备、应用开发、运行时诊断、真机调试与打包发布。文章以一个真实项目为例——**3D 看车应用**：用 three.js 程序化构建全尺寸 SUV 车模，支持车漆 / 轮毂换装、展厅 / 户外双场景、预设视角飞行、车灯车门动画与截图，构建后的前端资源最终打包进 HAP 工程，由鸿蒙 PC 的 ArkWeb WebView 加载运行。过程中解决了一批实际问题：three.js r185 API 变更引发的运行时 TypeError、HAP 部署时设备连接故障（ErrorCode:00404039）等。此外，运行时诊断部分引入 `arkts-runtime-fix` Agent Skill，并以一次真实安装为例，说明如何在执行第三方安装操作前核对来源、审查脚本风险、处理已有安装冲突，以及验证技能目录和解析脚本是否完整可用。

## 一、Claude Code 简介

Claude Code 是 Anthropic 推出的 AI 编程工具，可直接在终端里以对话方式参与编码：读懂工程上下文、生成与修改代码、执行命令、按任务加载 Agent Skill。对鸿蒙 PC 开发而言，它既能辅助 ArkTS / ArkUI 编码，也能辅助 Vue + Electron 这类「前端资源跑在鸿蒙 WebView 里」的应用开发——本文 3.1～3.4 节演示的就是后一条路径。

### 1.1 它能做什么

在本文的 3D 看车项目中，Claude Code 实际完成了以下工作：

- **代码生成与补全**：根据一句话需求生成完整工程骨架与业务代码（Vue 页面、three.js 车模、Electron 主进程控制器）
- **架构设计**：把一段文字需求拆解为可落地的分层结构（页面壳 + three.js 模块 + IPC 控制器 + 内嵌配置）
- **鸿蒙 ArkTS / ArkUI 语法纠错**：对 ArkTS 工程提供编译与类型错误修复建议（见 2.4 的 `arkts-error-fixes`）
- **鸿蒙系统能力（@ohos.* / @kit.*）API 建议与用法**：给出符合当前 SDK 的接口、权限与替代方案
- **运行时崩溃（jscrash / hilog）辅助诊断**：通过 `arkts-runtime-fix` Agent Skill 自动提取异常类型、源码位置与调用栈（见 2.3）
- **鸿蒙 PC 运行适配**：识别 WebView 无 Electron API 的环境差异，落地前端自包含降级方案（见 3.3）
- **部署问题定位**：HAP 推送失败时，用 hdc 设备侧证据收敛根因，而不是凭报错文案猜（见 4.3）
- **按任务加载 Agent Skill**：复用可审查的诊断流程和脚本

### 1.2 与传统开发方式对比

开发鸿蒙 PC 应用有两种典型路径：一种是传统手写开发，从零学习 ArkTS 语法与 ArkUI 组件体系，在 `@ohos.*` / `@kit.*` 文档中逐条查找接口，遇到运行时崩溃再在 `jscrash` / `hilog` 日志里手工定位；另一种是借助 Claude Code 这类 AI 编程工具，用自然语言描述需求、生成代码，并把排障方法固化为可复用的 Agent Skill。两者的差异不只在打字速度上，更体现在学习成本、排错方式与经验沉淀方式上。

| 维度 | 传统手写开发 | Claude Code AI 辅助 |
| --- | --- | --- |
| 上手门槛 | 需先掌握 ArkTS 语法、ArkUI 组件体系与工程结构，新手通常要数周才能独立写出可运行的界面 | 用自然语言描述界面与逻辑即可生成骨架代码，新手当天即可跑通可运行的 Demo |
| ArkTS 语法熟悉成本 | 需系统阅读官方语法规范，靠编译器报错逐步纠正，容易卡在类型限制（禁止 `any`、严格空安全）与声明式 UI 写法上 | 生成代码默认贴合 ArkTS 规范；编译报错可直接交给 Claude Code 解释并修复，熟悉成本明显下降 |
| 鸿蒙 API 查找效率 | 在 `@ohos.*` / `@kit.*` 文档、社区帖子与示例工程之间反复切换，还需自行判断接口是否已过时 | 直接提问即可得到符合当前 SDK 的 API 建议、用法与权限说明，还能获得替代方案 |
| 崩溃定位速度 | 面对 `jscrash` / `hilog` 的海量日志手工逐行分析，调用栈与源码对不上时尤其耗时 | 通过 `arkts-runtime-fix` 等 Agent Skill 自动提取异常类型、源码位置与调用栈，必要时再用 `hdc` 拉取设备日志，快速收敛根因 |
| 排错经验与知识的沉淀 | 结论散落在个人记忆与聊天记录中，难以复用和共享 | 把稳定的排障方法固化到 Agent Skill，一次审查、处处复用，新成员也能按同一套流程排障 |
| 结果可靠性 | 代码完全可控，质量取决于个人经验与审查习惯 | 生成速度快，但需人工 review，边界条件与权限、安全细节必须由人确认，不能盲信 |

#### 三处关键变化

**从「查文档」到「对话式生成」**。传统开发有相当一部分时间花在「找 API」上：先确认接口名，再看参数、权限与版本，最后还要贴进工程验证。Claude Code 可以直接根据需求给出可用写法，把「找到可用 API」的耗时压缩到一次对话。不过生成结果是否适用于当前 SDK 版本，仍要以[华为开发者文档](https://developer.huawei.com/consumer/cn/doc/)与 [OpenHarmony 官方文档](https://docs.openharmony.cn/)为准。

**从「读报错」到「解释报错」**。ArkTS 在 TypeScript 基础上做了严格类型限制，新手常被一长串编译错误挡住。传统做法是把错误粘贴到搜索框逐条理解；Claude Code 能直接解释错误成因并给出最小修复，把「理解错误」本身变成一项辅助能力。

**从「个人经验」到「可审查的 Skill」**。传统排障依赖个人积累；借助 Agent Skill，可以把一套经过审查的诊断流程交给 AI 按需调用，流程公开、脚本可审查、结论可复现（见第 2.3 节）。这能让「排障能力」从个人属性变成团队资产。

#### 边界与原则

对比不是为了说明「AI 能替代开发」，而是强调「AI 辅助可以缩短到第一个可运行版本的距离」。Claude Code 生成的代码仍可能引用过时的 API、遗漏权限声明，或在边界条件下出错，因此本文贯穿两条原则：**先审查后执行**——安装操作、脚本与设备访问都要核对来源再运行；**逐段 review、最小化修改**——不整段盲贴生成结果，只采纳理解并验证过的改动。这两条原则在 2.3 节（技能安装）与 3.4 节（代码 review）中都有具体演示。

## 二、开发环境准备

鸿蒙 PC 开发环境由两部分组成：一是 DevEco Studio + 鸿蒙 SDK（负责 HAP 编译、签名、部署到模拟器 / 真机）；二是本项目用到的 Claude Code 与 Agent Skill（负责代码生成与运行时诊断）。本节按依赖顺序逐个准备。

### 2.1 软件与硬件要求

本文项目使用的环境如下：

| 项 | 要求 | 本次使用 |
| --- | --- | --- |
| 开发机操作系统 | macOS / Windows / Linux | macOS（M 芯片） |
| DevEco Studio | 随鸿蒙 SDK 一起安装 | 6.1 |
| 鸿蒙 SDK | 与 DevEco Studio 配套安装 | OpenHarmony SDK 23 |
| 鸿蒙 PC 设备 | 真机（USB 调试）或模拟器 | 本机模拟器「MateBook Pro 14」 |
| Node.js | ≥ 20.19.0（ElectronEgg 要求） | v22 |
| 包管理器 | npm / pnpm | npm |
| Claude Code | 命令行工具 + 已登录账号 | 最新版 |

> 说明：鸿蒙 Electron 产物是构建好的 **arm64** 架构软件。macOS M 芯片电脑可直接用本地模拟器调试；Windows / macOS Intel 电脑建议改用鸿蒙真机。

### 2.2 安装 Claude Code

Claude Code 是 Anthropic 推出的 AI 编程工具，在终端里直接对话式开发。安装方式任选其一：

```bash
# npm 安装（推荐，macOS / Linux / Windows 通用）
npm install -g @anthropic-ai/claude-code
```

安装后在项目目录执行 `claude` 启动会话，首次使用按提示登录 Claude 账号。建议在项目根目录维护一份 `CLAUDE.md`，写明工程结构、架构约定与常用命令——Claude Code 每次会话都会自动加载它，生成的代码会更贴合本项目风格。本项目正是通过它让 AI 理解 ElectronEgg 的 controller 自动注册、Bundle 构建、鸿蒙资源同步等约定。

> 更详细的安装与配置见 [Claude Code 官方文档](https://code.claude.com/docs)。

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

#### 2.3.2 安装方式与已有安装冲突

Claude Code 通过 `~/.claude/skills/`（用户级）目录发现技能，安装就是把技能以完整目录放进去：目录内含 `SKILL.md`（带 `name` / `description` frontmatter）及其引用的 `scripts/`、`reference/` 等伴随文件。发布方以 Git 标签发布技能，因此本次先把固定版本检出到临时目录（见 2.3.1），再将 `arkts-runtime-fix` 目录放入 `~/.claude/skills/`。

放入后还要确认发现路径，不能仅凭复制完成判断安装成功。本次机器上已经存在系统级 DevEco 技能目录，并通过符号链接提供给 Claude Code 发现：

```text
~/.local/share/deveco/skills/arkts-runtime-fix   # 唯一内容源
~/.claude/skills/arkts-runtime-fix               # 指向上方目录的符号链接
```

现有版本还带有扩展的 `reference/` 崩溃知识库，而固定标签版本没有这些增强内容。直接复制完整目录可能因目标是符号链接而失败，也可能覆盖或降级已有内容。因此本次没有盲目覆盖，而是把固定版本与现有目录逐项比较：固定版本的全部 `.mjs` 文件与本地版本字节一致，本地仅缺少 8 个 `.ts` 源码伴随文件。最终保留现有 `SKILL.md`、`SKILL_CN.md`、`.version` 和 `reference/`，只补齐缺失的 `.ts` 文件，继续维持单一全局内容源。

如果是全新环境，可以把固定版本目录整体复制到 `~/.claude/skills/`；如果目标已经存在，应先确认它是普通目录还是符号链接，再比较文件树和内容差异。不要直接覆盖，更不要把系统级技能复制进单个项目形成多个失去同步的副本。

#### 2.3.3 安装后验证

验证分为目录完整性、脚本语法和最小功能三层。首先检查发现路径、符号链接目标和关键文件：

```bash
readlink ~/.claude/skills/arkts-runtime-fix
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

### 2.5 四个技能的源头仓库与更新方式

2.3 与 2.4 安装的四个技能（`arkts-runtime-fix`、`arkts-error-fixes`、`arkts-grammar-standards`、`arkui-knowledge`）并非独立发布的第三方技能，而是 **DevEco Code CLI（`deveco` 命令）的内置资源**。事后逐项溯源与 diff 后，完整链路如下：

```text
gitcode.com/openharmony-sig/deveco-code          # 官方源头仓库
└─ packages/opencode/resources/skills/           # 四个技能的源码目录
     ↓ 构建时内嵌
@deveco/deveco-code（npm 包，bin/deveco 二进制）
     ↓ CLI 启动 / 升级时自动解包
~/.local/share/deveco/skills/                    # 旧版（≤0.1.7）解包位置
~/.config/deveco/skills/                         # 新版（0.1.12+）解包位置
     ↓ 手动复制
~/.claude/skills/                                # Claude Code 的发现目录
```

本文 2.3 中固定的 GitHub 仓库 `CarSmallGuo/deveco-code` 是该官方仓库的 **fork 镜像**，`0.1.0-TD.4` 对应其上的同名分支。

#### 2.5.1 本地安装与源仓库的实测对比

把本地 `~/.claude/skills/` 与源仓库 `master` 分支及 `v0.1.12` 标签逐文件 `diff -rq` 对比：

| 技能 | 与源仓库 master 的对比结果 |
| --- | --- |
| `arkts-error-fixes` | 完全一致 |
| `arkts-grammar-standards` | 完全一致 |
| `arkui-knowledge` | 完全一致 |
| `arkts-runtime-fix` | **本地版更新**：`SKILL.md` / `SKILL_CN.md` 有差异，且多出 `reference/` 崩溃知识库、8 个 `.ts` 源文件与 `.version`。这些增强内容不存在于源仓库任何公开分支，只内嵌于 npm 发布二进制（内部构建产物） |

两点值得注意：其一，`arkts-runtime-fix` 的权威源头是 **npm 二进制**而非 gitcode 公开源码，从仓库克隆更新它反而会降级（丢失 `reference/` 知识库），2.3.2 的「保留现有增强、只补缺失文件」正是这个原因；其二，源仓库的演进快于 npm 发布——master/weekly 分支上已出现 `dfx-analyzer`、`customize-deveco`、`deveco-cli` 等新技能，且 `v0.1.12` 标签中 `arkui-knowledge` 已被合并进 `arkts-grammar-standards` 的新 references，但这些尚未随 npm 版发布。

#### 2.5.2 更新方式

| 场景 | 做法 |
| --- | --- |
| 常规更新（推荐） | `deveco upgrade` 升级 CLI，新版会把内置技能解包到 `~/.config/deveco/skills/`，再与 `~/.claude/skills/` 里的副本 diff，确认有变化后重新复制 |
| 从源头尝鲜 | `git clone https://gitcode.com/openharmony-sig/deveco-code`，取 `packages/opencode/resources/skills/` 下对应目录；**不要**用它更新 `arkts-runtime-fix`（会降级） |

```bash
# 升级后同步（以解包目录为准，逐项确认差异再覆盖）
diff -rq ~/.config/deveco/skills/arkts-error-fixes ~/.claude/skills/arkts-error-fixes
rm -rf ~/.claude/skills/arkts-error-fixes
cp -R ~/.config/deveco/skills/arkts-error-fixes ~/.claude/skills/
```

复制前应先确认目标是普通目录还是符号链接（见 2.3.2），并用 `deveco debug skill` 可以列出 CLI 当前实际加载的技能及其路径，用于核对解包位置与版本。本次（0.1.7 → 0.1.12）四个技能内容经 diff 均无变化，无需重新拷贝。

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

#### 2.4.2 按目录约定安装与旧版本备份

三个技能与 `arkts-runtime-fix` 一样，位于发布方仓库深层的 `packages/opencode/resources/skills/` 下，因此直接从固定标签源码复制完整目录到 `~/.claude/skills/`，而不是只复制单个 `SKILL.md`。复制时保留相对结构，避免技能内部引用失效。

已有版本需要先处理冲突：把 DevEco 目录中 `arkts-error-fixes` 和 `arkts-grammar-standards` 的旧版本先移动到 `/private/tmp/deveco-skill-backup-20260814/` 备份，随后再安装固定版本。这样既不会把 `SKILL.md` 单独拆出，也不会在项目目录中留下难以同步的副本。

```bash
# 以固定标签源码目录为输入；对每个技能复制完整目录，而非单个 SKILL.md
cp -pR /private/tmp/deveco-code-skills-review/packages/opencode/resources/skills/arkui-knowledge \
  ~/.claude/skills/arkui-knowledge
```

#### 2.4.3 安装后验证

安装后逐个确认三个 Claude Code 目标目录含有 `SKILL.md`、且不是符号链接；随后使用 `diff -qr` 将安装目录与固定标签源码逐文件比较。结果为三个目录均完全一致，文件数分别为 65、5、5。可复用以下命令进行验证：

```bash
for skill in arkts-error-fixes arkts-grammar-standards arkui-knowledge; do
  test -d ~/.claude/skills/$skill
  test ! -L ~/.claude/skills/$skill
  test -f ~/.claude/skills/$skill/SKILL.md
  find ~/.claude/skills/$skill -type f | wc -l
done

diff -qr \
  /private/tmp/deveco-code-skills-review/packages/opencode/resources/skills/arkui-knowledge \
  ~/.claude/skills/arkui-knowledge
```

Claude Code 通常会在下一次会话或重新加载技能清单时发现新安装的目录；在当前会话中，应以实际可见的技能清单为准。

### 2.6 创建并配置项目

ElectronEgg 采用「一套代码，桌面 + 鸿蒙」的方式：业务代码照常用 Vue + Electron 编写，构建产物通过 `ee-bin ohos` 同步到鸿蒙 HAP 工程（`ohos_hap/`），由 HAP 的 ArkWeb WebView 加载。因此「创建项目」包含两步。

**第一步：获取 ElectronEgg 示例工程并安装依赖**

```bash
git clone https://atomgit.com/wallace5303/ee-ability ee-ability
cd ee-ability
npm install                # 安装 ee-core / ee-bin 等框架依赖
npm run dev                # 桌面模式开发（frontend + electron）
```

**第二步：确认鸿蒙 HAP 工程结构**

`ohos_hap/` 是独立可编译的 DevEco 工程，`web_engine` 模块负责承载前端：

```text
ohos_hap/
├── AppScope/app.json5          # bundleName = com.electronegg.ohos（应用唯一标识）
└── web_engine/
    └── src/main/resources/resfile/resources/app/
        ├── electron/           # 打包后的主进程（main.js、preload/bridge.js）
        ├── dist/               # 打包后的前端资源
        └── public/             # 静态资源（html、images、预编译资源等）
```

`app.json5` 里的 `bundleName` 是应用唯一标识，后续安装、日志路径、部署排错都会用到，建议先记下。

**第三步：把构建产物同步到 HAP 工程**

```bash
npm run build-frontend          # 构建前端（Vite 产物 → frontend/dist）
npm run ohos-test               # 构建主进程 + 把 public 复制到 ohos_hap 资源目录
```

`ohos-test` 实际执行 `npm run build-electron && ee-bin ohos --cmds=test`：`build-electron` 用 esbuild 打包主进程（产出 `public/electron/main.js` 等），`ee-bin ohos --cmds=test` 把根 `public/` 拷贝到 `ohos_hap/web_engine/src/main/resources/resfile/resources/app/public`。之后用 DevEco Studio 打开 `ohos_hap` 即可编译部署（见第四章）。

## 三、用 AI 编写完整应用：从 0 到 1

本节以「3D 看车」应用为例，完整演示用 Claude Code 从一段自然语言需求到可运行应用的开发过程。项目参照 [hima.auto 的 3D 看车页](https://hima.auto/3d-view/)：用 three.js 程序化生成全尺寸 SUV 的 3D 车模，前端负责交互，Electron 主进程提供配置与截图保存能力，构建产物最终跑在鸿蒙 PC 上。

### 3.1 需求与界面设计

需求最初只有一句话：

> 参照 https://hima.auto/3d-view/ 这个 3D 页面，用 three.js 生成一个类似的全尺寸 SUV 3D 看车程序，需要用到 frontend 和 electron 主进程。

Claude Code 没有直接开写，而是先与用户确认三个关键取舍——车模来源（采用 three.js 程序化建模）、功能范围（标准版交互）、运行平台（构建产物要跑在鸿蒙 PC 上），再把这些结论拆成可落地的模块划分：

- **页面壳**（`frontend/src/views/example/car/Index.vue`）：画布 + 顶部信息栏 + 右侧操作栏 + 底部配色面板，深色高级感视觉，对齐目标站点的交互节奏
- **3D 查看器**（`three/CarViewer.js`）：renderer / scene / camera / OrbitControls / 动画循环 / 资源释放
- **程序化车模**（`three/buildCar.js`）：用基础几何体拼出风格化全尺寸旗舰 SUV
- **材质与环境**（`three/materials.js`、`three/environments.js`）：车漆 / 轮毂 / 玻璃材质工厂，展厅 / 户外双环境
- **相机飞行**（`three/cameraAnimator.js`）：零依赖的球坐标相机插值
- **内嵌配置**（`config.js`）：车漆、轮毂、视角、场景、文案——浏览器 / 鸿蒙模式的数据源
- **主进程控制器**（`electron/controller/car.ts`）：提供 `getConfig` / `saveScreenshot` 两个 IPC 接口

生成的第一版界面骨架遵循项目既定视觉约束：渐变主色（`#42d392 → #647eff`）、毛玻璃浮层（`backdrop-filter`）、圆角色卡与高光描边，观感与目标站点一致。

### 3.2 业务逻辑生成

核心逻辑分四块，均由 Claude Code 生成、再由人工 review：

**程序化车模**。车模用基础几何体拼装（程序化建模，不依赖外部模型文件）：`RoundedBoxGeometry` 做车身、引擎盖、尾箱盖、车顶；`CylinderGeometry` 横置做轮胎与轮毂；乘员舱用半透明玻璃材质；前后贯穿灯带用自发光材质。所有部件带 `name`，便于运行时按名字定位材质、车门与车灯；整车包围盒（`Box3`）决定相机距离与视角归一化。

**车漆换色**。车漆是 `MeshPhysicalMaterial`（`metalness: 1`、`clearcoat: 1`），切换时在动画循环里对颜色 `lerp` 平滑过渡，质感参数即时更新：

```js
setPaint (id) {
  const paint = this.config.paints.find((p) => p.id === id)
  // ...
  this.paintTarget = new THREE.Color(paint.color)
}
```

**双场景切换**。展厅用顶部 SpotLight + 深色反光地坪 + ShadowMaterial 阴影；户外用 Sky 天空 + 太阳平行光 + 半球环境光。切换 = 灯光 / 地面 / 背景显隐 + 环境光强度过渡。

**IPC 控制器**。主进程 `car.ts` 暴露 `controller/car/getConfig` 与 `controller/car/saveScreenshot` 两个 channel，方法签名遵循 ElectronEgg 约定 `(params, event)`。截图保存到系统图片目录下的专用文件夹，重名自动加 `-1` 去重，异常不抛出、只返回错误信息。

### 3.3 鸿蒙运行能力接入

这是本项目最有价值的部分：**构建后的前端资源要跑在鸿蒙 PC 上，而鸿蒙端没有 Electron 的 IPC / 文件系统能力**。ElectronEgg 的鸿蒙方案是——业务代码照常依赖 Electron，但构建产物交给 HAP 工程的 ArkWeb WebView 加载。于是前端必须做到「无 Electron 也能降级运行」。

做法是在一个工具函数里判定运行环境：

```js
// frontend/src/utils/ipcRenderer.js
const ipc = Renderer.ipcRenderer || undefined
const isEE = ipc ? true : false   // 存在 ipcRenderer 才是 Electron 环境
```

- **Electron 桌面端**（`isEE === true`）：走 `ipc.invoke('controller/car/getConfig')` 拉取配置，截图交给主进程落盘
- **鸿蒙 ArkWeb / 纯浏览器**（`isEE === false`）：用内嵌 `config.js` 作为数据源，截图降级为页面内预览 modal（`canvas.toDataURL()` → `<img>`，可手动另存）

再配合两处工程配置，保证构建产物可直接以 `file://` / HAP resfile 相对路径加载：

- Vite 设置 `base: './'`——产物内的资源引用改为相对路径
- 路由使用 hash 模式（`createWebHashHistory`）——WebView 加载 `index.html` 后无需服务端路由支持

这套「同构配置 + 双模式截图」让一份代码同时跑在 Electron 桌面与鸿蒙 PC 上，是本案例中 Claude Code 给出的最有迁移价值的降级方案。

### 3.4 代码 review 与最小修改

AI 生成代码不等于正确代码。本文项目在运行期暴露过问题，遵循「先拿证据、再做最小修复」：

**three.js r185 移除了 `Color.distanceTo`，运行时 TypeError。** 用户在点击「俯瞰」「户外」时报告 `CarViewer.js:178 Uncaught TypeError: m.color.distanceTo is not a function`。先核对当前安装的 three 版本（`^0.185.1`），确认该 API 在 r185 被移除，再修复。修复不做大改，只在换色收敛判断里用手写欧氏距离替代：

```js
m.color.lerp(this.paintTarget, 0.15)
const dx = m.color.r - this.paintTarget.r
const dy = m.color.g - this.paintTarget.g
const dz = m.color.b - this.paintTarget.b
const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
if (dist < 0.003) { m.color.copy(this.paintTarget) }
```

教训与第 1.2 节的「边界与原则」一致：**先审查后执行**（不盲信生成代码与外部依赖）、**逐段 review、最小化修改**（只改收敛判断，不动整个换色流程）。

## 四、调试与真机运行

本节覆盖从「把 HAP 部署到鸿蒙 PC」到「运行时与部署故障定位」的完整调试链路：4.1 用 DevEco Studio + hdc 把应用跑起来，4.2 讲运行时崩溃定位（ArkTS 与前端各一例），4.3 记录一次 HAP 部署报错的完整排障过程。

### 4.1 运行到鸿蒙 PC

在 DevEco Studio 中打开 `ohos_hap` 工程，首次运行配置签名后，把模拟器或真机接入开发机，点击「运行」即可自动完成编译 HAP、签名、安装与启动。本文项目跑在鸿蒙模拟器「MateBook Pro 14」上（arm64 架构，需 M 芯片 Mac）。

部署链路的核心工具是 `hdc`（HarmonyOS Device Connector）。DevEco Studio 打包时内置了 hdc，但**通常不在系统 PATH 中**，手动排障时先定位到它的可执行文件：

```bash
# DevEco Studio 内置 hdc 的常见路径
/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains/hdc
# 或 OpenHarmony SDK 独立安装目录
~/Library/OpenHarmony/Sdk/<version>/toolchains/hdc
```

建议把 hdc 加入 PATH 并确认设备在线：

```bash
export PATH="/Applications/DevEco-Studio.app/Contents/sdk/default/openharmony/toolchains:$PATH"
hdc list targets            # 查看已连接设备 / 模拟器
```

> 注意：模拟器会同时注册 TCP 与 USB 两个条目（例如 `127.0.0.1:5555` 与 `86E0226325001360`）。直接 `hdc shell` 会提示 `need connect-key? please confirm a device`，此时用 `hdc -t <target>` 显式指定目标设备。

### 4.2 运行时崩溃定位

遇到 ArkTS/JavaScript 运行时崩溃时，可以让 Claude Code 调用前文安装的 `arkts-runtime-fix`：先从已有 `jscrash` 日志中提取异常类型、源码位置和调用栈；证据不足时再通过 `hdc` 检查 `faultlogger`、拉取故障日志或采集限定时间范围的 `hilog`。日志采集与代码修改应分开进行，先保留原始证据，再根据最小复现定位根因，修复后重新构建并在同一设备上验证。

本文项目还遇到一次**前端运行期 TypeError**：用户在点击「俯瞰」「户外」时页面报 `CarViewer.js:178 Uncaught TypeError: m.color.distanceTo is not a function`。定位思路与 ArkTS 崩溃一致——先拿到异常类型与调用位置，再核对依赖版本：当前安装的 three `^0.185.1` 已移除 `Color.distanceTo`，而生成代码仍调用旧 API。修复只改收敛判断一处（用手写欧氏距离替代），完整过程见 3.4。

### 4.3 HAP 部署故障定位（ErrorCode:00404039）

首次把 HAP 部署到模拟器时，DevEco Studio 在「HAP 推送」阶段报错：

```text
execute sendRemoteCommand exception
ErrorCode:00404039  ErrorDescription:在HAP推送操作期间创建临时目录失败
```

报错发生在 `hdc shell mkdir data/local/tmp/<hash>` 这一步，很容易先怀疑「设备空间满」或「权限不足」。但用 hdc 实测设备侧证据后，**两个都不是**：

| 检查项 | 结果 | 结论 |
| --- | --- | --- |
| `/data` 剩余空间 | 294G 可用（35% 使用） | 排除空间不足 |
| `/data/local/tmp` 权限 | `drwxrwx--x shell shell`，shell 可写 | 排除权限问题 |
| 重跑失败命令 `mkdir -p /data/local/tmp/zz_test` | MKDIR_OK | 设备侧功能正常 |

真正根因是**本地 hdc server 进入病态**：排查时发现一个从早上挂到现在的 stale hdc 进程，新起的 hdc 客户端连它都报 `Connect server failed`；DevEco Studio 虽保持连接，但底层设备会话已坏，于是 `hdc shell mkdir` 在坏会话上失败，DevEco 只把它包装成 00404039。修复很简单：

```bash
hdc kill && hdc start      # 重启本地 hdc server
hdc list targets -v        # 设备重新在线
```

重启后 DevEco 自动重连，重新部署即成功。这条经验说明：**遇到部署失败先别急着归因设备，先检查 hdc 链路本身**——server 是否健康、目标设备是否在线、多个设备条目是否需 `-t` 指定。

### 4.4 运行截图

应用在鸿蒙 PC 模拟器「MateBook Pro 14」上运行的效果：

![3D 看车应用在鸿蒙 PC 上的运行界面——3D 车模居中展示，顶部为品牌与参数信息栏，右侧为视角 / 场景 / 车灯 / 车门操作栏，底部为车漆轮毂配色面板](./ee-example-16.jpg)

![3D 看车应用切换场景与视角后的运行效果——车模在不同环境光照下的展示](./ee-example-17.jpg)

## 五、打包与发布

HAP 打包分两步：先由 ElectronEgg 侧构建并同步资源，再由 DevEco Studio 编译出 HAP。本节覆盖本地打包与调试签名，正式上架细节以华为官方文档为准。

### 5.1 打包 HAP

HAP 的编译由 DevEco Studio 完成，但资源要先由 ElectronEgg 侧准备好：

```bash
npm run build-m            # 构建并打包 mac-arm64 桌面产物
npm run ohos               # 把产物同步到 ohos_hap 资源目录（ee-bin ohos --cmds=resources）
```

快速迭代阶段可跳过完整打包，直接 `npm run ohos-test` 复制未打包资源，便于改完代码立刻在模拟器验证。随后在 DevEco Studio 打开 `ohos_hap`，选择目标设备，点击「Build > Build Hap(s)/APP(s)」或直接「运行」，产物即 HAP 安装包。

### 5.2 签名与发布

- **调试签名**：DevEco Studio 首次运行会自动生成调试签名，模拟器与已授权真机可直接安装。
- **发布签名**：上架前需在开发者后台申请发布证书与 Profile，并在工程中配置。
- **上架 AppGallery Connect**：上传 HAP、填写应用信息、提交审核，涉及权限声明与隐私政策等合规项。

> 本文聚焦开发与本地部署，正式上架流程（证书申请、AGC 配置、审核）以[华为开发者文档](https://developer.huawei.com/consumer/cn/doc/)为准。

## 六、踩坑与经验

下表汇总了本文项目（含技能安装与鸿蒙部署阶段）遇到并解决的典型问题。

| 问题 | 原因 | 解决办法 |
| --- | --- | --- |
| 本地已由 DevEco 管理同一 Skill，Claude Code 也需要发现它 | 分别复制到两个目录会形成多份内容，升级或修复时容易产生版本漂移 | 以 `~/.local/share/deveco/skills/<skill>` 作为唯一内容源，再在 `~/.claude/skills/<skill>` 创建同名符号链接；创建前确认链接目标和目录完整性 |
| 已存在的 Skill 无法直接重装 | 发现路径是符号链接，且本地内容比远端固定版本更完整 | 固定远端版本，比较完整目录，仅合并缺失文件并保留单一内容源 |
| 日志解析脚本可运行，但设备日志采集失败 | `hdc` 不可用、设备未连接或目标设备选择错误 | 先检查 `hdc` 和设备列表，再运行设备侧采集脚本 |
| 故障日志包含不宜公开的信息 | `faultlogger`/`hilog` 可能记录路径、Bundle 名称和运行时数据 | 对外粘贴或提交日志前进行脱敏 |
| 从其他 AI 工具生态迁移技能，Claude Code 未发现该技能 | 技能 `SKILL.md` 缺少 Claude Code 要求的 `name` / `description` frontmatter | 补齐 frontmatter 后重启会话或重新加载技能清单 |
| `hdc: command not found` | hdc 未加入系统 PATH（DevEco 内置 hdc 在应用安装目录内） | 定位 DevEco SDK 下的 hdc 并加入 PATH，或用全路径调用 |
| `hdc shell` 提示 `need connect-key? please confirm a device` | 模拟器同时注册 TCP 与 USB 两个设备条目，hdc 要求明确选择 | 用 `hdc -t <target>` 显式指定目标设备 |

如果本地已经通过 DevEco 管理某项技能，推荐使用软链接而不是再复制一份：DevEco 目录保存完整技能，Claude Code 目录只负责发现。这样维护、升级和回滚都只作用于唯一内容源。若希望 Claude Code 独立管理技能，则像本次新增的三个技能一样直接安装到 `~/.claude/skills/`，不要同时把两份目录都当作可写主副本。

## 七、总结

从「参照 hima.auto 生成 3D 看车程序」这一句话需求，到同时跑通 Electron 桌面与鸿蒙 PC 的可运行应用，整个开发过程验证了 Claude Code 在鸿蒙 PC 应用开发中的实际价值：

1. **把模糊需求变成工程方案**：一句话需求被拆成页面、3D 模块、控制器、内嵌配置的清晰分层，生成代码贴合项目既有风格与框架约定。
2. **代码质量仍靠人工把关**：程序化车模、材质系统、IPC 控制器等核心逻辑一次成型，但运行期仍可能暴露问题（如 r185 API 变更），靠「先拿证据、最小修复」解决，不能盲信。
3. **鸿蒙适配的降级思路最值得复用**：`isEE` 判定 + 内嵌配置 + 双模式截图，让同一份前端在 Electron 与 ArkWeb 下都可用。
4. **部署排障靠证据链**：00404039 这类设备相关报错，先用 hdc 实测（空间、权限、重跑命令）排除设备侧，再定位到 hdc server 病态，比凭报错文案猜快得多。

后续进阶方向：接入更精细的高模模型与 PBR 贴图；把车漆 / 轮毂配置服务化（运行时拉取）；截图从 `toDataURL` 升级为主进程原生截图；探索鸿蒙端更多系统能力（窗口、分享、文件）与 Electron 侧的对应实现。Claude Code 适合做「把想法快速变成可运行原型」的加速器，而工程化与正确性，始终需要开发者自己把关。

## 参考与延伸

- 开源鸿蒙 PC 社区：[https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
- PC 社区项目平台（AtomGit）：[https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)
- `arkts-runtime-fix` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-runtime-fix)
- `arkts-runtime-fix` 固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-runtime-fix)
- `arkts-error-fixes` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-error-fixes)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-error-fixes)
- `arkts-grammar-standards` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkts-grammar-standards)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkts-grammar-standards)
- `arkui-knowledge` 技能介绍：[SkillsMP](https://skillsmp.com/creators/carsmallguo/deveco-code/packages-opencode-resources-skills-arkui-knowledge)，固定版本源码：[GitHub](https://github.com/CarSmallGuo/deveco-code/tree/0.1.0-TD.4/packages/opencode/resources/skills/arkui-knowledge)
- Claude Code 官方文档：[https://code.claude.com/docs](https://code.claude.com/docs)
- ElectronEgg 框架仓库：[AtomGit](https://atomgit.com/dromara/electron-egg) · 示例工程（ohos 分支）：[electron-egg-ohos](https://atomgit.com/wallace5303/electron-egg-ohos.git)
- 本文 demo（3D 看车应用）代码仓库：[AtomGit](https://atomgit.com/wallace5303/ee-ability)
- 参照的 3D 看车页：[hima.auto/3d-view](https://hima.auto/3d-view/)
