declare module 'mkdirp' {
  export function sync(dir: string, opts?: { mode?: number }): string | undefined;
}

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

declare module 'is-type-of' {
  const is: {
    function(value: unknown): boolean;
    class(value: unknown): boolean;
    string(value: unknown): boolean;
    array(value: unknown): boolean;
    object(value: unknown): boolean;
    boolean(value: unknown): boolean;
    number(value: unknown): boolean;
    null(value: unknown): boolean;
    undefined(value: unknown): boolean;
    date(value: unknown): boolean;
    regexp(value: unknown): boolean;
    error(value: unknown): boolean;
    promise(value: unknown): boolean;
    generatorFunction(value: unknown): boolean;
    asyncFunction(value: unknown): boolean;
  };
  export default is;
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

declare module 'adm-zip' {
  class AdmZip {
    constructor(zipPath?: string);
    addLocalFile(localPath: string, zipPath?: string): void;
    addLocalFolder(localPath: string, zipPath?: string): void;
    writeZip(zipPath?: string, callback?: (error?: Error) => void): void;
    extractAllTo(targetPath: string, overwrite?: boolean): void;
    getEntries(): Array<{ entryName: string; getData(): Buffer }>;
    readFile(fileName: string): Buffer;
  }
  export = AdmZip;
}

declare module 'js-yaml' {
  export function load(str: string, opts?: Record<string, unknown>): unknown;
  export function dump(obj: unknown, opts?: Record<string, unknown>): string;
}

declare module 'globby' {
  export function sync(patterns: string | string[], options?: { cwd?: string }): string[];
}
