
 Context

 当前 electron/ 目录构建后保持文件原样（bundleType: 'copy'），控制器通过 globby 扫描文件系统 + require() 加载。目标是构建时生成控制器注册表，用 esbuild 打包成 index.js，运行时从注册表加载而非扫描磁盘。

 构建产物结构

 public/electron/
 ├── index.js              # 主进程打包代码（main + controller + service + preload/lifecycle + preload/index）
 ├── config/               # 配置文件（保留独立，支持构建后修改）
 │   ├── config.default.js
 │   └── config.local.js
 ├── jobs/                 # 子进程任务脚本（必须独立文件，child_process.fork 运行）
 │   └── example/
 │       ├── hello.js
 │       └── timer.js
 └── preload/
     └── bridge.js         # BrowserWindow preload 脚本（必须独立文件）

 实施步骤

 Step 1: 添加 RegistryEntry 类型定义

 文件: packages/ee-core/src/types/index.ts

 在 FileLoaderOptions 接口中添加 registry 字段，新增 RegistryEntry 接口：

 export interface RegistryEntry {
   fullpath: string;
   properties: string[];
   module: unknown;
 }

 export interface FileLoaderOptions {
   // ...existing fields...
   registry?: RegistryEntry[];
 }

 Step 2: FileLoader 支持 registry 模式

 文件: packages/ee-core/src/core/loader/file_loader.ts

 1. 导入 RegistryEntry 类型
 2. 添加 parseFromRegistry() 方法 — 遍历 registry 条目，对每个 entry.module 应用与 parse() 相同的 initializer/class 检测/函数调用逻辑
 3. 修改 load() 方法：如果 this.options.registry 存在，调用 parseFromRegistry()，否则走原有 parse() 路径

 核心逻辑：registry 只替代 globby+require 的文件发现和加载步骤，wrapClass() 等 initializer 仍在运行时执行（因为闭包无法序列化）。

 Step 3: ControllerLoader 检测 bundle 模式

 文件: packages/ee-core/src/controller/controller_loader.ts

 1. 检测 global.__EE_CONTROLLER_REGISTRY__ 是否存在
 2. 如果存在（bundle 模式），将其作为 registry 传给 FileLoader
 3. 如果不存在（dev 模式），走原有 globby 路径

 load(): Record<string, unknown> {
   this.timing.start('Load Controller');
   const registry = (globalThis as any).__EE_CONTROLLER_REGISTRY__;
   const opt = {
     caseStyle: 'lower' as const,
     directory: path.join(getElectronDir(), 'controller'),
     ...(registry ? { registry } : {}),
     initializer: (obj, options) => {
       // 现有 wrapClass 逻辑不变
     },
   };
   const target = new FileLoader(opt).load();
   this.timing.end('Load Controller');
   return target;
 }

 Step 4: 创建 esbuild 控制器注册表插件

 新建文件: packages/ee-bin/src/plugins/controller_registry_plugin.ts

 esbuild 插件，采用 onStart + onResolve + onLoad 混合方案：

 1. onStart: 用 globby.sync() 扫描 electron/controller/ 目录，计算每个文件的 properties（复刻 defaultCamelize 逻辑，caseStyle: 'lower'）
 2. onResolve: 拦截虚拟模块 ee-core:controller-registry
 3. onLoad: 生成注册表代码 — 对每个控制器文件生成 require() 语句，设置 global.__EE_CONTROLLER_REGISTRY__

 生成代码示例：
 const _ctrl0 = require('./controller/example.js');
 const _ctrl1 = require('./controller/os.js');
 // ...
 global.__EE_CONTROLLER_REGISTRY__ = [
   { fullpath: 'controller/example.js', properties: ['example'], module: _ctrl0 },
   { fullpath: 'controller/os.js', properties: ['os'], module: _ctrl1 },
 ];

 4. 另一个虚拟入口 ee-core:bundle-entry：先 require('ee-core:controller-registry')，再 require('./main.js')

 Step 5: 修改 ee-bin 构建流程

 文件: packages/ee-bin/src/tools/serve.ts

 1. 在 bundle() 方法中，当 bundleType === 'bundle' 时调用新方法 _bundleWithRegistry()
 2. _bundleWithRegistry() 实现：
   - 配置 esbuild：entry 为虚拟入口 ee-core:bundle-entry，bundle: true，platform: 'node'，format: 'cjs'，单文件输出到 public/electron/index.js
   - external: ['electron', 'better-sqlite3'] + 用户自定义 external
   - 插入 controllerRegistryPlugin
   - define: {'process.env.EE_BUNDLED': "'true'"}
   - esbuild 构建完成后：
       - 复制 electron/config/ → public/electron/config/
     - 复制 electron/jobs/ → public/electron/jobs/
     - 复制 electron/preload/bridge.js → public/electron/preload/bridge.js
 3. 修改 _switchPkgMain()：bundle 模式下指向 ./public/electron/index.js 而非 ./public/electron/main.js

 文件: packages/ee-bin/src/config/bin_default.ts

 更新默认 esbuild 配置：
 - bundle: true（原来是 false）
 - 添加 external: ['electron', 'better-sqlite3']
 - 单文件输出 outfile: 'public/electron/index.js'

 Step 6: 更新项目构建配置

 文件: cmd/bin.js

 1. 将 bundleType: 'copy' 改为 bundleType: 'bundle'
 2. 更新加密配置中的 specificFiles：'./public/electron/main.js' → './public/electron/index.js'

 Step 7: ESM 异步加载预留接口

 在当前实现中保持 CJS 同步加载。为 ESM 预留扩展点：

 1. 在 packages/ee-core/src/core/utils/index.ts 添加 loadFileAsync() 函数（使用 await import()）
 2. 在 FileLoader 添加 parseAsync() 方法（使用 globby() 异步版 + loadFileAsync()）
 3. 在 ControllerLoader 添加 loadAsync() 方法
 4. 在 controller/index.ts 添加 loadControllerAsync() 函数
 5. 在 Application 添加 runAsync() 方法
 6. 在 ElectronEgg 添加 runAsync() 方法

 这些 async 方法目前不接入启动流程，仅作为接口预留。当项目切换到 ESM 控制器时，electron/main.js 改用 app.runAsync() 即可。

 需修改的文件清单

 ┌───────────────────────────────────────────────────────────┬──────────┬───────────────────────────────────────────────────────────┐
 │                           文件                            │ 变更类型 │                           说明                            │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-core/src/types/index.ts                       │ 修改     │ 添加 RegistryEntry 接口和 FileLoaderOptions.registry 字段 │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-core/src/core/loader/file_loader.ts           │ 修改     │ 添加 parseFromRegistry()，修改 load()                     │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-core/src/controller/controller_loader.ts      │ 修改     │ 检测 global.__EE_CONTROLLER_REGISTRY__                    │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-bin/src/plugins/controller_registry_plugin.ts │ 新建     │ esbuild 注册表生成插件                                    │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-bin/src/tools/serve.ts                        │ 修改     │ 添加 _bundleWithRegistry()，修改 _switchPkgMain()         │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ packages/ee-bin/src/config/bin_default.ts                 │ 修改     │ 更新默认 esbuild 配置                                     │
 ├───────────────────────────────────────────────────────────┼──────────┼───────────────────────────────────────────────────────────┤
 │ cmd/bin.js                                                │ 修改     │ bundleType: 'copy' → 'bundle'，更新 specificFiles         │
 └───────────────────────────────────────────────────────────┴──────────┴───────────────────────────────────────────────────────────┘

 ESM 预留接口（Step 7）额外修改：

 ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 │                         文件                         │              说明              │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/core/utils/index.ts             │ 添加 loadFileAsync()           │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/core/loader/file_loader.ts      │ 添加 parseAsync()、loadAsync() │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/controller/controller_loader.ts │ 添加 loadAsync()               │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/controller/index.ts             │ 添加 loadControllerAsync()     │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/app/application.ts              │ 添加 runAsync()                │
 ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 │ packages/ee-core/src/app/boot.ts                     │ 添加 runAsync()                │
 └──────────────────────────────────────────────────────┴────────────────────────────────┘

 验证方法

 1. 开发模式不变: pnpm dev 正常启动，前端 IPC controller/framework/hello 仍通过 globby 路径工作
 2. 构建测试: pnpm build-electron 后检查 public/electron/ 目录结构符合预期（index.js + config/ + jobs/ + preload/bridge.js）
 3. 生产启动: pnpm start 正常启动，IPC 通信正常
 4. 加密兼容: pnpm encrypt 后仍能正常启动
 5. 打包测试: pnpm build-m 生成 dmg，安装后功能正常