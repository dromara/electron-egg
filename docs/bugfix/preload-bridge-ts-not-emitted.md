# public/electron 下不生成 preload/bridge.js

- **日期**：2026-06-02
- **影响范围**：ee-bin 打包（`pnpm build-electron` / `pnpm dev-electron`），使用 TypeScript 源码（`bridge.ts`）的项目
- **涉及文件**：`packages/ee-bin/src/tools/serve.ts`

## 现象

打包后 `public/electron/` 下有 `main.js`、`jobs/`，但**没有 `preload/bridge.js`**。Electron 创建 `BrowserWindow` 时 preload 脚本加载失败（文件不存在），渲染进程拿不到 `contextBridge` 暴露的 API。

## 根因

preload 脚本由 Electron 直接从磁盘加载，**不能打进 main.js**（打包后路径不对，且 Electron 要求 preload 是独立文件）。`_copyUnbundledFiles()` 为此单独处理 bridge，但有两个问题：

```ts
const bridgeSrc = path.join(cwd, ELECTRON_DIR, 'preload', 'bridge.js');  // ← 写死 .js
const bridgeDest = path.join(outdir, 'preload', 'bridge.js');
if (fs.existsSync(bridgeSrc)) {        // ← 源码是 bridge.ts，这里为 false，静默跳过
  fs.mkdirSync(path.dirname(bridgeDest), { recursive: true });
  fs.copyFileSync(bridgeSrc, bridgeDest);   // ← 即便找到也只是复制，不转译
}
```

1. **扩展名写死 `bridge.js`**：项目源码是 `bridge.ts`，`existsSync('bridge.js')` 返回 false，整段被**静默跳过**，bridge 既不复制也不转译。
2. **用 `copyFileSync` 直接复制**：就算改成找 `.ts`，直接复制也不对——preload 被 Electron 当 JS 加载，TypeScript（含 `import` 语句）无法执行，必须转译成 `.js`。

## 修复

`serve.ts` 的 `_copyUnbundledFiles()`：用 glob 解析实际存在的 bridge 源文件（任意脚本扩展名），并改用 `_transpileDir` 转译（它已支持单文件、且复用与 main.js 相同的 esbuild 选项）。

```ts
const baseOptions = this._resolveBaseBuildOptions(bundleConfig);

const bridgeMatches = globby.sync('preload/bridge.{ts,js,mts,cts,tsx,jsx}', { cwd: path.join(cwd, ELECTRON_DIR) });
if (bridgeMatches.length > 0) {
  const bridgeRel = bridgeMatches[0]!;
  const bridgeSrc = path.join(cwd, ELECTRON_DIR, bridgeRel);
  const bridgeDest = path.join(outdir, bridgeRel);   // 镜像 basename，_transpileDir 据此推导同名 .js
  await this._transpileDir(bridgeSrc, bridgeDest, baseOptions);
}
```

## 注意

`preload/` 下还有 `index.ts`、`lifecycle.ts`，它们是被 `main.ts` import、**已打进 main.js** 的，所以**只单独处理 `bridge.ts`**，不能整目录复制（否则重复打包）。

## 验证

重建 ee-bin（`cd packages/ee-bin && pnpm run build`）后 `rm -rf public/electron && pnpm build-electron`：

- `public/electron/preload/bridge.js` 正常生成
- 内容已转成 CJS（不再是原始 ESM）：
  ```js
  var import_electron = require("electron");
  import_electron.contextBridge.exposeInMainWorld("electron", {
    ipcRenderer: import_electron.ipcRenderer
  });
  ```

## 经验教训

1. **不能假设源码扩展名**：框架要同时支持 JS 和 TS 项目，凡是按路径找业务文件的地方都应 glob 多扩展名，而非写死 `.js`。
2. **preload 必须转译、不能裸复制**：preload 由 Electron 直接加载，源码若是 TS/ESM 必须先转成可执行的 JS。
3. **静默跳过是隐患**：`if (existsSync) {...}` 找不到就跳过、无任何日志，问题很难被发现。涉及关键产物时应在缺失时告警或显式记录。
