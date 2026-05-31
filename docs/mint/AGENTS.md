# Documentation project instructions

## About this project

- This is a documentation site for [electron-egg](https://github.com/dromara/electron-egg) built on [Mintlify](https://mintlify.com)
- Pages are MDX files with YAML frontmatter, content in **Chinese (中文)**
- Configuration lives in `docs.json`
- Run `mintlify dev` to preview locally (Mintlify is installed globally)
- Run `mintlify broken-links` to check links
- Run `mintlify validate` to validate build

## Terminology

- **ee-core**: 运行框架（runtime framework core package）
- **ee-bin**: 构建工具（CLI build tool package）
- **electron-egg**: 框架名称
- **Bundle 模式**: esbuild 打包模式，运行时从注册表加载
- **Dev 模式**: 开发模式，运行时从文件系统加载
- **控制器 (Controller)**: 业务逻辑处理模块
- **跨进程 (Cross)**: Go/Python 后端服务管理
- **子进程任务 (Jobs)**: ChildJob/ChildPoolJob 后台任务

## Style preferences

- Use Chinese (中文) for all content
- Use active voice and second person ("你")
- Keep sentences concise — one idea per sentence
- Bold for UI elements: 点击 **设置**
- Code formatting for file names, commands, paths, and code references
- Use Mintlify components: `<Steps>`, `<Note>`, `<Warning>`, `<Tabs>`, `<CodeGroup>`, `<Card>`
- Include practical code examples in TypeScript/JavaScript
- Reference API with full import paths: `ee-core/config`, `ee-core/controller`, etc.

## Content boundaries

- Document all public APIs of ee-core (16 subpath exports)
- Document all ee-bin CLI commands and configuration options
- Document architectural concepts (lifecycle, config pipeline, controller loading, IPC)
- Document advanced topics (encryption, middleware, window management, ESM support)
- Do NOT document internal implementation details not exposed through public API
- Do NOT document the original JS packages (ee-core-js, ee-bin-js) — only the TypeScript versions