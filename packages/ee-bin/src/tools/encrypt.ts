/**
 * Code Encryption Module — bytecode compilation + JS obfuscation
 *
 * Supports three encryption modes:
 *   - confusion: Obfuscation only (javascript-obfuscator), works for both frontend and Electron
 *   - bytecode:  Bytecode only (bytenode), only for Electron (frontend renderer V8 version
 *                differs from compile-time V8, making bytecode incompatible)
 *   - strict:    Obfuscation + bytecode combined; obfuscate first, then compile to bytecode
 *                for the strongest protection
 *   - none:      No encryption (all processing skipped)
 *
 * Encryption flow:
 *   1. Load config, determine encryption type and target file list (via globby scan)
 *   2. Iterate target files; specificFiles entries are forced to use confusion
 *      (even when global config is bytecode)
 *   3. Call generateJSConfuseFile or generateBytecodeFile based on encryption type
 *
 * Bytecode compilation safety mechanism:
 *   - After compilation, verify the .jsc file exists before deleting the source .js file
 *   - If .jsc was not generated, throw an error and keep the source file to prevent
 *     code loss from failed compilation
 */

import path from 'path';
import fs from 'fs';
import { chalk } from '../lib/helpers.js';
import bytenode from 'bytenode';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { globbySync } from 'globby';
import { loadConfig, toArray } from '../lib/utils.js';
import type { EncryptConfig, ConfusionOptions, BytecodeOptions } from '../types/config.js';

/** Valid encryption type list (used for runtime includes validation) */
const EncryptTypes = ['bytecode', 'confusion', 'strict'] as const;
/** Encryption type union including 'none' (allowed in config but produces no output) */
type EncryptType = 'confusion' | 'bytecode' | 'strict' | 'none';

/** Encryption CLI options */
interface EncryptOptions {
  config?: string;
  out?: string;
  target?: string;
}

/**
 * Run a function while optionally suppressing javascript-obfuscator's "Pro" advertisement banner.
 *
 * javascript-obfuscator (v5.x) prints a promotional banner via console.log when stdout
 * is a TTY and not in CI. There is no official option to disable it, so when `silent` is
 * true we temporarily wrap console.log to drop only those advertisement lines, then restore
 * it. When `silent` is false the function runs untouched.
 */
function withSuppressedObfuscatorAd<T>(silent: boolean, fn: () => T): T {
  if (!silent) return fn();

  const original = console.log;
  console.log = (...args: unknown[]): void => {
    const first = args[0];
    if (
      typeof first === 'string' &&
      (first.includes('JavaScript Obfuscator Pro') || first.includes('obfuscator.io'))
    ) {
      return;
    }
    original.apply(console, args as []);
  };
  try {
    return fn();
  } finally {
    console.log = original;
  }
}

/** Default encryption config (type='none' means no encryption is performed) */
const DEFAULT_ENCRYPT_CONFIG: EncryptConfig = {  type: 'none',
  fileExt: ['.js'],
  cleanFiles: [],
  specificFiles: [],
  encryptDir: './',
};

class Encrypt {
  basePath: string;
  /** Encryption target: 'frontend' or 'electron' (different targets have different encryption strategies) */
  target: string;
  config: EncryptConfig;
  encryptDir: string;
  filesExt: string[];
  /** Encryption type (union type ensures only valid values can be assigned) */
  type: EncryptType;
  /** bytenode compilation options */
  bOpt: BytecodeOptions;
  /** javascript-obfuscator obfuscation options */
  cOpt: ConfusionOptions;
  /** Whether to suppress javascript-obfuscator's promotional "Pro" banner */
  silent: boolean;
  /** globby match patterns (from the "files" field in config) */
  patterns: string[] | null;
  /** Files that must be processed with confusion only (e.g. preload/bridge.js) */
  specFiles: string[];
  /** Entry files compiled to .jsc + replaced with a bytenode loader shell (e.g. main.js) */
  entryFiles: string[];
  /** Matched file path list (lazy init, computed on first call to _getCodeFiles()) */
  codefiles: string[] | undefined;

  constructor(options: EncryptOptions = {}) {
    const { config, out, target } = options;
    this.basePath = process.cwd();
    this.target = target || 'electron';

    // Load config: get the config for the corresponding target from the encrypt section,
    // fall back to default if not found
    const conf = loadConfig(config).encrypt;
    this.config = conf[this.target] || DEFAULT_ENCRYPT_CONFIG;
    const outputFolder = out || this.config.encryptDir || './';
    this.encryptDir = path.join(this.basePath, outputFolder);
    this.filesExt = this.config.fileExt || ['.js'];
    this.type = this.config.type || 'none';
    this.bOpt = this.config.bytecodeOptions || {};
    this.cOpt = this.config.confusionOptions || {};
    this.silent = this.config.silent ?? false;
    this.patterns = this.config.files || null;
    this.specFiles = this.config.specificFiles || [];
    this.entryFiles = this.config.entryFiles || [];
    // codefiles is not initialized in the constructor (deferred until encrypt() is called
    // to avoid wasting I/O when type='none')
  }

  /**
   * Lazily get the target file list
   *
   * On first call, uses globby to scan files matching the patterns.
   * Results are cached in this.codefiles; subsequent calls return the cache.
   * If patterns is null (no "files" field in config), returns undefined to indicate
   * encryption cannot proceed.
   */
  private _getCodeFiles(): string[] | undefined {
    if (this.codefiles !== undefined) return this.codefiles;
    if (!this.patterns) return undefined;
    this.codefiles = globbySync(this.patterns, { cwd: this.basePath });
    return this.codefiles;
  }

  /**
   * Execute encryption — iterate target files and encrypt each one
   *
   * Frontend bytecode is skipped: the browser renderer process V8 version differs
   * from the compile-time V8, so compiled bytecode cannot execute in the renderer.
   */
  async encrypt(): Promise<void> {
    // Skip if type is 'none' or not in the valid EncryptTypes list
    if (!(EncryptTypes as readonly string[]).includes(this.type)) return;
    // Frontend does not support bytecode (renderer V8 version incompatibility)
    if (this.target === 'frontend' && (this.type === 'bytecode' || this.type === 'strict')) {
      console.log(chalk.blue('[ee-bin] [encrypt] ') + `Skipping frontend ${this.type} (bytecode not supported in renderer)`);
      return;
    }

    console.log(chalk.blue('[ee-bin] [encrypt] ') + `start encrypting ${this.target}`);
    const files = this._getCodeFiles();
    if (!files) return;

    for (const file of files) {
      const fullpath = path.join(this.encryptDir, file);
      if (!fs.statSync(fullpath).isFile()) continue;

      // Filter by file extension (fileExt config option)
      const ext = path.extname(file);
      if (!this.filesExt.includes(ext)) continue;

      // Entry files (e.g. main.js) cannot be renamed to .jsc — the Electron/Node runtime
      // requires a literal .js entry. In bytecode/strict mode, compile to .jsc and replace
      // the source with a tiny bytenode loader shell. In confusion mode they behave normally.
      if (this.entryFiles.includes(file)) {
        await this.generateEntryLoader(fullpath);
        continue;
      }

      // Files in specificFiles are forced to use confusion (e.g. preload/bridge.js
      // must remain in a readable format for BrowserWindow to load; bytecode won't work)
      if (this.specFiles.includes(file)) {
        await this.generate(fullpath, 'confusion');
        continue;
      }

      await this.generate(fullpath);
    }
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end encrypting');
  }

  /**
   * Encrypt a single file
   *
   * @param curPath - Absolute path to the file
   * @param type - Encryption type override (used by specificFiles to force a specific type)
   *
   * strict mode = confusion + bytecode combined: obfuscate first, then compile to bytecode.
   * The obfuscated code is compiled into bytecode for double protection.
   */
  async generate(curPath: string, type?: string): Promise<void> {
    const encryptType = type || this.type;

    const tips =
      chalk.blue('[ee-bin] [encrypt] ') +
      'file: ' +
      chalk.green(`${curPath}`) +
      ' ' +
      chalk.cyan(`(${encryptType})`);
    console.log(tips);
    if (encryptType === 'strict') {
      this.generateJSConfuseFile(curPath);
      await this.generateBytecodeFile(curPath);
    } else if (encryptType === 'bytecode') {
      await this.generateBytecodeFile(curPath);
    } else if (encryptType === 'confusion') {
      this.generateJSConfuseFile(curPath);
    }
  }

  async generateEntryLoader(curPath: string): Promise<void> {
    const encryptType = this.type;
    if (encryptType === 'strict') {
      this.generateJSConfuseFile(curPath);
      await this.generateBytecodeFile(curPath, false);
    } else if (encryptType === 'bytecode') {
      await this.generateBytecodeFile(curPath, false);
    } else {
      await this.generate(curPath);
      return;
    }

    const jscName = path.basename(curPath, path.extname(curPath)) + '.jsc';
    const loaderCode = [
      "require('bytenode');",
      `require('./${jscName}');`,
      '',
    ].join('\n');
    fs.writeFileSync(curPath, loaderCode, 'utf8');
  }

  /**
   * Obfuscate a single JS file (in-place write-back)
   *
   * Default options are merged with user config via Object.assign:
   *   User config overrides defaults; unset fields use defaults (compact=true, stringArray=true, etc.)
   */
  generateJSConfuseFile(file: string): void {
    const opt = Object.assign(
      {
        compact: true,
        stringArray: true,
        stringArrayThreshold: 1,
      },
      this.cOpt
    );

    const code = fs.readFileSync(file, 'utf8');
    const result = withSuppressedObfuscatorAd(this.silent, () =>
      JavaScriptObfuscator.obfuscate(code, opt)
    );
    // Write obfuscated result back to the original file (in-place replacement)
    fs.writeFileSync(file, result.getObfuscatedCode(), 'utf8');
  }

  /**
   * Compile a single JS file to V8 bytecode (.jsc)
   *
   * Safety mechanism:
   *   1. Only process .js files (skip .json and other extensions)
   *   2. After compilation, verify the .jsc file exists before deleting the source .js file
   *   3. If .jsc was not generated, throw an error and keep the source file (prevents code loss from failed compilation)
   *   4. Use fs.unlinkSync to delete a single file instead of fs.rmSync (avoids recursive delete risk)
   */
  async generateBytecodeFile(curPath: string, deleteSource = true): Promise<void> {
    if (path.extname(curPath) !== '.js') {
      return;
    }
    const jscFile = curPath + 'c';
    const opt = Object.assign(
      {
        filename: curPath,
        output: jscFile,
        electron: true,
      },
      this.bOpt
    );

    await bytenode.compileFile(opt);
    // Verify .jsc output exists before deleting source file
    if (fs.existsSync(jscFile)) {
      if (deleteSource) fs.unlinkSync(curPath);
    } else {
      throw new Error(`[ee-bin] [encrypt] Bytecode compilation failed: ${jscFile} was not created, keeping source ${curPath}`);
    }
  }
}

/**
 * Encryption entry function — processes both electron and frontend targets
 *
 * Creates separate Encrypt instances for electron and frontend.
 * Each instance independently determines whether to encrypt and which method to use,
 * based on its own configuration.
 */
export async function encrypt(options: EncryptOptions = {}): Promise<void> {
  const electronOpt: EncryptOptions = { ...options, target: 'electron' };
  const electronEpt = new Encrypt(electronOpt);
  await electronEpt.encrypt();

  const frontendOpt: EncryptOptions = { ...options, target: 'frontend' };
  const frontendEpt = new Encrypt(frontendOpt);
  await frontendEpt.encrypt();
}

/**
 * Clean encrypted output — delete encryption artifacts from specified directories
 *
 * @param options.dir - Directory path(s) to clean (defaults to './public/electron').
 *                      Accepts a string or string array for multiple directories.
 */
export function cleanEncrypt(options: { dir?: string | string[] } = {}): void {
  const dirs = options.dir !== undefined ? toArray(options.dir) : ['./public/electron'];

  for (const dir of dirs) {
    const tmpFile = path.join(process.cwd(), dir);
    if (fs.existsSync(tmpFile)) {
      fs.rmSync(tmpFile, { recursive: true, force: true });
      console.log(
        chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk.magenta(`${tmpFile}`)
      );
    }
  }
}
