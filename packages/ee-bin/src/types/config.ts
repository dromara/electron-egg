export interface ExecConfig {
  directory: string;
  cmd: string;
  args?: string[] | string;
  stdio?: 'inherit' | 'pipe' | 'ignore';
  sync?: boolean;
  protocol?: string;
  watch?: boolean;
  delay?: number;
  [key: string]: unknown;
}

export interface BundleConfig {
  type?: string;
  bundleType?: string;
  [key: string]: unknown;
}

export interface EncryptConfig {
  type: string;
  files?: string[];
  fileExt?: string[];
  specificFiles?: string[];
  cleanFiles?: string[];
  encryptDir?: string;
  confusionOptions?: Record<string, unknown>;
  bytecodeOptions?: Record<string, unknown>;
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
  [key: string]: unknown;
}