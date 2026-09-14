<!-- TODO: 发布时补充 Schema.org BlogPosting 结构化数据，至少包含 headline、author、datePublished、mainEntityOfPage。 -->

# 【鸿蒙PC开发】如何让electron拉起go服务并运行在鸿蒙PC上

> **欢迎加入开源鸿蒙PC社区：** [https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
>
> **欢迎在PC社区平台申请新建项目：** [https://atomgit.com/OpenHarmonyPCDeveloper](https://atomgit.com/OpenHarmonyPCDeveloper)

## 摘要

ElectronEgg（ee-v5）支持主进程通过 `cross` 模块拉起 Go 后端子进程，桌面平台上这条链路开箱即用。迁移到鸿蒙 PC 后要多解决两个问题：一是未签名二进制会被内核 XPM 拦截，需要通过 HNP（HarmonyOS Native Package）打包让系统签名放行；二是鸿蒙沙箱的目录权限模型和桌面系统不同，`$HOME` 等常见环境变量在沙箱内不可写，依赖它们建目录的 Go 程序会直接启动失败。本文按「打包签名 → 环境适配 → 构建注入 → 验证」的顺序，给出一套让 Go 服务在鸿蒙 PC 上稳定跑起来的完整方法，并附排查工具与常见问题清单。

## 一、总体思路

在鸿蒙 PC 上让 Go 服务跑起来，需要打通三层：

| 层 | 问题 | 方案 |
| --- | --- | --- |
| 二进制执行 | 内核 XPM 拦截未签名二进制的 `exec` | 用 HNP 打包，安装时由系统签名放行 |
| 运行时环境 | 沙箱目录权限与桌面系统不同，`$HOME` 不可写 | 让 Go 程序的运行时目录检测优先读取可写的环境变量 |
| 构建与注入 | HAP 打包用的资源目录和主构建产物是两份拷贝 | 每次改动后跑资源同步命令，确保新代码真正进了 HAP |

下面依次展开。

## 二、二进制签名：HNP 打包

鸿蒙 PC 的内核 XPM 会拦截未签名二进制的 `exec`，`resfile` 目录下直接 spawn 出来的 Go 二进制会报 `EACCES`。解法是把交叉编译产物打成 HNP 包，安装时由系统释放到沙箱内并签名，运行路径固定为：

```
/data/app/<appName>.org/<appName>_<version>/bin/<appName>/<appName>
```

对应到本项目的构建命令：

```bash
npm run build-go-ohos      # cross-env GOOS=linux GOARCH=arm64 CGO_ENABLED=0 交叉编译
npm run build-hnp-ohos      # 打包成 .hnp，产物落在 ohos_hap/hnp/arm64-v8a/
```

`module.json5` 里声明这个 HNP 包，安装时系统才会去解包签名：

```json5
"hnpPackages": [
  {
    "package": "goapp.hnp",
    "type": "private"
  }
],
```

业务代码里，鸿蒙分支的可执行文件路径要指向系统释放后的签名路径，而不是 `resfile` 里的原始拷贝：

```typescript
function getOhosGoAppCmd(): string {
  const home = process.env.HNP_PRIVATE_HOME || '/data/app';
  return path.join(home, 'goapp.org', 'goapp_1.0', 'bin', 'goapp', 'goapp');
}

const opt: CrossTargetConfig = {
  name: 'goapp',
  cmd: is.openharmony() ? getOhosGoAppCmd() : path.join(getExtraResourcesDir(), 'goapp'),
  directory: getExtraResourcesDir(),
  args: ['--port=7073'],
  appExit: false,
}
```

下图是 `ee-core` 的 `cross` 模块创建子进程的实现：接到 `cross.run()` 调用后，底层用 `cross-spawn` 把签名释放好的二进制 exec 起来。

![ee-core cross 模块创建子进程的实现](./ee-example-24.png)

做到这一步，`cross.run()` 已经能把 Go 二进制真正 exec 起来，不再报 `EACCES`。但这只解决了"能不能起"，接下来要处理"起了会不会活"。

## 三、运行时环境：沙箱目录权限适配

### 3.1 现象：进程秒退，`ps -ef` 显示僵尸态

如果 Go 程序依赖用户主目录（`$HOME`）建配置/数据目录，在鸿蒙沙箱下大概率会启动失败：

```bash
$ ps -ef | grep goapp
20020232  27178  26406  0 23:03:57 ?  00:00:00 [/data/app/goapp]
```

命令名带方括号，说明进程已经退出（defunct）。原因是鸿蒙 PC 应用沙箱里，从父进程继承的 `$HOME`（`/storage/Users/currentUser`）只读不可写，真正可写的只有 `ee-core` 的 `getAppUserDataDir()`（对应 `/data/storage/el2/base/files`）。Go 程序尝试在不可写目录下 `mkdir` 会直接失败退出。

### 3.2 排查工具：先看对日志，再打开 stdio

`ee-core` 有两套独立日志，业务代码的输出在 `ee.*.log`（应用层 logger），不在 `ee-core.*.log`（框架内部 logger）：

```bash
hdc file recv /data/app/el2/100/base/<bundleName>/files/ee/logs/ee.$(date +%Y-%m-%d).1.log /tmp/ee_app.log
grep "\[go\]" /tmp/ee_app.log
```

`cross.run()` 默认的 `stdio` 配置不会转发子进程的 stdout/stderr，需要临时打开：

```typescript
const opt: CrossTargetConfig = {
  // ...
  stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
}
const entity = await cross.run(serviceName, opt);
const child = (entity as any).child;
child?.stdout?.on('data', (d: Buffer) => logger.info('[go][stdout]', d.toString()));
child?.stderr?.on('data', (d: Buffer) => logger.info('[go][stderr]', d.toString()));
child?.on('exit', (code: number, signal: string) => logger.info('[go][exit]', code, signal));
child?.on('error', (err: Error) => logger.info('[go][error]', err.message));
```

打开之后，能在 `ee.*.log` 里看到 Go 程序真实的报错，例如：

```
[go][stdout] Error: create user home conf folder [/storage/Users/currentUser/.config/ee] failed:
mkdir /storage/Users/currentUser/.config: operation not permitted
```

排查完这几行监听代码建议**注释而非删除**，方便下次同类问题复用。

### 3.3 方案：把可写目录喂给 Go 程序，但要注意两个转发陷阱

思路很直接——把子进程的 `HOME` 环境变量指向应用可写的数据目录。但这里有两个容易踩的坑：

**陷阱一：`CrossTargetConfig.env` 可能不会被框架转发。** 需要确认所使用的 `ee-core` 版本，其 `cross-spawn` 调用是否真的读取了 `env` 配置字段——如果没有，写在 `opt.env` 里的值会被静默忽略，子进程实际继承的是 Node 主进程自己的 `process.env`。稳妥的做法是直接修改 `process.env` 后再调用 `cross.run()`：

```typescript
if (is.openharmony()) {
  process.env.HOME = getAppUserDataDir();
}
const entity = await cross.run(serviceName, opt);
```

下图是本工程业务代码里 `cross.run()` 拉起 goapp 的实际调用现场：

![业务代码中 cross.run() 拉起 goapp 服务](./ee-example-25.png)

**陷阱二：目标语言的运行时可能绕过环境变量检查。** 以 Go 为例，标准的"取用户主目录"实现通常先调用 `user.Current()`（系统级用户信息查询），只有它报错时才会去读 `HOME` 环境变量兜底：

```go
func GetUserHomeDir() (string, error) {
	user, err := user.Current()
	if nil == err {
		return user.HomeDir, nil   // 沙箱下这里可能成功，但返回值不可写
	}
	return homeUnix()               // 只有上面报错才会走到这里检查 HOME
}
```

鸿蒙沙箱下 `user.Current()` 往往是**成功**的，只是返回的目录不可写——这意味着无论怎么设置 `HOME` 环境变量，都不会被这段逻辑采纳。判断方法很简单：设置了 `HOME` 之后报错依然一字不差，基本就是这层原因。

如果目标程序是自己维护的框架源码，修复方式是把环境变量检查提到系统调用之前：

```go
func GetUserHomeDir() (string, error) {
	if !IsWindows() {
		if home := os.Getenv("HOME"); home != "" {
			return home, nil
		}
	}
	user, err := user.Current()
	if nil == err {
		return user.HomeDir, nil
	}
	// ... 其余兜底逻辑不变
}
```

### 3.4 改第三方依赖源码的安全流程：本地 `replace` 先联调

如果需要改的是一个独立仓库的第三方 Go 依赖，不要直接改版本号指向的缓存副本。用 Go modules 的 `replace` 指令把依赖临时指向本地开发checkout，改完本地源码直接编译验证：

```
# go.mod
replace github.com/<org>/<pkg> => /path/to/local/checkout
```

```bash
go build -o /tmp/test_bin .          # 本地编译验证
npm run build-go-ohos                # 交叉编译 OHOS 版本
npm run build-hnp-ohos                # 重新打 HNP 包
```

验证通过后，在依赖仓库里提交、打 tag、推送，再把 `go.mod` 的 `replace` 去掉、版本号改成新 tag：

```bash
# go.mod 里删掉 replace 行，版本号改成新版本
GOPROXY=https://goproxy.cn,direct go mod tidy   # 如果连不上境外代理，单次命令临时切镜像
```

这套"本地 replace 联调 → 发布真实版本 → 切回版本号依赖"的流程，不会在验证阶段污染 `go.sum`，也不会让其他协作者的构建依赖一个只存在于本机的路径。

## 四、构建与注入：确保改动真正进了 HAP

### 4.1 陷阱：两份 `main.js`

`npm run build-electron` 只会更新仓库根目录下的 `public/electron/main.js`，但 hvigor 打包 HAP 时用的是另一份拷贝：

```
ohos_hap/web_engine/src/main/resources/resfile/resources/app/public/electron/main.js
```

只有执行资源同步命令后，这份拷贝才会更新：

```bash
npm run build-electron
ee-bin ohos --cmds=test      # 或 --cmds=resources，把 public/ 同步进 resfile
```

漏掉这一步，表现和"修复没生效"完全一样——报错信息一字不差，但原因是根本没测到新代码。**改完业务代码后，先确认两处 `main.js` 内容或修改时间一致，再重新打包安装。**

### 4.2 按需拆分构建命令

如果项目同时维护含 Go 后端和不含 Go 后端的构建路径，建议把资源同步命令拆开，避免每次都强制触发一次 Go 交叉编译：

```json
"build-go-hnp-ohos": "npm run build-go-ohos && npm run build-hnp-ohos",
"ohos": "ee-bin ohos --cmds=resources",
"ohos-go": "npm run build-go-hnp-ohos && npm run ohos",
"ohos-test": "npm run build-electron && ee-bin ohos --cmds=test",
"ohos-test-go": "npm run build-electron && npm run build-go-hnp-ohos && ee-bin ohos --cmds=test"
```

不含 Go 后端、或 Go 侧没有改动时用 `ohos` / `ohos-test`；Go 侧有改动时用带 `-go` 后缀的命令。

### 4.3 打包与安装

```bash
export DEVECO_SDK_HOME=/Applications/DevEco-Studio.app/Contents/sdk
export JAVA_HOME=/Applications/DevEco-Studio.app/Contents/jbr/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
node /Applications/DevEco-Studio.app/Contents/tools/hvigor/hvigor/bin/hvigor.js \
  --mode module -p product=default -p buildMode=debug -p module=electron@default \
  assembleHap --no-daemon

hdc install ohos_hap/electron/build/default/outputs/default/electron-default-signed.hap
```

排障阶段优先用 `buildMode=debug`，跳过 ArkTS 混淆，减少额外故障面。

## 五、验证

安装完成后，启动应用并检查进程与端口：

```bash
hdc shell "aa start -a EntryAbility -b <bundleName>"
hdc shell "ps -ef" | grep goapp
```

正常存活的子进程会显示完整命令行，而不是方括号包裹的僵尸态：

```
20020232  43456  43037  0 23:29:07 ?  00:00:00 goapp --port=7073
```

转发端口后用 `curl` 验证 HTTP 服务确实可用：

```bash
hdc fport tcp:17073 tcp:7073
curl http://127.0.0.1:17073/api/hello
{"code":0,"msg":"","data":"hello electron-egg"}
```

真机上的实际验证效果：

![鸿蒙 PC 真机上 goapp 进程正常存活](./ee-example-26.png)

![鸿蒙 PC 真机上 curl 请求 goapp 接口返回正常](./ee-example-27.png)

日志里也能看到 HTTP 服务正常加载、后台任务正常触发：

```
[go][stderr] INFO  ehttp/http.go:94  [ee-go] http server http://127.0.0.1:7073, pid:43456
[go][stderr] INFO  job/index.go:36   [task] hello
```

## 六、常见问题清单

| 问题 | 原因 | 解决办法 |
| --- | --- | --- |
| 只看 `ee-core.*.log` 找不到任何异常 | 业务代码的日志输出在 `ee.*.log`，不在框架自己的日志文件里 | 排查业务子进程问题优先查 `ee.*.log` |
| 子进程报错完全看不到 | `cross.run()` 默认 stdio 不转发子进程输出 | 临时打开 `stdio: ['ignore','pipe','pipe','ipc']` 并挂监听，排查完注释掉而非删除 |
| 配置了 `env` 却没生效 | 框架的 spawn 调用可能没有转发这个字段 | 直接改 `process.env` 后再调用，子进程默认会继承 |
| 改了 `HOME` 环境变量还是报同一个错 | 目标语言的运行时可能先调用系统级用户查询，成功后不会再检查环境变量 | 需要在依赖的框架源码里调整检查顺序，把环境变量检查提到系统调用之前 |
| 明明改了代码，装到设备上问题依旧 | HAP 打包用的资源拷贝没有同步最新构建产物 | 每次改动业务代码后跑资源同步命令，装包前确认目标文件确实更新了 |
| `go mod tidy` 连不上 `proxy.golang.org` 超时 | 网络环境访问境外代理不稳定 | 单次命令临时加 `GOPROXY=https://goproxy.cn,direct`，不动全局 Go 配置 |

## 七、总结

- 让 Go 服务在鸿蒙 PC 上跑起来要打通三层：**二进制签名（HNP）→ 运行时环境适配（可写目录）→ 构建注入（资源同步）**，缺一层现象都类似"起不来"或"起了立刻死"；
- 沙箱下的环境变量适配容易遇到"配置了却没生效"的情况，需要同时确认框架有没有转发配置、目标程序有没有真的读取——两处任何一处没打通，现象都一样；
- 改第三方依赖源码时，用 `replace` 指令本地联调、验证通过再发版本，能把风险控制在自己的开发环境里；
- HAP 资源同步是构建链路里最容易漏掉的一步，改完代码养成确认同步的习惯，能省下大量"改了但没生效"式的排查时间。

## 参考与延伸

- electron-egg 框架：[https://atomgit.com/dromara/electron-egg](https://atomgit.com/dromara/electron-egg)
- ee-go（Go 后端框架）：[https://github.com/wallace5303/ee-go](https://github.com/wallace5303/ee-go)
- OpenHarmony 官方文档：[https://docs.openharmony.cn/](https://docs.openharmony.cn/)
- 华为开发者文档：[https://developer.huawei.com/consumer/cn/doc/](https://developer.huawei.com/consumer/cn/doc/)
- 开源鸿蒙 PC 社区：[https://harmonypc.csdn.net/](https://harmonypc.csdn.net/)
