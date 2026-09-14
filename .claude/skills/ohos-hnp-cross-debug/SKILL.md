---
name: ohos-hnp-cross-debug
description: 排查 ElectronEgg OpenHarmony（ohos_hap）版本中，通过 HNP 启动的 cross 子进程（goapp/Java/Python）无响应、僵尸、启动即退出等问题。涉及日志辨认、HAP 资源同步、hvigor 调用、ee-core cross 模块限制、OHOS 沙箱权限等实战经验。
---

# OHOS + HNP cross 子进程排障

本技能沉淀自一次真实排障：goapp（Go 后端）在 OHOS 真机上以 HNP 方式启动后，
`ps -ef` 显示为僵尸进程（`[/data/app/goapp]` 带方括号），curl 请求返回
`Recv failure: Connection reset by peer`。适用于任何用 `cross.run()` 启动
Go/Java/Python 子进程、在 OHOS 上表现异常的场景。

## 1. 先看对日志文件

`ee-core` 有两套独立的日志：

- `ee-core.*.log` —— 框架内部日志（`coreLogger`），只有 `[cross/run] cmd: ...`
  这类框架自己打的行，**不包含**业务代码 `logger.info()` 的输出。
- `ee.*.log` —— 应用层日志，业务代码（如 `service/cross.ts` 里的
  `logger.info('[go] ...')`）的输出都在这里。

**排障时先查 `ee.*.log`，不要只查 `ee-core.*.log`**——否则会看到"框架启动了
子进程但没有任何异常"的假象，实际错误信息（子进程 stdout/stderr）都在
`ee.*.log` 里。

```bash
hdc file recv /data/app/el2/100/base/<bundleName>/files/ee/logs/ee.$(date +%Y-%m-%d).1.log /tmp/ee_app.log
grep "\[go\]" /tmp/ee_app.log   # 按 cross.run 里用的 name 过滤
```

## 2. 子进程报错默认不可见，需临时接管 stdio

`cross.run()` 默认 `stdio` 可能是 `ignore`，子进程哪怕 `fmt.Printf` 打印错误
后 `os.Exit()`，也完全看不到。诊断时临时在对应的 `createXxxServer()` 里加：

```ts
const opt: CrossTargetConfig = {
  // ...
  stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
}
const entity = await cross.run(serviceName, opt);
const child = (entity as any).child;
child?.stdout?.on('data', (d: Buffer) => logger.info('[name][stdout]', d.toString()));
child?.stderr?.on('data', (d: Buffer) => logger.info('[name][stderr]', d.toString()));
child?.on('exit', (code: number, signal: string) => logger.info('[name][exit]', code, signal));
child?.on('error', (err: Error) => logger.info('[name][error]', err.message));
```

排查完记得**注释而非删除**（除非用户明确要求删除），方便下次复用。

## 3. `ee-core` cross-spawn 不转发 `CrossTargetConfig.env`

`node_modules/ee-core/dist/cjs/cross/crossProcess.js` 里对 `cross-spawn` 的
调用只传了 `{ stdio, detached, cwd }`，**完全没有读取 `targetConf.env`**。
也就是说在 `CrossTargetConfig` 里写 `env: { HOME: xxx }` 会被静默忽略——
子进程实际继承的是 `process.env`（Node 主进程自己的环境变量）。

**正确做法**：在调用 `cross.run()` 之前，直接改 `process.env`：

```ts
if (is.openharmony()) {
  process.env.HOME = getAppUserDataDir();
}
const entity = await cross.run(serviceName, opt); // opt 里不需要再写 env
```

这是 `ee-core` 当前版本（`^5.0.3`）的限制，不是配置写错。如果未来
`ee-core` 修复了这个转发逻辑，这个 workaround 可以去掉。

## 4. OHOS 沙箱下 `$HOME` 不可写，且语言运行时可能绕过 env 检查

OHOS 沙箱里 `$HOME`（`/storage/Users/currentUser`）不可写，只有
`getAppUserDataDir()`（`/data/storage/el2/base/files`）可写。

**陷阱**：某些语言的"获取用户主目录"实现会先用系统调用（如 Go 的
`user.Current()`），**成功**返回一个不可写的目录，根本不会走到检查
`HOME` 环境变量的兜底逻辑。单纯设置 `HOME` 环境变量不一定生效——
要先确认目标程序的主目录解析逻辑到底以什么顺序读取。

如果目标程序是自己维护的框架源码（如本项目的 `ee-go`），最彻底的修复
是让其"主目录获取函数"优先检查 `HOME` 环境变量，再回退到系统调用。

## 5. HAP 资源同步陷阱：改了代码但 HAP 里还是旧的

`npm run build-electron` 只会重新生成仓库根目录下的
`public/electron/main.js`，**不会**同步进
`ohos_hap/web_engine/src/main/resources/resfile/resources/app/public/electron/main.js`
——而 hvigor 打包 HAP 时用的正是后者。

修改了 `electron/` 下任何业务代码后，必须额外跑资源同步步骤（对应
`cmd/bin.js` 的 `ohos.resources`/`ohos.test`），否则改动不会进入新打的 HAP，
表现为"代码明明改了，问题却没解决"：

```bash
npm run build-electron
node_modules/.bin/ee-bin ohos --cmds=test      # 或 --cmds=resources
# 如果改了 go/，还要先 build-go-ohos + build-hnp-ohos，再跑上面这行
```

**验证同步是否生效**：对比两处 `main.js` 的 mtime/内容，确认目标路径确实
更新了，再去重新 `assembleHap` + 安装，避免在旧构建上反复测试。

## 6. hvigor 命令行调用（无 `hvigorw` 时）

`ohos_hap/` 下如果没有 `hvigorw` 可执行文件，直接用 DevEco Studio 内置的
hvigor CLI：

```bash
export DEVECO_SDK_HOME=/Applications/DevEco-Studio.app/Contents/sdk
export JAVA_HOME=/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
node /Applications/DevEco-Studio.app/Contents/tools/hvigor/hvigor/bin/hvigor.js \
  --mode module -p product=default -p buildMode=debug -p module=electron@default \
  assembleHap --no-daemon
```

产物在 `ohos_hap/electron/build/default/outputs/default/electron-default-signed.hap`。

`buildMode=debug` 会跳过 ArkTS 混淆（obfuscation 只在 `release`
buildOptionSet 生效），排障阶段优先用 debug 模式，避免混淆相关的
额外故障面。

## 7. 进程状态识别

- `ps -ef` 里命令名带方括号，如 `[/data/app/goapp]`：进程已退出（defunct/
  zombie），只是父进程表里还没清理掉，**不代表进程还活着**。
- 正常存活的子进程会显示完整命令行，如 `goapp --port=7073`。
- 光看一次 `ps -ef` 不够，配合 `ee.*.log` 里 `[name][exit]`（如果加了监听）
  或直接看是否有对应端口的 HTTP 响应来确认。

## 8. hilog 实时抓日志（诊断 ArkTS 层崩溃）

`hilog -x` 一次性 dump 经常抓不到关键内容，改用清空缓冲区 + 后台流式抓取：

```bash
hdc shell "hilog -r"                                    # 清空缓冲区
(hdc shell "hilog" > /tmp/hilog_live.txt 2>&1 &)         # 后台流式抓取
hdc shell "aa start -a EntryAbility -b <bundleName>"     # 触发问题
sleep 5
pkill -f "hdc shell hilog"                               # 停止抓取
grep -iE "bundleName|TypeError|RuntimeError|is not callable|exit with code" /tmp/hilog_live.txt
```

## 9. 设备锁屏会阻塞 `aa start`

开发者模式下如果设备锁屏，`aa start` 会报
`Error Code:10106102 ... unlock screen failed`，且 hdc 无法远程解锁
（`power-shell wakeup`/`uinput` 滑动均无效）。这种情况只能让用户手动解锁
设备，不要在这个方向上反复尝试自动化方案。
