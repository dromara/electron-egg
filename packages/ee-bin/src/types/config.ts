export interface ExecConfig {
  directory: string;
  cmd: string;
  args?: string[] | string;
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
  stringArrayEncoding?: string[];
  stringArrayCallsTransform?: boolean;
  deadCodeInjection?: boolean;
  numbersToExpressions?: boolean;
  target?: 'browser' | 'node';
  silent?: boolean;
  [key: string]: unknown;
}

export interface BytecodeOptions {
  filename?: string;
  output?: string;
  electron?: boolean;
  [key: string]: unknown;
}

export interface EncryptConfig {
  type: string;
  files?: string[];
  fileExt?: string[];
  specificFiles?: string[];
  cleanFiles?: string[];
  encryptDir?: string;
  confusionOptions?: ConfusionOptions;
  bytecodeOptions?: BytecodeOptions;
}

export interface MoveConfig {
  src?: string;
  dest?: string;
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
  [key: string]: ExecConfig | BundleConfig;
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