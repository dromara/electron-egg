import path from 'path';
import fs from 'fs';
import { chalk } from '../lib/helpers.js';
import bytenode from 'bytenode';
import JavaScriptObfuscator from 'javascript-obfuscator';
import globby from 'globby';
import { loadConfig, toArray } from '../lib/utils.js';
import type { EncryptConfig } from '../types/config.js';

const EncryptTypes = ['bytecode', 'confusion', 'strict'];

interface EncryptOptions {
  config?: string;
  out?: string;
  target?: string;
}

const DEFAULT_ENCRYPT_CONFIG: EncryptConfig = {
  type: 'none',
  fileExt: ['.js'],
  cleanFiles: [],
  specificFiles: [],
  encryptDir: './',
};

class Encrypt {
  basePath: string;
  target: string;
  config: EncryptConfig;
  encryptDir: string;
  filesExt: string[];
  type: string;
  bOpt: Record<string, unknown>;
  cOpt: Record<string, unknown>;
  patterns: string[] | null;
  specFiles: string[];
  codefiles: string[] | undefined;

  constructor(options: EncryptOptions = {}) {
    const { config, out, target } = options;
    this.basePath = process.cwd();
    this.target = target || 'electron';

    const conf = loadConfig(config).encrypt;
    this.config = conf[this.target] || DEFAULT_ENCRYPT_CONFIG;
    const outputFolder = out || this.config.encryptDir || './';
    this.encryptDir = path.join(this.basePath, outputFolder);
    this.filesExt = this.config.fileExt || ['.js'];
    this.type = this.config.type || 'none';
    this.bOpt = this.config.bytecodeOptions || {};
    this.cOpt = this.config.confusionOptions || {};
    this.patterns = this.config.files || null;
    this.specFiles = this.config.specificFiles || [];

    this.codefiles = this._initCodeFiles();
  }

  _initCodeFiles(): string[] | undefined {
    if (!this.patterns) return undefined;

    const files = globby.sync(this.patterns, { cwd: this.basePath });
    return files;
  }

  encrypt(): void {
    if (!EncryptTypes.includes(this.type)) return;
    if (this.target === 'frontend' && (this.type === 'bytecode' || this.type === 'strict')) return;

    console.log(chalk.blue('[ee-bin] [encrypt] ') + `start ciphering ${this.target}`);
    if (!this.codefiles) return;

    for (const file of this.codefiles) {
      const fullpath = path.join(this.encryptDir, file);
      if (!fs.statSync(fullpath).isFile()) continue;

      if (this.specFiles.includes(file)) {
        this.generate(fullpath, 'confusion');
        continue;
      }

      this.generate(fullpath);
    }
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end ciphering');
  }

  generate(curPath: string, type?: string): void {
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
      this.generateBytecodeFile(curPath);
    } else if (encryptType === 'bytecode') {
      this.generateBytecodeFile(curPath);
    } else if (encryptType === 'confusion') {
      this.generateJSConfuseFile(curPath);
    }
  }

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
    const result = JavaScriptObfuscator.obfuscate(code, opt);
    fs.writeFileSync(file, result.getObfuscatedCode(), 'utf8');
  }

  generateBytecodeFile(curPath: string): void {
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

    bytenode.compileFile(opt);
    fs.rmSync(curPath, { recursive: true, force: true });
  }
}

export function encrypt(options: EncryptOptions = {}): void {
  const electronOpt: EncryptOptions = { ...options, target: 'electron' };
  const electronEpt = new Encrypt(electronOpt);
  electronEpt.encrypt();

  const frontendOpt: EncryptOptions = { ...options, target: 'frontend' };
  const frontendEpt = new Encrypt(frontendOpt);
  frontendEpt.encrypt();
}

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