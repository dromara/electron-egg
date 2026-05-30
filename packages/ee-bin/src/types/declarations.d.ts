declare module 'json5' {
  const json5: {
    parse(text: string, reviver?: (key: string, value: unknown) => unknown): unknown;
    stringify(value: unknown, replacer?: (key: string, value: unknown) => unknown | string[] | number[], space?: string | number): string;
  };
  export default json5;
}

declare module 'bytenode' {
  export function compileFile(args: {
    filename: string;
    output: string;
    electron?: boolean;
  }): void;
}

declare module 'cross-spawn' {
  import { SpawnOptions, ChildProcess } from 'child_process';
  interface CrossSpawnOptions extends SpawnOptions {
    maxBuffer?: number;
  }
  export function spawn(command: string, args?: string[], options?: CrossSpawnOptions): ChildProcess;
  export function sync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number };
  export function spawnSync(command: string, args?: string[], options?: CrossSpawnOptions): { status: number | null; output: string[]; stdout: string | Buffer; stderr: string | Buffer; signal: string | null; pid: number };
  export default spawn;
}

declare module 'chokidar' {
  interface ChokidarFSWatcher {
    on(event: 'change' | 'add' | 'unlink' | 'error' | 'ready' | 'all', handler: (path: string, ...args: unknown[]) => void): ChokidarFSWatcher;
    on(event: string, handler: (...args: unknown[]) => void): ChokidarFSWatcher;
    close(): Promise<void>;
    add(paths: string | string[]): ChokidarFSWatcher;
    unwatch(paths: string | string[]): ChokidarFSWatcher;
  }

  interface ChokidarWatchOptions {
    persistent?: boolean;
    ignoreInitial?: boolean;
    cwd?: string;
    ignored?: string | string[] | ((path: string) => boolean);
    depth?: number;
  }

  export function watch(paths: string | string[], options?: ChokidarWatchOptions): ChokidarFSWatcher;
}

declare module 'tree-kill' {
  export default function kill(pid: number, signal?: string | number, callback?: (error: Error | null) => void): void;
}

declare module 'javascript-obfuscator' {
  export interface ObfuscationResult {
    getObfuscatedCode(): string;
  }
  export function obfuscate(sourceCode: string, options?: import('../types/config.js').ConfusionOptions): ObfuscationResult;
}

declare module 'js-yaml' {
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  export function dump(obj: unknown, opts?: Record<string, unknown>): string;
}

declare module 'globby' {
  interface GlobbyOptions {
    cwd?: string;
    ignore?: string | string[];
    dot?: boolean;
    onlyFiles?: boolean;
    onlyDirectories?: boolean;
  }

  interface Globby {
    (patterns: string | string[], options?: GlobbyOptions): Promise<string[]>;
    sync(patterns: string | string[], options?: GlobbyOptions): string[];
  }

  const globby: Globby;
  export default globby;
}