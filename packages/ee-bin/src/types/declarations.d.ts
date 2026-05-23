declare module 'config-file-ts' {
  export function loadTsConfig(filepath: string): Record<string, unknown>;
}

declare module 'json5' {
  const json5: {
    parse(text: string, reviver?: (key: string, value: unknown) => unknown): unknown;
    stringify(value: unknown, replacer?: unknown, space?: string | number): string;
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
  export default spawn;
}

declare module 'chokidar' {
  import { FSWatcher } from 'fs';
  export function watch(paths: string | string[], options?: Record<string, unknown>): FSWatcher;
}

declare module 'tree-kill' {
  export default function kill(pid: number, signal?: string | number, callback?: (error?: Error) => void): void;
}

declare module 'icon-gen' {
  export default function icongen(input: string, output: string, options?: Record<string, unknown>): Promise<string[]>;
}

declare module 'javascript-obfuscator' {
  export interface ObfuscationResult {
    getObfuscatedCode(): string;
  }
  export function obfuscate(sourceCode: string, options?: Record<string, unknown>): ObfuscationResult;
}

declare module 'js-yaml' {
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  export function dump(obj: unknown, opts?: Record<string, unknown>): string;
}

declare module 'globby' {
  export function sync(patterns: string | string[], options?: { cwd?: string }): string[];
}
