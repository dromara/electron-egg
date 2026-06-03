# Bugfix 记录

本目录记录排查过的问题、根因与修复，以及功能增强的设计取舍，供后续遇到类似问题时参考。

## 索引

| 文档 | 类型 | 一句话概要 |
|------|------|-----------|
| [config-loader-esm-default-interop](./config-loader-esm-default-interop.md) | Bug 修复 | Bundle 模式下 ConfigLoader 未解开 esbuild 的 ESM `default` 包装，导致 httpServer / socketServer 配置丢失、服务静默不启动 |
| [preload-bridge-ts-not-emitted](./preload-bridge-ts-not-emitted.md) | Bug 修复 | `_copyUnbundledFiles` 写死查找 `bridge.js` 且裸复制，TS 项目下 `public/electron/preload/bridge.js` 不生成 |
| [log-timestamp-timezone](./log-timestamp-timezone.md) | 功能增强 | 日志时间戳支持时区配置：默认 UTC（机器可读），可显式设 `Asia/Shanghai` 等输出带偏移的本地时间 |

## 排查经验速查

几条在排查中反复验证有效的经验（详见各文档「经验教训」小节）：

1. **优先开 DEBUG**：`DEBUG='ee-core:config:*' pnpm dev-electron` 直接打印运行时真实状态（合并后的 config 等），比读源码逐层推断快得多。
2. **改完 ee-core / ee-bin 必须重建**：运行时加载的是 `node_modules/*/dist`（软链到 `packages/*`），改完源码要 `pnpm run build`，否则跑的是旧代码。
3. **多个相关功能同时失效 → 怀疑共同上游**：如 http + socket 一起静默，问题多半在它们共享的配置 / registry 加载链路，而非各自实现。
4. **不要假设源码扩展名**：框架要同时支持 JS / TS 项目，按路径找业务文件时应 glob 多扩展名，而非写死 `.js`。
5. **警惕静默跳过**：`if (existsSync) {...}` 找不到就跳过、无日志，关键产物缺失时很难发现。

## 命名约定

- 文件名用 kebab-case，简述问题，如 `config-loader-esm-default-interop.md`
- 正文建议包含：日期、影响范围 / 类型、涉及文件、现象、根因、修复、验证、经验教训
