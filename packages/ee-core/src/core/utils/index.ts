/**
 * @module core/utils
 * @description 核心工具函数集。提供文件加载、函数调用、字节码类检测等基础能力，
 * 是 FileLoader 和其他模块的底层依赖。
 */
import 'bytenode';
import { isFunction as isFunctionCheck } from '../../utils/type_check.js';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';

// CJS 环境下 __filename 可用；纯 ESM 无打包器时，使用 cwd 作为 createRequire 的基路径
const requireMod = createRequire(
  typeof __filename !== 'undefined'
    ? __filename
    : path.join(process.cwd(), '__virtual__.js')
);
const Module = requireMod('module');

// Node.js 原生支持的文件扩展名（含 bytenode 注册的 .jsc）
const extensions: NodeJS.RequireExtensions = Module._extensions;

/**
 * 同步加载文件
 *
 * 执行流程：
 * 1. 非 JS 文件（不在 Module._extensions 中的扩展名）→ 返回文件内容 Buffer
 * 2. JS/CJS/JSC 文件 → 使用 require() 加载模块
 * 3. ESM 模块（带 __esModule 标记）→ 提取 default 导出
 *
 * @param filepath - 文件绝对路径
 * @returns 文件内容（Buffer）或模块导出值
 * @throws 文件加载失败时抛出包含文件路径的错误
 */
export function loadFile(filepath: string): unknown {
  try {
    // 非 JS 模块，直接返回文件内容
    const extname = path.extname(filepath);
    if (extname && !extensions[extname]) {
      return fs.readFileSync(filepath);
    }

    // 加载 JS 模块
    const obj = requireMod(filepath);
    if (!obj) return obj;
    // ESM 互操作：提取 default 导出
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file: ${filepath}, error: ${error.message}`;
    throw error;
  }
}

/**
 * 调用函数并绑定上下文
 *
 * @param fn - 待调用的函数
 * @param args - 函数参数列表
 * @param ctx - 函数执行上下文（this 指向），不传则直接调用
 * @returns 函数返回值；fn 不是函数时返回 undefined
 */
export async function callFn(fn: (...args: unknown[]) => unknown, args?: unknown[], ctx?: unknown): Promise<unknown> {
  args = args || [];
  if (!isFunctionCheck(fn)) return undefined;
  return ctx ? fn.call(ctx, ...args) : fn(...args);
}

/**
 * 获取文件的相对路径名
 *
 * 将绝对路径转为基于 baseDir 的相对路径，统一使用正斜杠分隔。
 *
 * @param filepath - 文件绝对路径
 * @param baseDir - 基准目录
 * @returns 相对路径（正斜杠分隔）
 */
export function getResolvedFilename(filepath: string, baseDir: string): string {
  const reg = /[/\\]/g;
  return filepath.replace(baseDir + path.sep, '').replace(reg, '/');
}

/**
 * 判断导出是否为字节码类
 *
 * 通过 toString() 结果中是否包含 '[class' 来判断。
 * bytenode 编译的 .jsc 文件的类在 Node.js 中会显示为 '[class XXX]'。
 *
 * @param exports - 待检测的导出值
 * @returns 是否为字节码类
 */
export function isBytecodeClass(exports: unknown): boolean {
  if (!exports) return false;
  return String(exports).indexOf('[class') !== -1;
}

/**
 * 获取支持的文件匹配模式
 *
 * 用于 globby 扫描目录时过滤文件类型。
 *
 * @returns 文件模式列表（.js 和 .jsc）
 */
export function filePatterns(): string[] {
  return ['**/*.js', '**/*.jsc'];
}

export { extensions };

/**
 * 异步加载文件（ESM 支持）
 *
 * 与 loadFile 功能相同，但使用动态 import() 加载模块，
 * 支持 ESM 格式的文件。非 JS 文件使用 fs.promises.readFile 读取。
 *
 * @param filepath - 文件绝对路径
 * @returns 文件内容（Buffer）或模块导出值
 * @throws 文件加载失败时抛出包含文件路径的错误
 */
export async function loadFileAsync(filepath: string): Promise<unknown> {
  try {
    const extname = path.extname(filepath);
    // 非 JS/ESM 文件：返回内容 Buffer
    if (extname && !extensions[extname] && extname !== '.mjs') {
      return fs.promises.readFile(filepath);
    }

    // 动态 import，同时支持 ESM 和 CJS
    const obj = await import(filepath);
    if (!obj) return obj;
    // ESM 互操作：提取 default 导出
    if (obj.__esModule) return 'default' in obj ? obj.default : obj;
    return obj;
  } catch (err) {
    const error = err as Error;
    error.message = `[ee-core] load file async: ${filepath}, error: ${error.message}`;
    throw error;
  }
}
