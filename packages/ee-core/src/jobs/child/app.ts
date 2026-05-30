/**
 * @module jobs/child/app
 * @description Child process entry application. Runs in child processes created by child_process.fork(),
 * responsible for receiving messages from the main process and executing corresponding task files.
 *
 * Child process lifecycle:
 * 1. Main process forks a child process and loads this module
 * 2. Child process receives config from main process via processArgs, avoiding filesystem config loading
 * 3. Child process listens for message events, waiting for main process instructions
 * 4. Upon receiving a run command, loads and executes the task file
 * 5. Class-type task files: instantiated and cached on first execution, reused thereafter
 * 6. Function-type task files: called directly on each execution
 *
 * Note: Child processes are independent from the main process and must load exception handling separately (loadException)
 */
import { isClass, isFunction } from '../../utils/type_check.js';
import { loadException } from '../../exception/index.js';
import { setConfig } from '../../config/index.js';
import { requireFile } from '../../loader/index.js';
import { coreLogger } from '../../log/index.js';
import { isBytecodeClass } from '../../core/utils/index.js';
import { Processes } from '../../const/channel.js';
import type { Config } from '../../types/index.js';
import type { JobMessage } from './jobProcess.js';

// Receive config from main process via processArgs, so child process
// doesn't need to load config from filesystem (which may fail in bundled mode)
try {
  const args = JSON.parse(process.argv[2] || '{}');
  if (args.eeConfig) {
    setConfig(args.eeConfig as Config);
  }
} catch {
  // If config can't be parsed, child process will use default config
}

// Child process must independently load exception handling
loadException();

/** Supported command list */
const commands = ['run'];

/**
 * ChildApp - Child process application
 *
 * Runs in the child process, receives run commands from the main process to execute task files.
 * Class-type task instances are cached in jobMap for reuse.
 */
class ChildApp {
  /** Task instance cache: { jobPath: instance }, same task file is instantiated only once */
  jobMap: Map<string, unknown>;

  constructor() {
    this._initEvents();
    this.jobMap = new Map();
  }

  /**
   * Initialize event listeners
   *
   * Listen for main process messages and child process exit events.
   */
  _initEvents(): void {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code: number | null) => {
      coreLogger.info(`[jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
    });
  }

  /**
   * Handle main process messages
   *
   * Only processes commands in the commands list, ignoring unknown commands.
   */
  _handleMessage(m: JobMessage): void {
    if (commands.indexOf(m.cmd) === -1) {
      return;
    }
    switch (m.cmd) {
      case 'run':
        this.run(m);
        break;
      default:
        break;
    }
    coreLogger.info(`[jobs/child] received a message from main-process, message: ${JSON.stringify(m)}`);
  }

  /**
   * Run a task
   *
   * Executes different logic based on the task file's export type:
   * - Class/bytecode class: instantiated and cached on first run (jobMap), reused thereafter
   *   - If jobFunc is specified: call the specified method on the instance
   *   - Otherwise call the instance's handle() method (default entry)
   * - Plain function: called directly with jobParams
   *
   * @param msg - Task message containing file path, parameters, and function name
   */
  run(msg: JobMessage = { mid: '', cmd: '' }): void {
    const { jobPath, jobParams, jobFunc, jobFuncParams } = msg;
    if (!jobPath) return;

    try {
      const mod = requireFile(jobPath);
      if (isClass(mod) || isBytecodeClass(mod)) {
        let instance: Record<string, unknown>;
        if (!this.jobMap.has(jobPath)) {
          // First execution: instantiate and cache
          instance = new (mod as new (...args: unknown[]) => Record<string, unknown>)(...(jobParams || []));
          this.jobMap.set(jobPath, instance);
        } else {
          // Subsequent execution: reuse cached instance
          instance = this.jobMap.get(jobPath) as Record<string, unknown>;
        }

        // Call the specified method or default handle method
        // Note: Use typeof check instead of hasOwnProperty to support instance and prototype methods
        if (jobFunc && typeof instance[jobFunc] === 'function') {
          (instance[jobFunc] as (...args: unknown[]) => unknown)(...(jobFuncParams || []));
        } else if (typeof instance.handle === 'function') {
          instance.handle(...(jobParams || []));
        }
      } else if (isFunction(mod)) {
        (mod as (...args: unknown[]) => unknown)(jobParams);
      }
    } catch (e) {
      coreLogger.error('[jobs/child] run error:', e);
      // Propagate error back to main process so it's not silently lost
      if (process.send) {
        process.send({ channel: Processes.showException, data: String(e) });
      }
    }
  }
}

// Create ChildApp instance when child process starts
new ChildApp();
