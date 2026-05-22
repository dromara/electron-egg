import path from 'path';
import fs from 'fs';
import fsPro from 'fs-extra';
import is from 'is-type-of';
import bytenode from 'bytenode';
import JavaScriptObfuscator from 'javascript-obfuscator';
import globby from 'globby';
import chalk from 'chalk/index.js';
import { loadConfig } from '../lib/utils.js';
import { extend } from '../lib/extend.js';

const EncryptTypes = ['bytecode', 'confusion', 'strict'];

interface EncryptConfig {
  type: string;
  files?: string[];
  fileExt?: string[];
  cleanFiles?: string[];
  specificFiles?: string[];
  encryptDir?: string;
  confusionOptions?: Record<string, unknown>;
  bytecodeOptions?: Record<string, unknown>;
}

interface EncryptOptions {
  config?: string;
  out?: string;
  target?: string;
}

class Encrypt {
  basePath: string;
  target: string;
  config: EncryptConfig;
  encryptDir: string;
  filesExt: string[];
  type: string;
  bOpt: Record<string, unknown>;
  cOpt: Record<string, unknown>;
  cleanFiles: string[];
  patterns: string[] | null;
  specFiles: string[];
  codefiles: string[] | undefined;

  constructor(options: EncryptOptions = {}) {
    const { config, out, target } = options;
    this.basePath = process.cwd();
    this.target = target || 'electron';

    const conf = (loadConfig(config).encrypt || {}) as Record<string, EncryptConfig>;
    this.config = conf[this.target] || ({} as EncryptConfig);
    const outputFolder = out || this.config.encryptDir || './';
    this.encryptDir = path.join(this.basePath, outputFolder);
    this.filesExt = this.config.fileExt || ['.js'];
    this.type = this.config.type || 'none';
    this.bOpt = this.config.bytecodeOptions || {};
    this.cOpt = this.config.confusionOptions || {};
    this.cleanFiles = this.config.cleanFiles || [];
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
    if (EncryptTypes.indexOf(this.type) === -1) return;
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

  loop(dirPath: string): void {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const curPath = dirPath + '/' + file;
      if (fs.statSync(curPath).isDirectory()) {
        this.loop(curPath);
      } else {
        const extname = path.extname(curPath);
        if (this.filesExt.indexOf(extname) !== -1) {
          this.generate(curPath);
        }
      }
    }
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
    fsPro.removeSync(curPath);
  }
}

export function encrypt(options: EncryptOptions = {}): void {
  const electronOpt = extend(
    true,
    { target: 'electron' },
    options as Record<string, unknown>
  ) as Record<string, unknown>;
  const electronEpt = new Encrypt(electronOpt as EncryptOptions);
  electronEpt.encrypt();

  const frontendOpt = extend(
    true,
    { target: 'frontend' },
    options as Record<string, unknown>
  ) as Record<string, unknown>;
  const frontendEpt = new Encrypt(frontendOpt as EncryptOptions);
  frontendEpt.encrypt();
}

export function cleanEncrypt(options: { dir?: string | string[] } = {}): void {
  // [todo] 删除前端和主进程代码
  return;
  let files: string[] = options.dir !== undefined ? (is.array(options.dir) ? (options.dir as string[]) : [options.dir as string]) : ['./public/electron'];

  for (const file of files) {
    const tmpFile = path.join(process.cwd(), file);
    if (fs.existsSync(tmpFile)) {
      fsPro.removeSync(tmpFile);
      console.log(
        chalk.blue('[ee-bin] [encrypt] ') + 'clean up tmp files: ' + chalk.magenta(`${tmpFile}`)
      );
    }
  }
}
