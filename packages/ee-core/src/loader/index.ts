/**
 * @module loader
 * @description 文件加载模块。提供多种文件加载和执行方式，
 * 是控制器加载、配置加载、任务执行的基础依赖。
 *
 * 核心函数：
 * - loadFile：加载文件，若导出为函数则自动执行
 * - requireFile：加载文件，不自动执行
 * - execFile：加载文件，类则实例化，函数则执行
 * - resolveModule：解析模块绝对路径
 * - getFullpath：获取 electron 目录下文件的绝对路径
 */
import { isFunction, isClass } from '../utils/type_check.js';
import fs from 'fs';
import path from 'path';
import { loadFile as coreLoadFile, isBytecodeClass } from '../core/utils/index.js';
import { getElectronDir } from '../ps/index.js';

/**
 * 加载文件并自动执行函数导出
 *
 * 若文件导出为普通函数（非类、非字节码类），自动调用该函数并返回执行结果。
 * 适用于配置文件等需要根据 appInfo 动态返回内容的场景。
 *
 * @param filepath - 文件路径（相对路径基于 electronDir）
 * @param inject - 传递给函数导出的参数（展开传入）
 * @returns 文件导出内容或函数执行结果
 * @throws 文件不存在时抛出错误
 */
export function loadFile(filepath: string, ...inject: unknown[]): unknown {
  let fullpath = filepath;
  const isAbsolute = path.isAbsolute(fullpath);
  if (!isAbsolute) {
    fullpath = path.join(getElectronDir(), fullpath);
  }

  fullpath = resolveModule(fullpath) || fullpath;
  if (!fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader/index] loadFile ${filepath} does not exist`);
  }

  let ret = coreLoadFile(fullpath);
  // 普通函数导出：自动执行，注入参数（如 appInfo）
  if (isFunction(ret) && !isClass(ret) && !isBytecodeClass(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(...inject);
  }
  return ret;
}

/**
 * 加载文件（不自动执行）
 *
 * 直接返回模块导出内容，不做任何处理。
 * 适用于需要获取原始模块引用的场景（如子进程任务加载）。
 *
 * @param filepath - 文件绝对路径
 * @returns 模块导出内容
 */
export function requireFile(filepath: string): unknown {
  return coreLoadFile(filepath);
}

/**
 * 加载并运行文件
 *
 * 根据导出类型决定执行方式：
 * - 类/字节码类 → 使用 new 实例化，inject 作为构造函数参数
 * - 普通函数 → 直接调用，inject 作为函数参数
 * - 其他 → 直接返回
 *
 * @param filepath - 文件绝对路径
 * @param inject - 传递给构造函数或函数的参数（展开传入）
 * @returns 实例化的类对象或函数执行结果
 */
export function execFile(filepath: string, ...inject: unknown[]): unknown {
  let ret = coreLoadFile(filepath);
  if (isClass(ret) || isBytecodeClass(ret)) {
    ret = new (ret as new (...args: unknown[]) => unknown)(...inject);
  } else if (isFunction(ret)) {
    ret = (ret as (...args: unknown[]) => unknown)(...inject);
  }
  return ret;
}

/**
 * 解析模块的绝对路径
 *
 * 先尝试 require.resolve()，失败后按后缀规则尝试：
 * - .default / .prod → 尝试 .jsc（字节码版本）
 * - .js → 尝试 .jsc
 * - 无后缀 → 尝试 .js 和 .jsc
 *
 * @param filepath - 模块路径
 * @returns 模块绝对路径，无法解析时返回 undefined
 */
export function resolveModule(filepath: string): string | undefined {
  let fullpath: string | undefined;
  try {
    fullpath = require.resolve(filepath);
  } catch {
    // 特殊后缀处理：配置文件名如 config.default、config.prod
    if (filepath && (filepath.endsWith('.default') || filepath.endsWith('.prod'))) {
      fullpath = filepath + '.jsc';
    } else if (filepath && filepath.endsWith('.js')) {
      fullpath = filepath + 'c'; // .js → .jsc
    }

    // 打包模式下 require.resolve 可能失败，尝试直接检查文件是否存在
    if (!fullpath || !fs.existsSync(fullpath)) {
      if (fs.existsSync(filepath + '.js')) {
        fullpath = filepath + '.js';
      } else if (fs.existsSync(filepath + '.jsc')) {
        fullpath = filepath + '.jsc';
      }
    }

    if (!fs.existsSync(filepath) && (!fullpath || !fs.existsSync(fullpath))) {
      console.warn(`[ee-core] [loader] resolveModule unknow filepath: ${JSON.stringify({ filepath, fullpath })}`);
      return undefined;
    }
  }

  return fullpath;
}

/**
 * 获取 electron 目录下文件的绝对路径
 *
 * 相对路径基于 electronDir 解析，同时尝试 resolveModule 查找实际文件。
 *
 * @param filepath - 文件路径（相对或绝对）
 * @returns 文件的绝对路径
 * @throws 文件不存在时抛出错误
 */
export function getFullpath(filepath: string): string {
  let fullpath: string | undefined;
  const isAbsolute = path.isAbsolute(filepath);
  if (!isAbsolute) {
    filepath = path.join(getElectronDir(), filepath);
  }

  fullpath = resolveModule(filepath);
  if (!fullpath || !fs.existsSync(fullpath)) {
    throw new Error(`[ee-core] [loader] getFullpath filepath ${filepath} not exists`);
  }
  return fullpath;
}
