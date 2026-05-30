/**
 * @module html
 * @description HTML static resource path utility module. Provides the ability to get absolute paths
 * of HTML files under the public directory, for use by BrowserWindow when loading local pages.
 *
 * This module needs to be compatible with both CJS and ESM module formats:
 * - In CJS environment, __dirname can be used directly to get the current file's directory
 * - In ESM environment, __dirname is not available, falls back to process.cwd()
 *
 * Note: The ESM fallback strategy is best-effort, because in ESM it is not possible
 * to reliably obtain __dirname without introducing additional APIs (such as import.meta.url + fileURLToPath).
 * This module chooses to fall back to cwd as a compromise, which typically works in
 * packaged production environments.
 */
import path from 'path';

/**
 * Get the directory of the current module
 *
 * Directory retrieval method compatible with dual module formats (CJS + ESM):
 * - CJS: Uses the built-in __dirname variable
 * - ESM: Falls back to the current working directory (shorthand for process.cwd())
 *
 * @returns Absolute path of the current directory
 */
function getCurrentDir(): string {
  // In CJS, __dirname is available
  // In ESM, fallback to current working directory
  // Note: This is a best-effort approach for dual module support
  return typeof __dirname !== 'undefined' ? __dirname : path.resolve();
}

/**
 * Get the absolute path of an HTML file
 *
 * Joins the current directory with the provided filename to generate the full file path.
 * Typically used with BrowserWindow's loadFile() method to load local HTML pages.
 *
 * Usage examples:
 * ```ts
 * // Get the path of index.html in the public directory
 * const htmlPath = getHtmlFilepath('index.html');
 * // e.g. returns: /path/to/app/public/electron/index.html
 *
 * // Get a page in a subdirectory
 * const subPath = getHtmlFilepath('sub/page.html');
 * ```
 *
 * @param name - HTML filename or relative path (relative to the current module directory)
 * @returns Absolute path of the HTML file
 */
export function getHtmlFilepath(name: string): string {
  return path.join(getCurrentDir(), name);
}
