# Memory

## 打包修复：ee-core node_modules 软链接解析

**问题**：打包后的应用崩溃，报 `Cannot find module 'dunder-proto/get'`。原因：
- `packages/ee-core/node_modules/` 有 20 个 pnpm 软链接全部断链（指向不存在的 `.pnpm/` 路径，因 `.npmrc` 用了 `node-linker=hoisted`）
- electron-builder 依赖剪枝漏掉 ee-core 传递依赖（`dunder-proto`、`side-channel` 等），根 `node_modules/` 605 包只纳入 192 包
- 关键路径：`node_modules/ee-core` → 软链接 → `../packages/ee-core`

**方案**：在 electron-builder 执行前，将 ee-core 生产依赖（含传递依赖）从根 `node_modules/` 复制为真实文件到 `packages/ee-core/node_modules/`，打包后清理。

### 需要修改的文件

1. **`packages/ee-bin/src/lib/helpers.ts`** — 修复 `_copyDirRecursive` 不处理目录软链接的 bug（`Dirent.isDirectory()` 对软链接返回 false 导致 EISDIR），新增 `copyDirDerefSync` 解引用复制函数

2. **`packages/ee-bin/src/lib/utils.ts`** — 新增 `resolveEeCoreDeps(cwd)` 和 `cleanupEeCoreDeps(cwd)`：
   - 动态读 `packages/ee-core/package.json` 的 dependencies
   - 递归收集传递依赖（Set 去重防循环，跳过 ee-core/ee-bin）
   - 从根 `node_modules/` 用 `copyDirDerefSync` 复制到 `packages/ee-core/node_modules/`
   - 处理 @scoped 包路径、嵌套 `node_modules/`（如 `urllib/node_modules/iconv-lite`）

3. **`packages/ee-bin/src/tools/serve.ts`** — 集成到 `build()` 流程：
   - 新增 `_hasBuilderCommand()` 检测打包命令（win64/mac/linux 等）
   - `_switchPkgMain()` 之后、`multiExec()` 之前调用 `resolveEeCoreDeps()`
   - `_restorePkgMain()` 之后调用 `cleanupEeCoreDeps()`
   - `_closeProcess()` 中也加入清理（SIGINT/SIGTERM 时）

4. **`cmd/builder-mac-arm64.json`** — 修复 `"packages/ee-core/**/*/"` → `"packages/ee-core/**/*"`（去掉尾部 `/`）

5. **`packages/ee-core/.gitignore`** — 追加 `node_modules/` 防止临时文件被 git 追踪

### 验证

1. `cd packages/ee-bin && npm run build`
2. `pnpm build-m`
3. 检查 `out/mac-arm64/.../node_modules/ee-core/node_modules/` 包含 `axios`、`dunder-proto`、`side-channel` 等
4. 运行打包后应用确认无 `Cannot find module` 错误
5. Ctrl+C 打包过程确认清理正常
