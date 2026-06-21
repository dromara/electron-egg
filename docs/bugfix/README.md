# Bugfix 记录

本目录记录排查过的问题、根因与修复，以及功能增强的设计取舍，供后续遇到类似问题时参考。

## 索引

| 文档 | 类型 | 一句话概要 |
|------|------|-----------|
| [config-loader-esm-default-interop](./config-loader-esm-default-interop.md) | Bug 修复 | Bundle 模式下 ConfigLoader 未解开 esbuild 的 ESM `default` 包装，导致 httpServer / socketServer 配置丢失、服务静默不启动 |
| [preload-bridge-ts-not-emitted](./preload-bridge-ts-not-emitted.md) | Bug 修复 | `_copyUnbundledFiles` 写死查找 `bridge.js` 且裸复制，TS 项目下 `public/electron/preload/bridge.js` 不生成 |
| [log-timestamp-timezone](./log-timestamp-timezone.md) | 功能增强 | 日志时间戳支持时区配置：默认 UTC（机器可读），可显式设 `Asia/Shanghai` 等输出带偏移的本地时间 |
| [globby-esm-cjs-harmony-os](./globby-esm-cjs-harmony-os.md) | 跨平台兼容 | globby@16 纯 ESM 包在鸿蒙 OS CJS 运行时报 `ERR_REQUIRE_ESM`，用 fs 递归扫描替代并移除运行时 globby 依赖 |

## 排查经验速查

几条在排查中反复验证有效的经验（详见各文档「经验教训」小节）：

1. **优先开 DEBUG**：`DEBUG='ee-core:config:*' pnpm dev-electron` 直接打印运行时真实状态（合并后的 config 等），比读源码逐层推断快得多。
2. **改完 ee-core / ee-bin 必须重建**：运行时加载的是 `node_modules/*/dist`（软链到 `packages/*`），改完源码要 `pnpm run build`，否则跑的是旧代码。
3. **多个相关功能同时失效 → 怀疑共同上游**：如 http + socket 一起静默，问题多半在它们共享的配置 / registry 加载链路，而非各自实现。
4. **不要假设源码扩展名**：框架要同时支持 JS / TS 项目，按路径找业务文件时应 glob 多扩展名，而非写死 `.js`。
5. **警惕静默跳过**：`if (existsSync) {...}` 找不到就跳过、无日志，关键产物缺失时很难发现。
6. **纯 ESM 包是 CJS 运行环境的隐患**：即使当前 Node.js 支持 `require(esm)` 实验特性，低版本或移植版本可能不支持。运行时模块应避免依赖纯 ESM 包，或确保只走 ESM 加载路径。
7. **"能跑"不等于"没问题"**：macOS 正常运行可能掩盖了依赖的脆弱性，跨平台部署才暴露根因。

## 命名约定

- 文件名用 kebab-case，简述问题，如 `config-loader-esm-default-interop.md`
- 正文建议包含：日期、影响范围 / 类型、涉及文件、现象、根因、修复、验证、经验教训
