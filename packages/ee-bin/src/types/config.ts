/**
 * ee-bin Configuration Type Definitions
 *
 * Defines the complete type system for the ee-bin CLI tool's configuration.
 * Configuration hierarchy:
 *   BinConfig (top-level) → ExecConfig / BuildConfig / MoveConfig / EncryptConfig / UpdaterConfig (sub-configs)
 *
 * Users provide custom config via `./cmd/bin.js`, which ee-bin deep-merges with
 * the defaults in bin_default.ts via extend() to produce the final BinConfig instance.
 */

/** Command execution config — defines parameters for launching a single subprocess */
export interface ExecConfig {
  /** Process working directory (relative to project root) */
  directory: string;
  /** Command to execute, e.g. 'npm', 'electron', 'electron-builder' */
  cmd: string;
  /** Command argument array */
  args?: string[];
  /** Child process stdio mode, default 'inherit' (output goes directly to terminal) */
  stdio?: 'inherit' | 'pipe' | 'ignore';
  /** Whether to execute synchronously. Sync mode blocks until command completes; result is not stored in execProcess */
  sync?: boolean;
  /** Frontend service protocol, used in dev mode to decide whether to skip startup ('file://' means skip frontend launch) */
  protocol?: string;
  /** Whether to watch for file changes and auto-restart (only supported for electron in dev mode) */
  watch?: boolean;
  /** Debounce delay in watch mode (milliseconds), prevents rapid successive rebuilds from file changes */
  delay?: number;
  /** Frontend dev server hostname */
  hostname?: string;
  /** Frontend dev server port */
  port?: number;
  /** Frontend index page filename */
  indexPath?: string;
  /** Whether to force-refresh the page */
  force?: boolean;
  /** Electron loading page path (shows a loading page first, then redirects to the main page) */
  loadingPage?: string;
}

/** esbuild bundle config — controls Electron main process code bundling behavior */
export interface BundleConfig {
  /** Bundle mode: 'bundle' uses esbuild to bundle into a single file, 'copy' copies the directory as-is */
  bundleType?: 'bundle' | 'copy';
  /** User-defined esbuild external package names (framework externals are added automatically by _bundleWithRegistry) */
  external?: string[];
  /** Sourcemap configuration:
   *  - false/undefined: Auto mode (dev→inline, prod→off)
   *  - 'inline': Force inline sourcemap
   *  - 'external': Generate separate .map file
   *  - true: Equivalent to 'inline'
   */
  sourcemap?: boolean | 'inline' | 'external';
  /** Whether to minify code (recommended for production) */
  minify?: boolean;
  /** Statement types to remove: 'console' deletes console.*, 'debugger' deletes debugger statements */
  drop?: ('console' | 'debugger')[];
  /** Whether to preserve function/class names when minifying (helpful for debugging) */
  keepNames?: boolean;
  /** License comment handling: 'inline' keeps in code, 'eof' moves to end of file, 'none' removes */
  legalComments?: 'inline' | 'eof' | 'none';
  /** Compile-time constant definitions, e.g. { 'process.env.CUSTOM': '"value"' } */
  define?: Record<string, string>;
  /** Extra files/directories from electron/ to copy to the bundle output, with smart per-file handling:
   *  - script files (.ts/.js/.mts/.cts/.tsx/.jsx) are transpiled to Node-loadable CJS .js
   *    (bundle:false, so relative imports and ee-core/* stay as runtime require() calls)
   *  - all other files (e.g. .json, images) are copied verbatim
   *  Directory structure is preserved. Use this for resources kept out of main.js — static assets,
   *  or source loaded via require()/child_process.fork() at runtime. (e.g. 'assets', 'workers', 'data/db.json') */
  copy?: string[];
  /** Output format: 'cjs' recommended for Electron main process, 'esm' requires all business code to be ESM-compatible */
  format?: 'cjs' | 'esm';
}

/** javascript-obfuscator obfuscation options — corresponds to the javascript-obfuscator library config parameters */
export interface ConfusionOptions {
  compact?: boolean;
  stringArray?: boolean;
  /** String array encoding threshold (0~1, 1 means all strings go into the array) */
  stringArrayThreshold?: number;
  /** String array encoding method: 'none' no encoding, 'base64' Base64 encoding, 'rc4' RC4 encryption */
  stringArrayEncoding?: Array<'none' | 'base64' | 'rc4'>;
  stringArrayCallsTransform?: boolean;
  deadCodeInjection?: boolean;
  numbersToExpressions?: boolean;
  /** Obfuscation target runtime: 'browser' for frontend code, 'node' for Node.js/Electron code */
  target?: 'browser' | 'node';
}

/** bytenode bytecode compilation options — corresponds to bytenode.compileFile() parameters */
export interface BytecodeOptions {
  /** Input source file path (automatically set by encrypt module) */
  filename?: string;
  /** Output .jsc file path (defaults to filename + 'c') */
  output?: string;
  /** Whether to compile for Electron environment (enables V8 bytecode compatibility) */
  electron?: boolean;
}

/** Encryption config — defines the encryption strategy for a target (frontend or electron) */
export interface EncryptConfig {
  /** Encryption type:
   *  - 'confusion': Obfuscation only (javascript-obfuscator)
   *  - 'bytecode': Bytecode only (bytenode, electron only)
   *  - 'strict': Obfuscation + bytecode combined
   *  - 'none': No encryption (skip processing)
   */
  type: 'confusion' | 'bytecode' | 'strict' | 'none';
  /** globby match patterns specifying files to encrypt (e.g. ['./public/electron/**\/*.js']) */
  files?: string[];
  /** Only process files with these extensions (default ['.js']) */
  fileExt?: string[];
  /** Files that must use confusion mode even when global config is bytecode (e.g. preload/bridge.js) */
  specificFiles?: string[];
  /** Entry files (e.g. Electron's main.js) that cannot be renamed to .jsc because the
   *  runtime requires a literal .js entry. For these, the source is compiled to <name>.jsc
   *  and the original <name>.js is overwritten with a tiny bytenode loader shell that
   *  requires the .jsc. Only applies in 'bytecode'/'strict' modes. */
  entryFiles?: string[];
  /** Directory paths to clean after encryption completes */
  cleanFiles?: string[];
  /** Base directory for encryption operations (default './', i.e. project root) */
  encryptDir?: string;
  /** Suppress javascript-obfuscator's promotional "Pro" banner during confusion (default false) */
  silent?: boolean;
  confusionOptions?: ConfusionOptions;
  bytecodeOptions?: BytecodeOptions;
}

/** Resource move config — defines source and destination paths for file/directory copying.
 *  src and dest are required since the move direction must be explicit.
 */
export interface MoveConfig {
  /** Source path (relative to project root) */
  src: string;
  /** Destination path (relative to project root) */
  dest: string;
  /** Override for src (if set, takes priority over src) */
  dist?: string;
  /** Override for dest (if set, takes priority over dest) */
  target?: string;
}

/** Incremental update config — defines parameters for generating incremental update packages */
export interface UpdaterConfig {
  /** Path to the metadata YAML file (contains version, releaseDate, files, SHA512 hashes) */
  metadata: string;
  /** Path to the asar package file (can be overridden by CLI --asar-file argument) */
  asarFile?: string;
  /** Output configuration */
  output: {
    /** Output directory */
    directory: string;
    /** Zip filename template (platform and version suffixes are auto-appended) */
    zip: string;
    /** JSON metadata filename template (platform suffix is auto-appended) */
    file: string;
  };
  /** Glob patterns for extra resource files to include in the zip */
  extraResources?: string[];
  /** Native module list from asarUnpacked to include in the zip */
  asarUnpacked?: string[];
  /** Whether to clean per-platform temporary extraction directories after generation */
  cleanCache?: boolean;
}

/** Build config — top-level structure for the "build" section.
 *  The "electron" key is always BundleConfig (bundling config),
 *  all other keys (frontend, win32, win64, etc.) are ExecConfig (command execution config).
 *  Index signature includes undefined to allow undefined keys.
 */
export interface BuildConfig {
  /** Electron main process bundle config (the only key that must be BundleConfig) */
  electron: BundleConfig;
  [key: string]: ExecConfig | BundleConfig | undefined;
}

/** ee-bin top-level config — corresponds to the full structure of ./cmd/bin.js */
export interface BinConfig {
  /** Dev mode configuration (sub-commands like frontend, electron) */
  dev: Record<string, ExecConfig>;
  /** Build configuration (electron is BundleConfig, others are ExecConfig) */
  build: BuildConfig;
  /** Resource move configuration (e.g. frontend dist → public/dist) */
  move: Record<string, MoveConfig>;
  /** Production start configuration */
  start: ExecConfig;
  /** Encryption configuration (frontend and electron each have independent strategies) */
  encrypt: Record<string, EncryptConfig>;
  /** Custom command configuration */
  exec: Record<string, ExecConfig>;
  /** Incremental update configuration (optional, per-platform) */
  updater?: Record<string, UpdaterConfig>;
}
