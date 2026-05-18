# ee-bin / ee-core TypeScript 重构计划

> 目标：将现有 CommonJS 模块（ee-bin、ee-core）全面重构为 TypeScript，同时输出 CJS + ESM 双格式，建立完善的类型系统、测试体系与工程化流程。

***

## 一、现状调研与问题分析

### 1.1 现有架构

```
ee-dev-v5 (pnpm workspace)
├── packages/
│   ├── ee-bin/          # CLI 构建工具（纯 JS，无类型）
│   │   ├── index.js             # CLI 入口 (commander)
│   │   ├── config/bin_default.js
│   │   ├── lib/extend.js, pargv.js, utils.js
│   │   └── tools/encrypt.js, iconGen.js, incrUpdater.js, move.js, serve.js
│   └── ee-core/         # 核心框架（纯 JS，手写 .d.ts）
│       ├── index.js, index.d.ts
│       ├── app/         # Application, Boot, Events, Dir
│       ├── config/      # ConfigLoader, DefaultConfig
│       ├── const/       # Channel constants
│       ├── controller/  # ControllerLoader
│       ├── core/        # FileLoader, Utils, Timing
│       ├── cross/       # Cross, CrossProcess
│       ├── electron/    # App, Window
│       ├── exception/   # ExceptionHandler
│       ├── html/        # Html helper
│       ├── jobs/        # Child, ChildPool, LoadBalancer
│       ├── loader/      # File loader
│       ├── log/         # Logger
│       ├── message/     # ChildMessage
│       ├── ps/          # Process helper
│       ├── socket/      # HttpServer, IpcServer, SocketServer
│       ├── storage/     # SqliteStorage
│       └── utils/       # Port, Extend, Helper, Ip, Is, Json, Pargv, Wrap
└── pnpm-workspace.yaml
```

### 1.2 核心痛点

| 痛点                     | 影响                         |
| ---------------------- | -------------------------- |
| 手写 `.d.ts` 与 `.js` 不同步 | 类型声明与实现分离，维护成本高，易出错        |
| 无原生 TypeScript 源码      | 丢失 IDE 类型推断、重构能力、编译时检查     |
| CommonJS 单一格式          | 无法支持 ESM 项目引用，限制框架扩展性      |
| 无自动化测试                 | 重构风险高，功能回归无保障              |
| 代码风格不统一                | 缺乏 ESLint/Prettier 约束，可读性差 |
| 依赖类型缺失                 | `@types/*` 依赖不完整，部分库无类型支持  |

***

## 二、技术栈转换方案

### 2.1 新建项目结构

在 `packages/` 下新建两个重构项目，开发完成后直接替换原项目：

```
packages/
├── ee-bin/              # [原] 待替换，新模块完成后删除
├── ee-core/             # [原] 待替换，新模块完成后删除
├── ee-bin-ts/           # [新] TypeScript 重构版
│   ├── src/             # TypeScript 源码
│   ├── dist/            # 编译输出 (CJS + ESM)
│   ├── tests/           # 单元测试 + 集成测试
│   └── package.json
└── ee-core-ts/          # [新] TypeScript 重构版
    ├── src/
    ├── dist/
    ├── tests/
    └── package.json
```

### 2.2 TypeScript 严格配置

**`ee-bin-ts/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "outDir": "./dist/esm",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**`ee-core-ts/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2020"],
    "outDir": "./dist/esm",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["node", "electron"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

> **说明**：`module: NodeNext` 是 TypeScript 对 Node.js 原生 ESM 规范的严格实现。它确保编译后的 ESM 输出与 Node.js 加载规则完全一致（如强制 `.js` 扩展名、正确解析 `exports` 条件导出的类型映射），与 CJS 输出互不干扰。

### 2.3 类型系统覆盖策略

#### 2.3.1 内部类型定义

为所有模块建立完整的内部类型：

```typescript
// ee-core-ts/src/types/index.ts

export interface ElectronEggOptions {
  env: string;
  baseDir: string;
  electronDir: string;
  appName: string;
  userHome: string;
  appData: string;
  appUserData: string;
  appVersion: string;
  isPackaged: boolean;
  execDir: string;
}

export interface Config {
  [key: string]: unknown;
  remote?: {
    enable: boolean;
    url: string;
  };
  mainServer?: {
    protocol: string;
    host: string;
    port: number;
  };
  windowsOption?: Electron.BrowserWindowConstructorOptions;
  openDevTools?: boolean | Electron.OpenDevToolsOptions;
}

export interface JobChildOptions {
  name: string;
  script: string;
  args?: string[];
  env?: NodeJS.ProcessEnv;
}
```

#### 2.3.2 公共 API 类型暴露

```typescript
// ee-core-ts/src/index.ts
export { ElectronEgg } from './app/boot.js';
export type { ElectronEggOptions, Config } from './types/index.js';

// ee-bin-ts/src/index.ts
export { ServeProcess } from './tools/serve.js';
export type { DevOptions, BuildOptions } from './types/index.js';
```

#### 2.3.3 第三方依赖类型补齐

| 依赖包                     | 类型现状              | 处理方案                               |
| ----------------------- | ----------------- | ---------------------------------- |
| `commander`             | 自带类型              | 直接使用                               |
| `chalk@4`               | 自带类型              | 直接使用                               |
| `fs-extra`              | `@types/fs-extra` | 安装类型包                              |
| `debug`                 | `@types/debug`    | 安装类型包                              |
| `is-type-of`            | 无类型               | 编写声明文件 `src/types/is-type-of.d.ts` |
| `config-file-ts`        | 无类型               | 编写声明文件                             |
| `javascript-obfuscator` | 可能有类型             | 检查并补齐                              |
| `egg-logger`            | 无类型               | 编写声明文件                             |
| `urllib`                | 无类型               | 编写声明文件                             |
| `koa*`                  | `@types/koa*`     | 安装类型包                              |
| `socket.io`             | 自带类型              | 直接使用                               |
| `bytenode`              | 无类型               | 编写声明文件                             |

***

## 三、双模块输出架构（CJS + ESM）

### 3.1 编译架构设计

```
dist/
├── cjs/                 # CommonJS 输出
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── esm/                 # ESM 输出
│   ├── index.js
│   ├── index.d.ts
│   └── ...
└── types/               # 聚合类型声明 (可选)
    └── index.d.ts
```

### 3.2 package.json 条件导出配置

**`ee-core-ts/package.json`**

```json
{
  "name": "ee-core-ts",
  "version": "5.0.0",
  "description": "ee core - TypeScript edition with dual module support",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "package.json",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=16.0.0"
  },
  "scripts": {
    "build": "npm run clean && npm run build:cjs && npm run build:esm",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:esm": "tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test"
  },
  "dependencies": {
    "agentkeepalive": "^4.2.0",
    "axios": "^1.7.9",
    "bytenode": "^1.3.6",
    "chalk": "^4.1.2",
    "cross-spawn": "^7.0.3",
    "dayjs": "^1.11.7",
    "debug": "^4.3.3",
    "egg-logger": "^2.7.1",
    "globby": "^10.0.0",
    "is-type-of": "^1.2.1",
    "koa": "^2.13.4",
    "koa-body": "^5.0.0",
    "koa-convert": "^2.0.0",
    "koa-static": "^5.0.0",
    "koa2-cors": "^2.0.6",
    "lodash": "^4.17.21",
    "mkdirp": "^2.1.3",
    "semver": "^7.3.8",
    "serialize-javascript": "^6.0.1",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "tree-kill": "^1.2.2",
    "urllib": "^2.38.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/debug": "^4.1.12",
    "@types/fs-extra": "^11.0.4",
    "@types/koa": "^2.15.0",
    "@types/koa-static": "^4.0.4",
    "@types/koa__cors": "^5.0.0",
    "@types/lodash": "^4.17.0",
    "@types/node": "^20.16.0",
    "@types/semver": "^7.5.8",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "typescript": "^5.7.2",
    "vitest": "^1.6.0"
  }
}
```

**`ee-bin-ts/package.json`**

```json
{
  "name": "ee-bin-ts",
  "version": "5.0.0",
  "description": "ee bin - TypeScript edition with dual module support",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/esm/index.d.ts",
  "bin": {
    "ee-bin-ts": "./dist/cjs/index.js"
  },
  "exports": {
    ".": {
      "import": {
        "types": "./dist/esm/index.d.ts",
        "default": "./dist/esm/index.js"
      },
      "require": {
        "types": "./dist/cjs/index.d.ts",
        "default": "./dist/cjs/index.js"
      }
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "package.json",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=16.0.0"
  },
  "scripts": {
    "build": "npm run clean && npm run build:cjs && npm run build:esm",
    "build:cjs": "tsc -p tsconfig.cjs.json",
    "build:esm": "tsc -p tsconfig.json",
    "clean": "rm -rf dist",
    "test": "vitest run",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\""
  },
  "dependencies": {
    "adm-zip": "^0.4.11",
    "bytenode": "^1.3.6",
    "chalk": "^4.1.2",
    "chokidar": "^4.0.3",
    "commander": "^11.0.0",
    "config-file-ts": "^0.2.8-rc1",
    "cross-spawn": "^7.0.3",
    "debug": "^4.4.0",
    "esbuild": "^0.21.5",
    "fs-extra": "^10.0.0",
    "globby": "^10.0.0",
    "is-type-of": "^1.2.1",
    "javascript-obfuscator": "^4.0.2",
    "json5": "^2.2.3",
    "mkdirp": "^2.1.3",
    "js-yaml": "^4.1.0",
    "tree-kill": "^1.2.2"
  },
  "devDependencies": {
    "@types/adm-zip": "^0.5.5",
    "@types/cross-spawn": "^6.0.6",
    "@types/debug": "^4.1.12",
    "@types/fs-extra": "^11.0.4",
    "@types/js-yaml": "^4.0.9",
    "@types/json5": "^2.2.0",
    "@types/mkdirp": "^2.0.0",
    "@types/node": "^20.16.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "typescript": "^5.7.2",
    "vitest": "^1.6.0"
  }
}
```

### 3.3 CJS 专用 tsconfig

**`tsconfig.cjs.json`**（两个项目共用模式）

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist/cjs",
    "declaration": true,
    "declarationMap": true
  }
}
```

### 3.4 条件导出验证

创建验证脚本确保 CJS/ESM 均可正确引用：

```javascript
// scripts/verify-exports.mjs
import { createRequire } from 'module';

// 验证 ESM 导入
const { ElectronEgg } = await import('ee-core-ts');
console.log('ESM import:', typeof ElectronEgg);

// 验证 CJS 导入
const require = createRequire(import.meta.url);
const CJS = require('ee-core-ts');
console.log('CJS require:', typeof CJS.ElectronEgg);

// 验证类型导出
/** @type {import('ee-core-ts').ElectronEggOptions} */
const opts = { env: 'test' };
```

***

## 四、重构实施步骤

### 4.1 实施路线图

```
Phase 1: 基础设施 (2周)
  ├── 创建 ee-core-ts 项目骨架
  ├── 创建 ee-bin-ts 项目骨架
  ├── 配置 tsconfig / eslint / prettier / vitest
  ├── 搭建 CI/CD 流水线
  └── 制定代码规范文档

Phase 2: ee-core-ts 核心迁移 (4周)
  ├── Week 1: utils/ + types/ + const/
  ├── Week 2: config/ + ps/ + log/ + exception/
  ├── Week 3: core/ + loader/ + controller/ + message/
  ├── Week 4: electron/ + app/ + socket/ + storage/
  └── 每模块完成即编写单元测试

Phase 3: ee-core-ts 高级功能迁移 (3周)
  ├── Week 1: jobs/ (Child, ChildPool, LoadBalancer)
  ├── Week 2: cross/ + html/
  ├── Week 3: 集成测试 + 性能基准
  └── 与原 ee-core 并行对比测试

Phase 4: ee-bin-ts 迁移 (3周)
  ├── Week 1: lib/ + config/
  ├── Week 2: tools/ (serve, move, encrypt, iconGen, incrUpdater)
  ├── Week 3: CLI 入口 + 集成测试
  └── 验证所有 CLI 命令行为一致

Phase 5: 集成验证与替换 (2周)
  ├── 在主项目中切换 workspace 引用至新模块
  ├── 完整功能测试（dev/build/start/exec/move/encrypt）
  ├── 性能基准对比
  ├── 验证通过后删除原 ee-bin / ee-core 目录
  └── 编写迁移指南

Phase 6: 正式发布 (1周)
  ├── 版本号对齐（ee-core-ts@5.0.0）
  ├── 发布 npm 包
  ├── 原项目代码归档至 git 历史记录
  └── 通知下游项目
```

### 4.2 模块化迁移策略

采用**功能对等迁移**，每个模块遵循以下流程：

```
1. 分析原模块接口和行为
2. 编写 TypeScript 接口定义
3. 实现 TS 源码（保持函数签名一致）
4. 编写单元测试（覆盖原有场景）
5. 与原模块进行行为对比测试
6. 通过评审后标记完成
```

**示例：utils/extend 模块迁移**

```typescript
// ee-core-ts/src/utils/extend.ts
export type ExtendOptions = {
  deep?: boolean;
};

export function extend<T extends Record<string, unknown>>(
  deep: boolean | ExtendOptions,
  target: T,
  ...sources: Array<Record<string, unknown>>
): T {
  const isDeep = typeof deep === 'boolean' ? deep : deep?.deep ?? false;
  const result = { ...target };

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (isDeep && isPlainObject(val) && isPlainObject(result[key])) {
        result[key] = extend(true, result[key] as Record<string, unknown>, val as Record<string, unknown>);
      } else {
        result[key] = val as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return Object.prototype.toString.call(val) === '[object Object]';
}
```

### 4.3 测试策略

#### 4.3.1 单元测试框架选择

使用 **Vitest**（原生 TS 支持，无需 babel/ts-jest）：

```typescript
// tests/utils/extend.test.ts
import { describe, it, expect } from 'vitest';
import { extend } from '../../src/utils/extend.js';

describe('extend', () => {
  it('should shallow merge objects', () => {
    const a = { x: 1, y: { a: 1 } };
    const b = { y: { b: 2 }, z: 3 };
    expect(extend(false, a, b)).toEqual({ x: 1, y: { b: 2 }, z: 3 });
  });

  it('should deep merge objects when deep=true', () => {
    const a = { x: 1, y: { a: 1 } };
    const b = { y: { b: 2 }, z: 3 };
    expect(extend(true, a, b)).toEqual({ x: 1, y: { a: 1, b: 2 }, z: 3 });
  });
});
```

#### 4.3.2 集成测试

```typescript
// tests/integration/electron-egg.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ElectronEgg } from '../../src/app/boot.js';

describe('ElectronEgg Integration', () => {
  let app: ElectronEgg;

  beforeAll(() => {
    // mock electron app
    app = new ElectronEgg();
  });

  it('should initialize with correct options', () => {
    expect(app).toBeDefined();
  });
});
```

#### 4.3.3 CLI 行为测试

```typescript
// tests/bin/serve.test.ts
import { describe, it, expect } from 'vitest';
import { ServeProcess } from '../../src/tools/serve.js';

describe('ServeProcess', () => {
  const serve = new ServeProcess();

  it('should set NODE_ENV to prod by default', () => {
    expect(process.env.NODE_ENV).toBe('prod');
  });

  it('should change NODE_ENV to dev in dev mode', () => {
    serve.dev({});
    expect(process.env.NODE_ENV).toBe('dev');
  });
});
```

#### 4.3.4 覆盖率要求

```json
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      }
    }
  }
};
```

### 4.4 CI/CD 流程

**`.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm run lint

      - name: Type check
        run: pnpm run typecheck

      - name: Build
        run: pnpm run build

      - name: Test
        run: pnpm run test

      - name: Verify exports
        run: node scripts/verify-exports.mjs
```

***

## 五、工程化补充方案

### 5.1 ESLint + Prettier 配置

**`packages/eslint-config/index.js`**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-console': ['warn', { allow: ['error', 'warn'] }]
  }
};
```

**`packages/prettier-config/index.json`**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

### 5.2 版本控制策略

| 原模块版本          | 新模块版本             | 说明            |
| -------------- | ----------------- | ------------- |
| ee-core\@4.1.5 | ee-core-ts\@5.0.0 | 主版本号升级，标识重大变更 |
| ee-bin\@4.2.0  | ee-bin-ts\@5.0.0  | 主版本号升级，标识重大变更 |

**版本对齐规则**：

- 新模块从 `5.0.0` 开始，与主项目 `ee-next@5.0.0` 版本对齐
- 后续使用语义化版本（SemVer）
- 在 `package.json` 中标记原模块为 `deprecated`

### 5.3 文档系统

```
docs/
├── api/                     # 自动生成的 API 文档
│   ├── ee-core-ts/          # TypeDoc 输出
│   └── ee-bin-ts/
├── guides/
│   ├── migration.md         # 从旧模块迁移指南
│   ├── contributing.md      # 开发贡献指南
│   └── architecture.md      # 架构设计文档
└── README.md
```

**TypeDoc 配置**：

```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "theme": "default",
  "excludeExternals": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "readme": "README.md"
}
```

### 5.4 性能基准测试

```typescript
// benchmarks/core-boot.bench.ts
import { bench, describe } from 'vitest';
import { ElectronEgg } from '../src/app/boot.js';

describe('ElectronEgg boot performance', () => {
  bench('new ElectronEgg()', () => {
    // mock electron environment
    new ElectronEgg();
  }, { iterations: 100 });
});
```

对比指标：

- 启动时间（与原模块对比，偏差 < 10%）
- 内存占用（与原模块对比，偏差 < 15%）
- 包体积（CJS + ESM 总计 vs 原模块）

### 5.5 Tree-shaking 支持

确保 ESM 输出支持 Tree-shaking：

```typescript
// 使用纯函数和独立导出，避免副作用
export { extend } from './utils/extend.js';
export { helper } from './utils/helper.js';

// 避免 barrel file 中的副作用导入
// ❌ 不要这样做：
// import './side-effect.js';

// ✅ 保持每个模块独立可摇树
```

在 `package.json` 中添加：

```json
{
  "sideEffects": false
}
```

### 5.6 直接替换策略

新模块开发完成后直接替换原模块，不保留过渡期共存：

1. 新模块使用新包名（`ee-core-ts`、`ee-bin-ts`）独立发布
2. 主项目 `package.json` 直接切换 workspace 引用至新模块
3. 原模块（`ee-bin`、`ee-core`）从 workspace 中移除
4. 所有功能验证通过后一次性提交，不保留旧代码

```bash
# 替换步骤
rm -rf packages/ee-bin packages/ee-core
# 更新根 package.json 的依赖引用
pnpm install
# 运行全量测试验证
pnpm test
```

***

## 六、验收标准

### 6.1 功能验收

| 检查项           | 标准                                                             | 验证方式         |
| ------------- | -------------------------------------------------------------- | ------------ |
| 功能一致性         | 所有原有功能正常工作                                                     | 运行原项目测试套件    |
| CLI 命令        | dev/build/start/exec/move/encrypt/icon                         | 逐个命令手动+自动化测试 |
| Electron 生命周期 | boot → loadConfig → loadController → loadSocket → loadElectron | 集成测试         |
| 跨进程通信         | cross/crossProcess 行为一致                                        | 单元测试         |
| 任务调度          | jobs/child/child-pool/load-balancer                            | 单元测试         |

### 6.2 类型验收

| 检查项       | 标准          | 验证方式                     |
| --------- | ----------- | ------------------------ |
| 公共 API 类型 | 100% 覆盖     | TypeDoc 生成检查             |
| 内部函数类型    | 核心函数均有类型    | `tsc --noEmit` 零报错       |
| 第三方依赖类型   | 所有依赖均有类型或声明 | `skipLibCheck: false` 测试 |

### 6.3 模块格式验收

| 检查项    | 标准                                              | 验证方式                                |
| ------ | ----------------------------------------------- | ----------------------------------- |
| CJS 引用 | `require('ee-core-ts')` 正常工作                    | Node.js 测试脚本                        |
| ESM 引用 | `import { ElectronEgg } from 'ee-core-ts'` 正常工作 | Node.js `--experimental-vm-modules` |
| 类型导入   | `import type { Config } from 'ee-core-ts'` 可用   | IDE 检查                              |
| 条件导出   | Node.js 自动选择正确格式                                | `verify-exports.mjs` 脚本             |

### 6.4 测试覆盖

| 指标    | 目标     | 最低要求   |
| ----- | ------ | ------ |
| 行覆盖率  | >= 92% | >= 90% |
| 函数覆盖率 | >= 92% | >= 90% |
| 分支覆盖率 | >= 88% | >= 85% |
| 语句覆盖率 | >= 92% | >= 90% |

### 6.5 性能验收

| 指标   | 目标                  | 验证方式                     |
| ---- | ------------------- | ------------------------ |
| 启动时间 | <= 原模块 110%         | vitest benchmark         |
| 内存占用 | <= 原模块 115%         | process.memoryUsage() 对比 |
| 包体积  | CJS+ESM <= 原模块 130% | `du -sh dist/`           |
| 构建时间 | 双格式构建 < 30s         | CI 计时                    |

***

## 七、风险评估与应对

### 7.1 风险矩阵

| 风险项               | 概率 | 影响 | 等级 | 应对措施                            |
| ----------------- | -- | -- | -- | ------------------------------- |
| 第三方依赖无类型定义        | 高  | 中  | 中  | 编写 `.d.ts` 声明文件，优先选择有类型的替代库     |
| Electron API 类型变更 | 中  | 高  | 高  | 锁定 `@types/electron` 版本，升级前充分测试 |
| CJS/ESM 互操作问题     | 低  | 中  | 低  | Node.js 22.12.0+ 原生支持 `require(esm)`，`exports` 条件导出由 Node 自动匹配，无需额外处理 |
| 功能回归（重构引入 Bug）    | 中  | 高  | 高  | 每模块配对测试，高覆盖率，CI 阻塞              |
| 下游项目兼容性问题         | 低  | 高  | 中  | 保持 API 签名一致，提供详细迁移指南，版本号主版本升级标识 break change |
| 性能下降              | 低  | 中  | 低  | 基准测试监控，性能回归即阻塞                  |
| 构建复杂度增加           | 高  | 低  | 低  | 自动化脚本封装，文档化构建流程                 |

***

## 八、实施检查清单

### 8.1 启动前检查

- [ ] 原项目代码冻结（或建立重构分支）
- [ ] 确认所有核心成员理解重构计划
- [ ] 确认 CI/CD 环境可用
- [ ] 确认测试基线已建立

### 8.2 每阶段检查

- [ ] 代码审查通过（至少 1 人）
- [ ] 单元测试通过（覆盖率达标）
- [ ] 类型检查通过（`tsc --noEmit` 零报错）
- [ ] Lint 检查通过（无 Error）
- [ ] 集成测试通过（与原模块行为一致）

### 8.3 发布前检查

- [ ] 版本号已更新
- [ ] CHANGELOG 已编写
- [ ] 文档已更新
- [ ] 迁移指南已编写
- [ ] 性能基准已对比通过
- [ ] 回归测试已全部通过

***

## 九、待定优化计划

> 以下优化项待 TypeScript 重构完成后，单独排期实现。

### 9.1 去掉 lodash

- **现状**：`ee-core/socket/httpServer.js` 等文件使用了 `_.includes`、`_.cloneDeep`、`_.merge` 等方法
- **方案**：
  - `_.includes(arr, val)` → `arr.includes(val)`
  - `_.cloneDeep(obj)` → `JSON.parse(JSON.stringify(obj))`（简单场景）或手写递归深拷贝
  - `_.merge(a, b)` → 使用重构后的 `extend` 方法（见 9.2）
  - `_.pick`、`_.omit` → ES 解构语法
  - `_.isEqual` → 手写递归比较
- **影响范围**：`ee-core/socket/`、`ee-core/utils/`、`ee-core/jobs/`

### 9.2 去掉 extend，封装替代方法

- **现状**：`ee-core/lib/extend.js` 和 `ee-bin/lib/extend.js` 各自维护了一套对象合并逻辑
- **方案**：
  1. 在 `ee-core` 中统一封装 `deepMerge<T>(target: T, ...sources: Partial<T>[]): T`
  2. `ee-bin` 作为 `ee-core` 的下游，直接引用 `ee-core` 的合并方法
  3. 不再依赖 `is-type-of` 判断对象类型，改用 TS 类型守卫
- **接口设计**：
  ```ts
  export function deepMerge<T extends Record<string, unknown>>(
    target: T,
    ...sources: Array<Record<string, unknown>>
  ): T;

  export function shallowMerge<T extends Record<string, unknown>>(
    target: T,
    ...sources: Array<Record<string, unknown>>
  ): T;
  ```

### 9.3 去掉 @types/electron

- **现状**：`devDependencies` 中声明了 `@types/electron@^1.4.38`，版本极旧
- **方案**：直接移除
- **原因**：Electron 25+ 自带 `electron.d.ts`，无需额外安装类型包
- **注意**：确认项目引用的 Electron 版本（39.x）已内置类型声明

### 9.4 去掉 mkdirp

- **现状**：`ee-bin/tools/move.js` 等文件调用了 `mkdirp.sync(path)`
- **方案**：全部替换为 `fs.mkdirSync(path, { recursive: true })`
- **兼容性**：`recursive` 选项在 Node.js 10.12.0+ 支持，Electron 39 内嵌 Node 22，完全兼容

### 9.5 去掉 config-file-ts

- **现状**：`ee-bin/lib/utils.js` 使用 `loadTsConfig()` 加载 `.ts` 配置文件
- **方案**：
  1. 改用 `tsx` 或 `ts-node` 的 `--import` loader 方案
  2. 或要求用户配置文件使用 `.js` / `.mjs` 格式
  3. 如果必须支持 `.ts` 配置，在 `ee-bin` 中内联一个轻量级 loader（基于 `esbuild` 注册）
- **注意**：需评估对用户配置习惯的影响

### 9.6 实施顺序建议

| 顺序 | 事项 | 优先级 | 预估工作量 |
|------|------|--------|-----------|
| 1 | 去掉 `@types/electron` | 高 | 5 分钟 |
| 2 | 去掉 `mkdirp` | 高 | 30 分钟 |
| 3 | 去掉 `config-file-ts` | 中 | 2-4 小时 |
| 4 | 封装 `extend` 替代方法 | 中 | 2-4 小时 |
| 5 | 去掉 `lodash` | 低 | 4-8 小时 |

---

## 十、参考资源

- [TypeScript Handbook - Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [Node.js Dual Module Packages](https://nodejs.org/api/packages.html#dual-commonjses-module-packages)
- [Vitest Documentation](https://vitest.dev/)
- [TypeDoc Documentation](https://typedoc.org/)
- [pnpm Workspace Guide](https://pnpm.io/workspaces)

