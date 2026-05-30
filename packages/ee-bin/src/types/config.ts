export interface ExecConfig {
  directory: string;
  cmd: string;
  args?: string[];
  stdio?: 'inherit' | 'pipe' | 'ignore';
  sync?: boolean;
  protocol?: string;
  watch?: boolean;
  delay?: number;
  hostname?: string;
  port?: number;
  indexPath?: string;
  force?: boolean;
  loadingPage?: string;
}

export interface BundleConfig {
  bundleType?: 'bundle' | 'copy';
  external?: string[];
  sourcemap?: boolean | 'inline' | 'external';
  minify?: boolean;
  drop?: ('console' | 'debugger')[];
  keepNames?: boolean;
  legalComments?: 'inline' | 'eof' | 'none';
  define?: Record<string, string>;
  copy?: string[];
  format?: 'cjs' | 'esm';
}

export interface ConfusionOptions {
  compact?: boolean;
  stringArray?: boolean;
  stringArrayThreshold?: number;
  stringArrayEncoding?: Array<'none' | 'base64' | 'rc4'>;
  stringArrayCallsTransform?: boolean;
  deadCodeInjection?: boolean;
  numbersToExpressions?: boolean;
  target?: 'browser' | 'node';
  silent?: boolean;
}

export interface BytecodeOptions {
  filename?: string;
  output?: string;
  electron?: boolean;
}

export interface EncryptConfig {
  type: 'confusion' | 'bytecode' | 'strict' | 'none';
  files?: string[];
  fileExt?: string[];
  specificFiles?: string[];
  cleanFiles?: string[];
  encryptDir?: string;
  confusionOptions?: ConfusionOptions;
  bytecodeOptions?: BytecodeOptions;
}

export interface MoveConfig {
  src: string;
  dest: string;
  dist?: string;
  target?: string;
}

export interface UpdaterConfig {
  metadata: string;
  asarFile?: string;
  output: {
    directory: string;
    zip: string;
    file: string;
  };
  extraResources?: string[];
  asarUnpacked?: string[];
  cleanCache?: boolean;
}

export interface BuildConfig {
  electron: BundleConfig;
  [key: string]: ExecConfig | BundleConfig | undefined;
}

export interface BinConfig {
  dev: Record<string, ExecConfig>;
  build: BuildConfig;
  move: Record<string, MoveConfig>;
  start: ExecConfig;
  encrypt: Record<string, EncryptConfig>;
  exec: Record<string, ExecConfig>;
  updater?: Record<string, UpdaterConfig>;
}