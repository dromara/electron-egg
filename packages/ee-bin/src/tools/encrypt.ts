/**
 * 代码加密模块 — bytecode 编译 + JS 混淆
 *
 * 支持三种加密模式：
 *   - confusion: 仅混淆（javascript-obfuscator），适用于前端和 Electron
 *   - bytecode:  仅字节码（bytenode），仅适用于 Electron（前端渲染进程 V8 版本不同，bytecode 不兼容）
 *   - strict:    混淆 + 字节码组合，先混淆再编译字节码，提供最强保护
 *   - none:      不加密（跳过所有处理）
 *
 * 加密流程：
 *   1. 加载配置，确定加密类型和目标文件列表（globby 扫描）
 *   2. 遍历目标文件，specificFiles 项强制使用 confusion（即使全局是 bytecode）
 *   3. 根据加密类型调用 generateJSConfuseFile 或 generateBytecodeFile
 *
 * 字节码编译安全机制：
 *   - 编译后验证 .jsc 文件存在再删除源 .js 文件
 *   - 若 .jsc 未生成则抛错保留源文件，避免编译失败导致代码丢失
 */

import path from 'path';
import fs from 'fs';
import { chalk } from '../lib/helpers.js';
import bytenode from 'bytenode';
import JavaScriptObfuscator from 'javascript-obfuscator';
import globby from 'globby';
import { loadConfig, toArray } from '../lib/utils.js';
import type { EncryptConfig, ConfusionOptions, BytecodeOptions } from '../types/config.js';

/** 有效加密类型列表（用于运行时 includes 校验） */
const EncryptTypes = ['bytecode', 'confusion', 'strict'] as const;
/** 加密类型联合，含 'none'（配置中允许但实际不处理） */
type EncryptType = 'confusion' | 'bytecode' | 'strict' | 'none';

/** 加密 CLI 选项 */
interface EncryptOptions {
  config?: string;
  out?: string;
  target?: string;
}

/** 默认加密配置（type='none' 时不执行加密） */
const DEFAULT_ENCRYPT_CONFIG: EncryptConfig = {
  type: 'none',
  fileExt: ['.js'],
  cleanFiles: [],
  specificFiles: [],
  encryptDir: './',
};

class Encrypt {
  basePath: string;
  /** 加密目标：'frontend' 或 'electron'（不同目标有不同加密策略） */
  target: string;
  config: EncryptConfig;
  encryptDir: string;
  filesExt: string[];
  /** 加密类型（联合类型确保只有有效值可赋值） */
  type: EncryptType;
  /** bytenode 编译选项 */
  bOpt: BytecodeOptions;
  /** javascript-obfuscator 混淆选项 */
  cOpt: ConfusionOptions;
  /** globby 匹配模式（来自配置的 files 字段） */
  patterns: string[] | null;
  /** 需要单独用 confusion 处理的文件列表（如 preload/bridge.js） */
  specFiles: string[];
  /** 匹配到的文件路径列表（lazy init，首次调用 _getCodeFiles() 时计算） */
  codefiles: string[] | undefined;

  constructor(options: EncryptOptions = {}) {
    const { config, out, target } = options;
    this.basePath = process.cwd();
    this.target = target || 'electron';

    // 加载配置：从 encrypt 段取对应目标的配置，无则用默认
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
    // codefiles 不在构造器中初始化（延迟到 encrypt() 调用时再扫描文件系统，
    // 避免 type='none' 时白费 I/O）
  }

  /**
   * 懒加载获取目标文件列表
   *
   * 首次调用时用 globby 扫描 patterns 模式匹配的文件，
   * 结果缓存到 this.codefiles，后续调用直接返回缓存。
   * 若 patterns 为 null（配置中未指定 files），返回 undefined 表示无法加密。
   */
  private _getCodeFiles(): string[] | undefined {
    if (this.codefiles !== undefined) return this.codefiles;
    if (!this.patterns) return undefined;
    this.codefiles = globby.sync(this.patterns, { cwd: this.basePath });
    return this.codefiles;
  }

  /**
   * 执行加密 — 遍历目标文件并逐个加密
   *
   * 前端 bytecode 跳过：浏览器渲染进程的 V8 版本与编译时不同，
   * 编译出的字节码在不同 V8 版本下无法执行
   */
  encrypt(): void {
    // type 为 'none' 或不在 EncryptTypes 中时跳过
    if (!(EncryptTypes as readonly string[]).includes(this.type)) return;
    // 前端不支持 bytecode（渲染进程 V8 版本不兼容）
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

      // specificFiles 中的文件强制使用 confusion（如 preload/bridge.js
      // 必须保持可读格式供 BrowserWindow 加载，不能用 bytecode）
      if (this.specFiles.includes(file)) {
        this.generate(fullpath, 'confusion');
        continue;
      }

      this.generate(fullpath);
    }
    console.log(chalk.blue('[ee-bin] [encrypt] ') + 'end encrypting');
  }

  /**
   * 对单个文件执行加密
   *
   * @param curPath - 文件绝对路径
   * @param type - 加密类型覆盖（用于 specificFiles 强制指定类型）
   *
   * strict 模式 = confusion + bytecode 组合：先混淆再编译字节码，
   * 混淆后的代码被编译成字节码，双重保护
   */
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

  /**
   * 混淆单个 JS 文件（in-place 写回）
   *
   * 默认选项与用户配置合并策略（Object.assign）：
   *   用户配置覆盖默认值，未设置的字段使用默认（compact=true, stringArray=true 等）
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
    const result = JavaScriptObfuscator.obfuscate(code, opt);
    // 混淆结果直接写回原文件（in-place 替换）
    fs.writeFileSync(file, result.getObfuscatedCode(), 'utf8');
  }

  /**
   * 将单个 JS 文件编译为 V8 字节码 (.jsc)
   *
   * 安全机制：
   *   1. 仅处理 .js 文件（.json 等其他扩展名跳过）
   *   2. 编译后验证 .jsc 文件存在再删除源 .js 文件
   *   3. 若 .jsc 未生成则抛错保留源文件（防止编译失败导致代码丢失）
   *   4. 使用 fs.unlinkSync 删除单个文件而非 fs.rmSync（避免递归删除风险）
   */
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
    // 验证 .jsc 产出存在后再删除源文件
    if (fs.existsSync(jscFile)) {
      fs.unlinkSync(curPath);
    } else {
      throw new Error(`[ee-bin] [encrypt] Bytecode compilation failed: ${jscFile} was not created, keeping source ${curPath}`);
    }
  }
}

/**
 * 加密入口函数 — 同时处理 electron 和 frontend 两个目标
 *
 * 分别创建 Encrypt 实例处理 electron 和 frontend，
 * 各实例根据配置独立决定是否加密和加密方式
 */
export function encrypt(options: EncryptOptions = {}): void {
  const electronOpt: EncryptOptions = { ...options, target: 'electron' };
  const electronEpt = new Encrypt(electronOpt);
  electronEpt.encrypt();

  const frontendOpt: EncryptOptions = { ...options, target: 'frontend' };
  const frontendEpt = new Encrypt(frontendOpt);
  frontendEpt.encrypt();
}

/**
 * 清理加密产物 — 删除指定目录下的加密输出
 *
 * @param options.dir - 要清理的目录路径（默认 './public/electron'）
 *                      支持字符串或字符串数组指定多个目录
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