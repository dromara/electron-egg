/**
 * @module html
 * @description HTML 静态资源路径工具模块。提供获取 public 目录下
 * HTML 文件绝对路径的能力，供 BrowserWindow 加载本地页面时使用。
 *
 * 该模块需要兼容 CJS 和 ESM 两种模块格式：
 * - CJS 环境下可直接使用 __dirname 获取当前文件所在目录
 * - ESM 环境下 __dirname 不可用，回退到 process.cwd()
 *
 * 注意：ESM 下的回退策略是尽力而为的（best-effort），因为 ESM 中
 * 无法在不引入额外 API（如 import.meta.url + fileURLToPath）的情况下
 * 可靠地获取 __dirname。此模块选择回退到 cwd 作为折中方案，
 * 在打包后的生产环境中通常能满足需求。
 */
import path from 'path';

/**
 * 获取当前模块所在目录
 *
 * 兼容双模块格式（CJS + ESM）的目录获取方法：
 * - CJS：使用内置的 __dirname 变量
 * - ESM：回退到当前工作目录（process.cwd() 的简写）
 *
 * @returns 当前目录的绝对路径
 */
function getCurrentDir(): string {
  // In CJS, __dirname is available
  // In ESM, fallback to current working directory
  // Note: This is a best-effort approach for dual module support
  return typeof __dirname !== 'undefined' ? __dirname : path.resolve();
}

/**
 * 获取 HTML 文件的绝对路径
 *
 * 根据传入的文件名，拼接当前目录生成完整的文件路径。
 * 通常用于 BrowserWindow 的 loadFile() 方法加载本地 HTML 页面。
 *
 * 使用示例：
 * ```ts
 * // 获取 public 目录下的 index.html 路径
 * const htmlPath = getHtmlFilepath('index.html');
 * // 例如返回：/path/to/app/public/electron/index.html
 *
 * // 获取子目录下的页面
 * const subPath = getHtmlFilepath('sub/page.html');
 * ```
 *
 * @param name - HTML 文件名或相对路径（相对于当前模块目录）
 * @returns HTML 文件的绝对路径
 */
export function getHtmlFilepath(name: string): string {
  return path.join(getCurrentDir(), name);
}
