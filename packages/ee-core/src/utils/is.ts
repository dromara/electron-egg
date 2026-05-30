/**
 * @module utils/is
 * @description Electron 运行环境检测工具。提供一系列函数用于判断当前进程类型、
 * 操作系统平台和处理器架构，便于框架代码针对不同环境执行不同逻辑。
 *
 * 使用方式：
 * ```ts
 * import { main, osx, all } from './is.js';
 * if (all(main, osx)) { /* 主进程 + macOS *\/ }
 * ```
 */
/**
 * 检测当前是否运行在渲染进程中
 *
 * Electron 中 process.type 的值：
 * - 'renderer'：渲染进程
 * - 'browser'：主进程
 * - 'worker'：Worker 进程
 *
 * @returns true 表示当前在渲染进程中
 */
export function renderer(): boolean {
  return process.type === 'renderer';
}

/**
 * 检测当前是否运行在主进程中
 *
 * Electron 主进程的 process.type 为 'browser'。
 *
 * @returns true 表示当前在主进程中
 */
export function main(): boolean {
  return process.type === 'browser';
}

/**
 * 检测当前操作系统是否为 macOS
 *
 * 基于 process.platform === 'darwin' 判断。
 * macOS、iOS 等苹果系统的 platform 均为 'darwin'。
 *
 * @returns true 表示当前在 macOS 上运行
 */
export function osx(): boolean {
  return process.platform === 'darwin';
}

/**
 * 检测当前操作系统是否为 macOS（osx 的别名）
 *
 * @returns true 表示当前在 macOS 上运行
 */
export function macOS(): boolean {
  return osx();
}

/**
 * 检测当前操作系统是否为 Windows
 *
 * 基于 process.platform === 'win32' 判断。
 * 注意：64 位 Windows 的 platform 也是 'win32'。
 *
 * @returns true 表示当前在 Windows 上运行
 */
export function windows(): boolean {
  return process.platform === 'win32';
}

/**
 * 检测当前操作系统是否为 Linux
 *
 * @returns true 表示当前在 Linux 上运行
 */
export function linux(): boolean {
  return process.platform === 'linux';
}

/**
 * 检测处理器架构是否为 x86（32 位）
 *
 * 基于 process.arch === 'ia32' 判断。
 *
 * @returns true 表示 32 位 x86 架构
 */
export function x86(): boolean {
  return process.arch === 'ia32';
}

/**
 * 检测处理器架构是否为 x64（64 位）
 *
 * 基于 process.arch === 'x64' 判断。
 *
 * @returns true 表示 64 位 x86 架构
 */
export function x64(): boolean {
  return process.arch === 'x64';
}

/**
 * 检测应用是否运行在 macOS 沙箱环境中
 *
 * macOS 沙箱应用在环境变量中包含 APP_SANDBOX_CONTAINER_ID。
 *
 * @returns true 表示在沙箱环境中运行
 */
export function sandbox(): boolean {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env;
}

/**
 * 检测应用是否为 Mac App Store 构建
 *
 * Electron 的 process.mas 属性在 MAS 构建中为 true。
 *
 * @returns true 表示 MAS 构建
 */
export function mas(): boolean {
  return process.mas === true;
}

/**
 * 检测应用是否为 Windows Store (appx) 构建
 *
 * Electron 的 process.windowsStore 属性在 Windows Store 构建中为 true。
 *
 * @returns true 表示 Windows Store 构建
 */
export function windowsStore(): boolean {
  return process.windowsStore === true;
}

/**
 * 判断所有条件函数是否都为真
 *
 * 接受多个返回布尔值的函数，逐一执行并检查结果。
 * 遇到第一个 false 即返回 false，全部为 true 才返回 true。
 *
 * @param isFunctions - 条件判断函数列表
 * @returns 全部为 true 返回 true，任一为 false 返回 false，无参数返回 undefined
 */
export function all(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (!fn()) return false;
  }
  return true;
}

/**
 * 判断所有条件函数是否都为假
 *
 * 接受多个返回布尔值的函数，逐一执行并检查结果。
 * 遇到第一个 true 即返回 false，全部为 false 才返回 true。
 *
 * @param isFunctions - 条件判断函数列表
 * @returns 全部为 false 返回 true，任一为 true 返回 false，无参数返回 undefined
 */
export function none(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return false;
  }
  return true;
}

/**
 * 判断是否有至少一个条件函数为真
 *
 * 接受多个返回布尔值的函数，逐一执行并检查结果。
 * 遇到第一个 true 即返回 true，全部为 false 才返回 false。
 *
 * @param isFunctions - 条件判断函数列表
 * @returns 任一为 true 返回 true，全部为 false 返回 false，无参数返回 undefined
 */
export function one(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return true;
  }
  return false;
}
