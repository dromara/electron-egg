# pnpm install 常见问题排查指南

> 本文档记录了在 electron-egg 项目中使用 pnpm 安装依赖时可能遇到的常见问题及解决方法。

---

## 问题一：Exotic dependency 被阻止

### 错误信息

```
[ERR_PNPM_EXOTIC_SUBDEP] Exotic dependency "@electron/node-gyp" (resolved via git-repository)
is not allowed in subdependencies when blockExoticSubdeps is enabled
```

### 原因

`@electron/rebuild` 依赖的 `@electron/node-gyp` 是通过 Git 仓库直接引用的（exotic dependency）。pnpm 默认启用 `blockExoticSubdeps`，会阻止子依赖使用非标准来源的包。

### 解决方法

在 `.npmrc` 中添加配置，允许子依赖使用 exotic 来源：

```ini
# .npmrc
block-exotic-subdeps=false
```

---

## 问题二：镜像源 502 Bad Gateway

### 错误信息

```
[ERR_PNPM_FETCH_502] GET https://registry.npmmirror.com/ajv: Bad Gateway - 502
```

### 原因

配置的 npm 镜像源（如 npmmirror）服务暂时不稳定或出现故障。

### 解决方法

**方案 1：临时切换到官方源**

```bash
pnpm install --registry https://registry.npmjs.org/
```

**方案 2：切换到其他国内镜像源**

```bash
# 腾讯云镜像
pnpm install --registry https://mirrors.cloud.tencent.com/npm/
```

**方案 3：等待后重试**

镜像源故障通常是暂时的，可以直接重新执行：

```bash
pnpm install
```

---

## 问题三：构建脚本被忽略

### 错误信息

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: better-sqlite3@12.10.0,
electron-winstaller@5.4.0, electron@39.8.10, esbuild@0.21.5

Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
```

### 原因

pnpm v9+ 出于安全考虑，默认忽略依赖包的 postinstall 构建脚本。以下关键包需要运行构建脚本才能正常工作：

| 包名 | 构建脚本作用 |
|------|-------------|
| `electron` | 下载对应平台的 Electron 二进制文件 |
| `better-sqlite3` | 编译 SQLite 原生 C++ 模块 |
| `esbuild` | 安装对应平台的二进制文件 |
| `electron-winstaller` | 选择对应架构的 7-Zip 工具 |

### 解决方法

**步骤 1：批准构建脚本**

```bash
pnpm approve-builds better-sqlite3 electron-winstaller electron esbuild
```

或批准所有被忽略的构建脚本：

```bash
pnpm approve-builds
```

**步骤 2：重新运行构建**

```bash
pnpm rebuild
```

**步骤 3：配置自动批准（可选）**

为避免以后重复操作，在 `.npmrc` 中添加：

```ini
# .npmrc
ignore-build-scripts=false
```

或在 `pnpm-workspace.yaml` 中配置允许的构建：

```yaml
# pnpm-workspace.yaml
allowBuilds:
  better-sqlite3: true
  electron: true
  electron-winstaller: true
  esbuild: true
```

> **注意**：检查 `pnpm-workspace.yaml` 中是否包含 `ignoredBuiltDependencies` 列表，如果有，应将其注释或移除，否则 pnpm 仍会跳过这些包的构建脚本。

---

## 问题四：ee-bin bin 链接创建失败

### 错误信息

```
[WARN] Failed to create bin at node_modules/.bin/ee-bin.
ENOENT: no such file or directory, open 'packages/ee-bin/dist/esm/index.js'
```

### 原因

`ee-bin` 是本地 workspace 包，其 `package.json` 中 `bin` 字段指向 `./dist/esm/index.js`，但该文件尚未构建生成，导致 pnpm 无法创建 bin 链接。

### 解决方法

**步骤 1：构建 ee-bin 包**

```bash
cd packages/ee-bin
pnpm run build
```

**步骤 2：重新安装依赖**

```bash
cd ../..
pnpm install
```

---

## 问题五：Electron 二进制文件下载极慢

### 现象

运行 `node node_modules/electron/install.js` 时，下载进度极慢，ETA 显示数千秒。

### 原因

Electron 二进制文件体积较大（约 100MB+），直接从 GitHub 或默认源下载时，在国内网络环境下速度很慢。

### 解决方法

**方案 1：使用镜像源（推荐）**

确保 `.npmrc` 中已配置 Electron 镜像：

```ini
# .npmrc
electron_mirror=https://npmmirror.com/mirrors/electron/
```

安装时通过环境变量强制使用镜像：

```bash
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ \
  node node_modules/electron/install.js
```

**方案 2：使用 pnpm rebuild**

如果 `.npmrc` 已配置镜像，直接运行：

```bash
pnpm rebuild
```

pnpm 会读取 `.npmrc` 中的配置并使用镜像源下载。

---

## 完整修复流程总结

如果遇到多个问题同时出现，建议按以下顺序修复：

```bash
# 1. 确保 .npmrc 配置正确
cat .npmrc
# 应包含：
#   registry=https://registry.npmmirror.com/
#   electron_mirror=https://npmmirror.com/mirrors/electron/
#   block-exotic-subdeps=false
#   ignore-build-scripts=false

# 2. 确保 pnpm-workspace.yaml 没有忽略关键构建
cat pnpm-workspace.yaml
# 检查并注释掉 ignoredBuiltDependencies 中的 electron 等包

# 3. 构建本地 workspace 包
cd packages/ee-bin && pnpm run build && cd ../..

# 4. 重新安装依赖
pnpm install

# 5. 运行构建脚本（如果仍有包被忽略）
pnpm rebuild

# 6. 验证安装
ls node_modules/.bin/ee-bin
ls node_modules/electron/dist/Electron.app/Contents/MacOS/Electron
```

---

## 相关配置文件

### .npmrc

```ini
registry=https://registry.npmmirror.com/
disturl=https://registry.npmmirror.com/-/binary/node
electron_mirror=https://npmmirror.com/mirrors/electron/
electron-builder-binaries_mirror=https://registry.npmmirror.com/-/binary/electron-builder-binaries/

package-manager=pnpm
shamefully-hoist=true
node-linker=hoisted
hardlinks=false

block-exotic-subdeps=false
ignore-build-scripts=false
```

### pnpm-workspace.yaml

```yaml
packages:
  - packages/*

allowBuilds:
  better-sqlite3: true
  electron: true
  electron-winstaller: true
  esbuild: true

# ignoredBuiltDependencies:
#   - electron

overrides:
  "@electron/node-gyp": "npm:@electron/node-gyp@10.2.0-electron.2"
```

---

## 参考链接

- [pnpm 官方文档 - .npmrc](https://pnpm.io/npmrc)
- [pnpm 官方文档 - Workspace](https://pnpm.io/workspaces)
- [Electron 镜像配置](https://www.electronjs.org/docs/latest/tutorial/installation#mirror)
