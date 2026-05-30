/**
 * Third-Party Module Type Declarations
 *
 * Provides manual type declarations for third-party dependencies that lack official
 * @types packages or have incomplete type definitions. Each library has a specific
 * usage context within ee-bin:
 *   - json5: For parsing JSON5-format configuration files
 *   - bytenode: For compiling JS to V8 bytecode (.jsc) for code encryption
 *   - cross-spawn: For cross-platform child process launching (resolves Windows shell compatibility)
 *   - chokidar: For watching electron directory file changes in dev mode
 *   - tree-kill: For cross-platform process tree termination (kills parent + all child processes)
 *   - javascript-obfuscator: For JS code obfuscation encryption
 *   - js-yaml: For parsing YAML-format update metadata files
 *   - globby: For filesystem scanning based on glob patterns
 */

declare module 'json5' {
  const json5: {
    /** Parse JSON5 text into a JS value (supports comments, trailing commas, and other extended syntax) */
    parse(text: string, reviver?: (key: string, value: unknown) => unknown): unknown;
    /** Serialize a JS value to JSON5 text */
    stringify(value: unknown, replacer?: (key: string, value: unknown) => unknown | string[] | number[], space?: string | number): string;
  };
  export default json5;
}

declare module 'bytenode' {
  /** Compile a JS file to V8 bytecode (.jsc); enable electron mode for V8 compatibility */
  export function compileFile(args: {
    /** Input .js source file path */
    filename: string;
    /** Output .jsc bytecode file path */
    output: string;
    /** Whether to compile for Electron's V8 engine (Electron V8 version may differ from Node's) */
    electron?: boolean;
  }): void;
}

declare module 'cross-spawn' {
  import { SpawnOptions, ChildProcess } from 'child_process';
  /** Extended SpawnOptions with maxBuffer for high-output commands */
  interface CrossSpawnOptions extends SpawnOptions {
    maxBuffer?: number;
  }
  /** Launch a child process asynchronously, returns ChildProcess instance (supports event listeners, pid access) */
  export function spawn(command: string, args?: string[], options?: CrossSpawnOptions): ChildProcess;
  /** Launch a child process synchronously, returns result object (already completed, no event listening) */
  export function sync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number; error?: Error };
  /** Alias for spawnSync */
  export function spawnSync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number; error?: Error };
  export default spawn;
}

declare module 'chokidar' {
  /**
   * chokidar's FSWatcher interface (not Node.js fs.FSWatcher).
   * Node's fs.FSWatcher only watches a single file, whereas chokidar.FSWatcher supports
   * recursive directory watching, add/unwatch operations, etc. The two APIs are completely
   * different and cannot be used interchangeably.
   */
  interface ChokidarFSWatcher {
    on(event: 'change' | 'add' | 'unlink' | 'error' | 'ready' | 'all', handler: (path: string, ...args: unknown[]) => void): ChokidarFSWatcher;
    on(event: string, handler: (...args: unknown[]) => void): ChokidarFSWatcher;
    close(): Promise<void>;
    add(paths: string | string[]): ChokidarFSWatcher;
    unwatch(paths: string | string[]): ChokidarFSWatcher;
  }

  /** chokidar watch options — only includes fields actually used by ee-bin */
  interface ChokidarWatchOptions {
    persistent?: boolean;
    ignoreInitial?: boolean;
    cwd?: string;
    ignored?: string | string[] | ((path: string) => boolean);
    depth?: number;
  }

  /** Start a filesystem watcher */
  export function watch(paths: string | string[], options?: ChokidarWatchOptions): ChokidarFSWatcher;
}

declare module 'tree-kill' {
  /**
   * Terminate a process tree (kill pid and all its child processes).
   * callback error is null on success, non-null on failure.
   */
  export default function kill(pid: number, signal?: string | number, callback?: (error: Error | null) => void): void;
}

declare module 'javascript-obfuscator' {
  export interface ObfuscationResult {
    getObfuscatedCode(): string;
  }
  /**
   * Obfuscate JS source code.
   * options references ConfusionOptions type directly instead of Record<string, unknown>,
   * ensuring type consistency with ee-bin's config types and preventing type drift.
   */
  export function obfuscate(sourceCode: string, options?: import('../types/config.js').ConfusionOptions): ObfuscationResult;
}

declare module 'js-yaml' {
  /** Parse YAML text into a JS value (used for reading electron-builder-generated update metadata) */
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  /** Serialize a JS value to YAML text */
  export function dump(obj: unknown, opts?: Record<string, unknown>): string;
}

declare module 'globby' {
  /** globby common options */
  interface GlobbyOptions {
    cwd?: string;
    /** Exclude matched files/directories */
    ignore?: string | string[];
    /** Whether to match dotfiles (e.g. .env) */
    dot?: boolean;
    /** Only return file paths */
    onlyFiles?: boolean;
    /** Only return directory paths */
    onlyDirectories?: boolean;
  }

  /**
   * globby callable interface — supports both async invocation and .sync() method.
   * Uses interface instead of separate exported functions because globby's default export
   * is a callable function that also has a sync static method attached to it.
   */
  interface Globby {
    /** Asynchronously scan the filesystem, returning matched path list */
    (patterns: string | string[], options?: GlobbyOptions): Promise<string[]>;
    /** Synchronously scan the filesystem, returning matched path list */
    sync(patterns: string | string[], options?: GlobbyOptions): string[];
  }

  const globby: Globby;
  export default globby;
}
