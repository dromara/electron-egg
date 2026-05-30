/**
 * @module utils/helper
 * @description Common utility function collection. Provides debounce, sleep, version comparison,
 * file operations, command line argument processing and other common functionalities
 * for framework modules and business code.
 */
import fs from 'fs';
import path from 'path';
import { parseArgv } from './pargv.js';

const _basePath = process.cwd();

/**
 * Create debounce function factory
 *
 * Returns a debounce wrapper that applies debounce control to the passed function.
 *
 * Debounce mechanism:
 * - When delayTime is 0 or isImedite is true, the function executes immediately (no debounce)
 * - Otherwise, sets a timer for delayed execution; if the same function is called again before
 *   the timer fires, the previous timer is cancelled and reset, ensuring the function only
 *   executes once after the last call's delayTime milliseconds
 * - Uses Map with function reference as key to store timers, supporting debounce for multiple
 *   different functions simultaneously
 * - Timers are automatically cleaned from the Map after firing, preventing memory leaks
 *
 * @returns Debounce wrapper function
 * @param fn - Target function to debounce
 * @param delayTime - Delay time (ms), 0 or omitted executes immediately
 * @param isImedite - Whether to execute immediately, true skips debounce and calls directly
 * @param args - Arguments to pass to the target function
 *
 * @example
 * ```ts
 * const debounce = fnDebounce();
 * // Debounced call: repeated calls within 300ms only execute the last one
 * debounce(myFunction, 300, false, data);
 * // Immediate execution: bypasses debounce
 * debounce(myFunction, 0, true, data);
 * ```
 */
export function fnDebounce(): (
  fn: (args?: unknown) => void,
  delayTime?: number,
  isImedite?: boolean,
  args?: unknown
) => void {
  const fnMap = new Map<(...args: unknown[]) => void, { delayTime: number; timer: NodeJS.Timeout }>();

  return (fn, delayTime, isImedite, args) => {
    const setTimer = () => {
      const timer = setTimeout(() => {
        fn(args);
        clearTimeout(timer);
        // Remove from Map after timer executes, releasing the reference
        fnMap.delete(fn);
      }, delayTime);

      fnMap.set(fn, { delayTime: delayTime || 0, timer });
    };

    // No delay or immediate execution requested, call function directly without debounce
    if (!delayTime || isImedite) return fn(args);

    // Same function has a pending timer, cancel the old one and reset (core debounce logic)
    const existing = fnMap.get(fn);
    if (existing) {
      clearTimeout(existing.timer);
    }
    setTimer();
  };
}

/**
 * Generate a random string
 *
 * Generates an approximately 10-character alphanumeric string based on Math.random().
 * Suitable for generating temporary identifiers, not for security scenarios.
 *
 * @returns Random string (e.g. 'x3k9m2a1b5')
 */
export function getRandomString(): string {
  return Math.random().toString(36).substring(2);
}

/**
 * Recursively create directory
 *
 * No error if directory already exists, equivalent to mkdir -p.
 *
 * @param filepath - Directory path to create
 * @param opt - Optional parameters, mode specifies directory permissions
 */
export function mkdir(filepath: string, opt: { mode?: number } = {}): void {
  fs.mkdirSync(filepath, { recursive: true, ...opt });
}

/**
 * Recursively modify file and directory permissions
 *
 * Traverses all files and subdirectories under the specified path, recursively modifying permissions.
 * Modifies child file/directory permissions first, then the root directory's own permissions.
 *
 * @param filepath - Target directory path
 * @param mode - Permission value (e.g. 0o755)
 */
export function chmodPath(filepath: string, mode: number): void {
  if (fs.existsSync(filepath)) {
    const files = fs.readdirSync(filepath);
    files.forEach((file) => {
      const curPath = path.join(filepath, file);
      if (fs.statSync(curPath).isDirectory()) {
        // Recursively process subdirectories
        chmodPath(curPath, mode);
      } else {
        fs.chmodSync(curPath, mode);
      }
    });
    // Finally modify the directory's own permissions
    fs.chmodSync(filepath, mode);
  }
}

/**
 * Compare two semantic version numbers
 *
 * Splits version numbers by '.' and compares each segment numerically.
 * Pads shorter versions with 0s for alignment.
 *
 * @param v1 - First version number (e.g. '1.2.3')
 * @param v2 - Second version number (e.g. '1.3.0')
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersion(v1: string, v2: string): number {
  const s1 = v1.split('.');
  const s2 = v2.split('.');
  const len = Math.max(s1.length, s2.length);

  // Pad shorter version with zeros, e.g. '1.2' becomes '1.2.0'
  while (s1.length < len) {
    s1.push('0');
  }
  while (s2.length < len) {
    s2.push('0');
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(s1[i] || '0');
    const num2 = parseInt(s2[i] || '0');

    if (num1 > num2) {
      return 1;
    } else if (num1 < num2) {
      return -1;
    }
  }

  return 0;
}

/**
 * Serialize object to JSON string
 *
 * Unlike JSON.stringify, can exclude specified fields to hide sensitive information.
 *
 * @param obj - Object to serialize
 * @param ignore - List of property names to exclude
 * @returns Filtered JSON string
 */
export function stringify(obj: Record<string, unknown>, ignore: string[] = []): string {
  const result: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (!ignore.includes(key)) {
      result[key] = obj[key];
    }
  });
  return JSON.stringify(result);
}

/**
 * Check if value is valid
 *
 * Determines if the value is non-null, non-undefined, and non-empty string.
 * Commonly used for configuration validation and parameter validity checks.
 *
 * @param value - Value to check
 * @returns true if value is valid, false if value is null/undefined/empty string
 */
export function validValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

/**
 * Check if configuration file exists
 *
 * Checks if the specified path exists as a file under the project root directory,
 * used for pre-checking before configuration loading.
 *
 * @param prop - File path relative to project root
 * @returns true if file exists
 */
export function checkConfig(prop: string): boolean {
  const filepath = path.join(_basePath, prop);
  return fs.existsSync(filepath);
}

/**
 * Async sleep
 *
 * Returns a Promise that resolves after the specified milliseconds.
 * Releases the event loop during sleep, allowing other async tasks to execute.
 *
 * @param ms - Sleep time (ms)
 * @returns Promise that resolves after ms milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Naive synchronous sleep implementation (polling wait)
 *
 * Continuously checks time via a while loop, high CPU usage.
 * Only used as a fallback when Atomics.wait is unavailable.
 *
 * @param ms - Sleep time (ms)
 */
const sleepNaive = (ms: number): void => {
  const endTime = Date.now() + ms;
  while (endTime > Date.now()) {
    /* sleeping - busy wait, CPU spinning */
  }
};

/**
 * Atomic synchronous sleep implementation
 *
 * Uses Atomics.wait on a SharedArrayBuffer to block the current thread,
 * a truly synchronous blocking approach that does not consume CPU.
 * Requires Node.js environment with SharedArrayBuffer and Atomics support.
 *
 * @param ms - Sleep time (ms), Atomics.wait automatically unblocks after timeout
 */
const sleepAtomic = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/**
 * Synchronous blocking sleep (does not release event loop)
 *
 * Used in scenarios requiring synchronous waiting, blocks the current thread until
 * the specified time is reached.
 * Implementation strategy:
 * 1. Prefer Atomics.wait: zero CPU usage, achieves true thread blocking via
 *    SharedArrayBuffer; Atomics.wait automatically unblocks after timeout
 * 2. Falls back to while loop busy wait: CPU spins but achieves the same blocking effect
 *
 * Suitable for: child process initialization waiting, Electron main process synchronous timing control
 * Not suitable for: renderer process (will freeze UI)
 *
 * @param ms - Sleep time (ms), must be a non-negative finite number
 * @throws TypeError - ms is not of type 'number'
 * @throws RangeError - ms is not in the range [0, Infinity)
 */
export function systemSleep(ms: number): void {
  if (typeof ms !== 'number') {
    throw new TypeError(`systemSleep: ms is not of type 'number'. Given: ${ms} of type '${typeof ms}'`);
  }
  if (!(ms >= 0 && ms < Infinity)) {
    throw new RangeError(`systemSleep: ms must be in the range [0, Infinity). Given: ${ms}`);
  }
  // Prefer Atomics approach for zero CPU usage; otherwise fall back to busy wait
  if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
    sleepAtomic(ms);
  } else {
    sleepNaive(ms);
  }
}

/**
 * Replace a specified key's value in command line arguments
 *
 * Finds key=value format parameters in the argv array and replaces the value part.
 * Commonly used to dynamically modify parameter values when starting child processes.
 *
 * @param argv - Command line argument array
 * @param key - Parameter key name to replace
 * @param value - New parameter value
 * @returns Modified argv array
 *
 * @example
 * ```ts
 * replaceArgsValue(['--port=8080', '--env=dev'], 'port', '9090')
 * // => ['--port=9090', '--env=dev']
 * ```
 */
export function replaceArgsValue(argv: string[], key: string, value: string): string[] {
  const searchKey = key + '=';
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      // Keep the key= prefix, only replace the value after it
      argv[i] = item.substring(0, pos + searchKey.length) + value;
      break;
    }
  }
  return argv;
}

/**
 * Get the value of a specified key from command line argument array
 *
 * First parses standard format parameters (--key value) via pargv,
 * then falls back to scanning bare key-value pairs (key=value format, no -- prefix).
 *
 * @param argv - Command line argument array
 * @param key - Key name to look up
 * @returns Value corresponding to the key, or undefined if not found
 */
export function getValueFromArgv(argv: string[], key: string): unknown {
  const argvObj = parseArgv(argv);
  if (Object.prototype.hasOwnProperty.call(argvObj, key)) {
    return argvObj[key];
  }
  // Fallback strategy: scan bare key-value pairs without -- prefix
  const searchKey = key + '=';
  for (const item of argv) {
    if (!item) continue;
    const pos = item.indexOf(searchKey);
    if (pos !== -1) {
      return item.substring(pos + searchKey.length);
    }
  }
  return undefined;
}

/**
 * Check if a file exists
 *
 * Determines if the path is a file via fs.statSync.
 * Any error (file not found, insufficient permissions, etc.) returns false.
 *
 * @param filepath - File path
 * @returns true if file exists, false if it doesn't exist or isn't a file
 */
export function fileIsExist(filepath: string): boolean {
  try {
    return fs.statSync(filepath).isFile();
  } catch {
    return false;
  }
}
