/**
 * @module utils/is
 * @description Electron runtime environment detection utility. Provides a set of functions
 * for determining the current process type, operating system platform, and processor
 * architecture, enabling framework code to execute different logic for different environments.
 *
 * Usage:
 * ```ts
 * import { main, osx, all } from './is.js';
 * if (all(main, osx)) { /* main process + macOS *\/ }
 * ```
 */
/**
 * Detect whether currently running in the renderer process
 *
 * Electron process.type values:
 * - 'renderer': renderer process
 * - 'browser': main process
 * - 'worker': Worker process
 *
 * @returns true if currently in the renderer process
 */
export function renderer(): boolean {
  return process.type === 'renderer';
}

/**
 * Detect whether currently running in the main process
 *
 * The main process's process.type is 'browser' in Electron.
 *
 * @returns true if currently in the main process
 */
export function main(): boolean {
  return process.type === 'browser';
}

/**
 * Detect whether the current operating system is macOS
 *
 * Based on process.platform === 'darwin'.
 * macOS, iOS, and other Apple systems all have platform 'darwin'.
 *
 * @returns true if currently running on macOS
 */
export function osx(): boolean {
  return process.platform === 'darwin';
}

/**
 * Detect whether the current operating system is macOS (alias for osx)
 *
 * @returns true if currently running on macOS
 */
export function macOS(): boolean {
  return osx();
}

/**
 * Detect whether the current operating system is Windows
 *
 * Based on process.platform === 'win32'.
 * Note: 64-bit Windows also has platform 'win32'.
 *
 * @returns true if currently running on Windows
 */
export function windows(): boolean {
  return process.platform === 'win32';
}

/**
 * Detect whether the current operating system is Linux
 *
 * @returns true if currently running on Linux
 */
export function linux(): boolean {
  return process.platform === 'linux';
}

/**
 * Detect whether the current operating system is OpenHarmony
 *
 * @returns true if currently running on OpenHarmony
 */
export function openharmony(): boolean {
  return (process.platform as string) === 'openharmony';
}

/**
 * Detect whether the processor architecture is x86 (32-bit)
 *
 * Based on process.arch === 'ia32'.
 *
 * @returns true for 32-bit x86 architecture
 */
export function x86(): boolean {
  return process.arch === 'ia32';
}

/**
 * Detect whether the processor architecture is x64 (64-bit)
 *
 * Based on process.arch === 'x64'.
 *
 * @returns true for 64-bit x86 architecture
 */
export function x64(): boolean {
  return process.arch === 'x64';
}

/**
 * Detect whether the app is running in a macOS sandbox environment
 *
 * macOS sandbox apps contain APP_SANDBOX_CONTAINER_ID in environment variables.
 *
 * @returns true if running in a sandbox environment
 */
export function sandbox(): boolean {
  return 'APP_SANDBOX_CONTAINER_ID' in process.env;
}

/**
 * Detect whether the app is a Mac App Store build
 *
 * Electron's process.mas property is true in MAS builds.
 *
 * @returns true for MAS build
 */
export function mas(): boolean {
  return process.mas === true;
}

/**
 * Detect whether the app is a Windows Store (appx) build
 *
 * Electron's process.windowsStore property is true in Windows Store builds.
 *
 * @returns true for Windows Store build
 */
export function windowsStore(): boolean {
  return process.windowsStore === true;
}

/**
 * Determine if all condition functions are true
 *
 * Accepts multiple functions returning boolean values, executes each and checks the result.
 * Returns false at the first false result; returns true only if all are true.
 *
 * @param isFunctions - List of condition functions
 * @returns true if all are true, false if any is false, undefined if no arguments
 */
export function all(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (!fn()) return false;
  }
  return true;
}

/**
 * Determine if all condition functions are false
 *
 * Accepts multiple functions returning boolean values, executes each and checks the result.
 * Returns false at the first true result; returns true only if all are false.
 *
 * @param isFunctions - List of condition functions
 * @returns true if all are false, false if any is true, undefined if no arguments
 */
export function none(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return false;
  }
  return true;
}

/**
 * Determine if at least one condition function is true
 *
 * Accepts multiple functions returning boolean values, executes each and checks the result.
 * Returns true at the first true result; returns false only if all are false.
 *
 * @param isFunctions - List of condition functions
 * @returns true if any is true, false if all are false, undefined if no arguments
 */
export function one(...isFunctions: Array<() => boolean>): boolean | undefined {
  if (!isFunctions.length) return undefined;
  for (const fn of isFunctions) {
    if (fn()) return true;
  }
  return false;
}
