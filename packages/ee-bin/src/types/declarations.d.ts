/**
 * 第三方模块类型声明
 *
 * 为没有官方 @types 包或类型定义不完整的第三方依赖提供手动类型声明。
 * 这些库在 ee-bin 中有具体的使用场景：
 *   - json5: 用于解析 JSON5 格式的配置文件
 *   - bytenode: 用于将 JS 编译为 V8 字节码 (.jsc)，实现代码加密
 *   - cross-spawn: 用于跨平台子进程启动（解决 Windows 上的 shell 兼容问题）
 *   - chokidar: 用于开发模式下监听 electron 目录文件变化
 *   - tree-kill: 用于跨平台终止子进程树（杀掉父进程及其所有子进程）
 *   - javascript-obfuscator: 用于 JS 代码混淆加密
 *   - js-yaml: 用于解析 YAML 格式的更新元数据文件
 *   - globby: 用于基于 glob 模式扫描文件系统
 */

declare module 'json5' {
  const json5: {
    /** 解析 JSON5 文本为 JS 值（支持注释、尾逗号等扩展语法） */
    parse(text: string, reviver?: (key: string, value: unknown) => unknown): unknown;
    /** 将 JS 值序列化为 JSON5 文本 */
    stringify(value: unknown, replacer?: (key: string, value: unknown) => unknown | string[] | number[], space?: string | number): string;
  };
  export default json5;
}

declare module 'bytenode' {
  /** 将 JS 文件编译为 V8 字节码 (.jsc)，electron 模式下启用 V8 兼容 */
  export function compileFile(args: {
    /** 输入 .js 源文件路径 */
    filename: string;
    /** 输出 .jsc 字节码文件路径 */
    output: string;
    /** 是否为 Electron 的 V8 引擎编译（Electron 版本可能与 Node 版本不同） */
    electron?: boolean;
  }): void;
}

declare module 'cross-spawn' {
  import { SpawnOptions, ChildProcess } from 'child_process';
  /** 扩展 SpawnOptions，增加 maxBuffer 用于大输出量的命令 */
  interface CrossSpawnOptions extends SpawnOptions {
    maxBuffer?: number;
  }
  /** 异步启动子进程，返回 ChildProcess 实例（可监听事件、获取 pid） */
  export function spawn(command: string, args?: string[], options?: CrossSpawnOptions): ChildProcess;
  /** 同步启动子进程，返回结果对象（已执行完毕，无事件监听能力） */
  export function sync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number };
  /** spawnSync 的别名 */
  export function spawnSync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number };
  export default spawn;
}

declare module 'chokidar' {
  /**
   * chokidar 的 FSWatcher 接口（不是 Node.js fs.FSWatcher）
   * Node fs.FSWatcher 仅监听单个文件，而 chokidar.FSWatcher 支持目录递归监听、
   * add/unwatch 等操作，两者 API 完全不同，因此不能混用。
   */
  interface ChokidarFSWatcher {
    on(event: 'change' | 'add' | 'unlink' | 'error' | 'ready' | 'all', handler: (path: string, ...args: unknown[]) => void): ChokidarFSWatcher;
    on(event: string, handler: (...args: unknown[]) => void): ChokidarFSWatcher;
    close(): Promise<void>;
    add(paths: string | string[]): ChokidarFSWatcher;
    unwatch(paths: string | string[]): ChokidarFSWatcher;
  }

  /** chokidar watch 选项 — 仅包含 ee-bin 实际使用的字段 */
  interface ChokidarWatchOptions {
    persistent?: boolean;
    ignoreInitial?: boolean;
    cwd?: string;
    ignored?: string | string[] | ((path: string) => boolean);
    depth?: number;
  }

  /** 启动文件系统监听器 */
  export function watch(paths: string | string[], options?: ChokidarWatchOptions): ChokidarFSWatcher;
}

declare module 'tree-kill' {
  /**
   * 终止进程树（杀掉 pid 及其所有子进程）
   * callback 中 error 为 null 表示成功，非 null 表示失败
   */
  export default function kill(pid: number, signal?: string | number, callback?: (error: Error | null) => void): void;
}

declare module 'javascript-obfuscator' {
  export interface ObfuscationResult {
    getObfuscatedCode(): string;
  }
  /**
   * 混淆 JS 源代码
   * options 直接引用 ConfusionOptions 类型而非 Record<string, unknown>，
   * 确保与 ee-bin 的配置类型一致，避免类型漂移
   */
  export function obfuscate(sourceCode: string, options?: import('../types/config.js').ConfusionOptions): ObfuscationResult;
}

declare module 'js-yaml' {
  /** 解析 YAML 文本为 JS 值（用于读取 electron-builder 生成的更新元数据） */
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  /** 将 JS 值序列化为 YAML 文本 */
  export function dump(obj: unknown, opts?: Record<string, unknown>): string;
}

declare module 'globby' {
  /** globby 通用选项 */
  interface GlobbyOptions {
    cwd?: string;
    /** 排除匹配的文件/目录 */
    ignore?: string | string[];
    /** 是否匹配点号文件（如 .env） */
    dot?: boolean;
    /** 仅返回文件路径 */
    onlyFiles?: boolean;
    /** 仅返回目录路径 */
    onlyDirectories?: boolean;
  }

  /**
   * globby callable interface — 同时支持异步调用和 .sync() 方法
   * 使用 interface 而非单独 export function 是因为 globby 的 default export
   * 是一个可调用函数，同时该函数对象上还挂载了 sync 静态方法。
   */
  interface Globby {
    /** 异步扫描文件系统，返回匹配的路径列表 */
    (patterns: string | string[], options?: GlobbyOptions): Promise<string[]>;
    /** 同步扫描文件系统，返回匹配的路径列表 */
    sync(patterns: string | string[], options?: GlobbyOptions): string[];
  }

  const globby: Globby;
  export default globby;
}