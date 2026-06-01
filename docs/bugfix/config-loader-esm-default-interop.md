# Bundle 模式下 httpServer / socketServer 配置丢失，服务静默不启动

- **日期**：2026-06-01
- **影响范围**：ee-core bundle 模式（`pnpm dev-electron` / `pnpm build-electron` 后的运行时）
- **涉及文件**：`packages/ee-core/src/config/config_loader.ts`

## 现象

`electron/config/config.default.ts` 中明确配置了 `httpServer.enable: true`、`socketServer.enable: true`，但程序启动后：

- 7071（http）、7070（socket）端口都没有监听
- `ee-error.log` 为空，dev 输出里也没有任何报错
- `[lifecycle] ready` 正常打印，jobs、go 服务、前端都正常
- 唯独缺少 `[socket/http] server is: ...` 和 `[socket/socketServer] port is: ...` 两条启动日志

两个服务**同时**静默失效，是定位方向的关键线索。

## 根因

bundle 模式下，配置文件由 esbuild 插件打包进 `main.js`，并注册到 `global.__EE_CONFIG_REGISTRY__`，registry 里的 `module` 是 esbuild 用 `__toCommonJS()` 包装后的 **ESM 命名空间对象**，形如：

```js
{ __esModule: true, default: () => ({ httpServer: { enable: true }, ... }) }
```

而 `ConfigLoader._loadConfig()` 的 bundle 分支只判断了两种情况：

```ts
const mod = entry.module;
if (isFunction(mod)) return mod(appInfo);  // mod 直接是函数？否
return mod;                                 // 否则当配置对象直接返回
```

它没有解开 `.default`，于是把整个 `{ __esModule, default: fn }` 当成普通配置对象 merge 进去。结果用户配置完全没生效，只剩框架默认值（`enable: false`），`HttpServer.init()` 里 `enable === false` 直接 `return`，服务静默不启动。

**冒烟枪**：开 DEBUG 后打印的合并结果末尾出现了 `default: [Function: config_local_default]` —— 配置对象里不该有 `default` 这个键，说明函数根本没被调用、ESM 命名空间没被解包。

## 为什么 controller 没出问题

controller / service 走的是 `FileLoader.parseFromRegistry()`，那里**早就处理了 ESM interop**：

```ts
let exports = entry.module;
if (exports && exports.__esModule) {
  exports = 'default' in exports ? exports.default : exports;
}
```

config 之所以中招，是因为它没有复用 `FileLoader`，而是自己写了一套 `_loadConfig`，漏掉了这步解包。

## 修复

`config_loader.ts` 的 bundle 分支，对齐 `FileLoader.parseFromRegistry()` 的 `__esModule` 守卫写法：

```ts
let mod = entry.module;
if (mod && (mod as Record<string, unknown>).__esModule && 'default' in (mod as Record<string, unknown>)) {
  mod = (mod as { default: unknown }).default;
}
if (isFunction(mod)) {
  return (mod as (...args: unknown[]) => Record<string, unknown>)(appInfo);
}
return mod as Record<string, unknown>;
```

用 `__esModule` 守卫而非「只要有 default 就解」，避免误解包一个合法导出 `default` 键的普通配置对象，也和既有约定保持一致。

## 验证

重建 ee-core（`cd packages/ee-core && pnpm run build`）后重跑 `DEBUG='ee-core:config:*' pnpm dev-electron`：

- 合并后 config 正确：`httpServer.enable: true`、`socketServer.enable: true`，`default: [Function]` 残留消失
- `[socket/socketServer] port is: 7070`、`[socket/http] server is: http://127.0.0.1:7071` 都打印
- `lsof -iTCP:7070-7071 -sTCP:LISTEN` 确认两端口监听
- 日志出现真实请求 `httpInfo: {"method":"POST",...}` 成功路由到 controller

## 经验教训

1. **DEBUG 模式是定位利器**：`DEBUG='ee-core:config:*'` 直接打印出合并后的完整 config，一眼看到 `enable: false` 和异常的 `default: [Function]` 残留，比读源码逐层推断快得多。排查启动类问题应优先开 DEBUG。
2. **「两个服务同时失效」指向共同上游**：socket 和 http 一起挂，说明问题不在各自实现，而在它们共享的配置加载链路。
3. **ee-core 是 external，运行时加载的是 `node_modules/ee-core/dist`（软链到 `packages/ee-core`）**，改完源码必须 `pnpm run build` 重建 dist，否则运行的还是旧代码。
4. **ESM/CJS interop 要统一**：bundle 模式下凡是从 registry 取 esbuild 打包产物的地方，都要按 `__esModule` + `.default` 解包。新增 registry 消费者时记得复用或对齐这套逻辑。
