# 基于better-sqlite3的三方库编译指导
## 成品产物
[better-sqlite3-ohos-v138.tar.gz](.\better-sqlite3-ohos-v138.tar.gz)
附件中附成品产物，供开发者在编译有困难时试用。不保证适用于所有版本。
# 一、获取better-sqlite3代码
从github上获取源码：
```
git clone https://github.com/WiseLibs/better-sqlite3.git
```

# 二、准备环境
## 1.解压头文件
将附件中Electron框架提供的头文件压缩包解压至自己的目录中。

附件为：已整理好的electron的node头文件（与electron开源官方头文件存在差异）：
[better-sqlite3-headers-v138.rar](.\better-sqlite3-headers-v138.rar)

本篇文章以`~/work/better-sqlite3-headers-v138`为例
## 2.准备编译脚本
将下列代码写到`build.sh`脚本中，前半部分配置环境变量，最后一步为执行编译：
```bash
# 设置npm下载的镜像源（根据自己的网络环境进行设置，下面以淘宝源为例）
# npm config set registry https://registry.npm.taobao.org/

# 将编译时需要用到的编译工具链设置到环境变量
# 下列环境变量的配置以源码为例，也可以使用'command-line-tools'中的SDK
export CC="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/clang --target=aarch64-linux-ohos"
export CXX="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/clang++ --target=aarch64-linux-ohos"
export LD="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/lld --target=aarch64-linux-ohos"
export STRIP="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-strip"
export RANLIB="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-ranlib"
export OBJDUMP="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-objdump"
export OBJCOPY="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-objcopy"
export NM="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-nm"
export AR="/home/chromium-electron-release/src/ohos_sdk/openharmony/native/llvm/bin/llvm-ar"

# 保留hilog等额外路径
export CFLAGS="-fPIC -D__MUSL__=1 -DV8_ENABLE_CHECKS -I/tmp/bsq_hilog"
export CXXFLAGS="-fPIC -D__MUSL__=1 -DV8_ENABLE_CHECKS -I/tmp/bsq_hilog"
# 下列编译命令中‘better-sqlite3-headers-v138’是框架组装好的编译所需头文件。使用 --nodedir 让 node-gyp 跳过下载，直接用已准备好的头文件。（其它三方库的编译也可用该方法）
下的头文件。
npm install --verbose --build-from-source \
  --nodedir=~/work/better-sqlite3-headers-v138
```
**将准备好的编译脚本`build.sh`放到better-sqlite3的源码根目录下。**

**编译机的Node版本建议不低于`v22.17.0`，撰稿时使用的版本如下：**
![](./images/1780318589171_image.png)

# 三、编译三方库
## 1. 修改better-sqlite3配置
修改`binding.gyp`：
**（1）、在cflags_cc中添加以下内容(如下图)：**
```
'-DNODE_EMBEDDER_MODULE_VERSION=<(node_module_version)',
        '-DV8_ENABLE_CHECKS',
        '-DV8_COMPRESS_POINTERS_IN_SHARED_CAGE=1',
```
![](./images/1780316294660_image.png)

**（2）、添加`library_dirs`(如下图)：**
随附件提供`libshim.a`（见下文）
```
'library_dirs': [
    './libshim.a',
]
```
![](./images/1780316252980_image.png)

## 2.将Electron框架提供的`libshim.a`放到`better-sqlite3`源码根目录下。
`libshim.a`在附件
[libshim.a](.\libshim.a)

## 3.编译
将之前准备好的`build.sh`也放到better-sqlite的源码目录下，然后执行编译脚本：
```shell
bash build.sh
```
出现如下图所示的信息即为编译成功。
![](./images/image.png)

# 四、验证

## 1.校验符号
编译完成后，用 readelf 检查 `better_sqlite3.node`：

```bash
readelf -Ws build/Release/better_sqlite3.node | grep ReadExternalPointerField
# 应该没有任何输出（fast path 已剔除）

readelf -Ws build/Release/better_sqlite3.node | grep SlowGetAlignedPointer
# 应该看到 SlowGetAlignedPointerFromInternalField，由运行时提供
```
## 2.在工程中使用编译好的better-sqlite3.node
（1）、将`better-sqlite3/build/Release/better_sqlite3.node`复制到electron工程的`ohos_hap\electron\libs\arm64-v8a`下。如图：
![](./images/1780319051484_image.png)
（2）、将better-sqlite3编译过程中拉取的`node_modules`，放到electron工程的`ohos_hap\web_engine\src\main\resources\resfile\resources\app\`下
![](./images/1780319323467_image.png)
（3）、在`ohos_hap\web_engine\src\main\resources\resfile\resources\app\node_modules\`下新建`better-sqlite3`文件夹，并在文件夹中放置如下内容：
![](./images/1780319520098_image.png)
## 3.调用测试demo
```javascript
const { app, BrowserWindow, dialog } = require('electron');
console.log('better-sqlite3::===== better-sqlite3 测试开始 =====');

const Database = require('better-sqlite3');

// 创建内存数据库
const db = new Database(':memory:');
console.log('✓ better-sqlite3::数据库创建成功');

// 创建表
db.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER
)
`);
console.log('✓ better-sqlite3::表创建成功');

// 插入数据
const insert = db.prepare('INSERT INTO users (name, age) VALUES (?, ?)');
const info = insert.run('张三', 25);
console.log('✓ 插入成功, lastInsertRowid:', info.lastInsertRowid);

insert.run('李四', 30);
insert.run('王五', 28);

// 查询数据
const rows = db.prepare('SELECT * FROM users').all();
console.log('✓ better-sqlite3::查询成功, 记录数:', rows.length);
console.log('better-sqlite3::数据:', rows);

// 关闭数据库
db.close();
console.log('✓ better-sqlite3::数据库关闭成功');

console.log('===== better-sqlite3::所有测试通过! =====');


app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
        }
    })
    mainWindow.loadURL('www.baidu.com')
})

```
可看到对应的日志：
![](./images/1780319765554_image.png)