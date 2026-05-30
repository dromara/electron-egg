/**
 * @module cross/crossProcess
 * @description Cross-process child process management. Encapsulates the logic of using cross-spawn
 * to create external processes, handling process path resolution, platform differences,
 * lifecycle monitoring, and graceful exit.
 *
 * Supported external program types:
 * - Go compiled binaries
 * - Python scripts
 * - Other executable programs
 *
 * Process path resolution rules:
 * - Config has cmd → use cmd as executable file path
 * - Config has no cmd → use extraResourcesDir/{name} as path
 * - Windows platform automatically adds .exe extension
 * - Dev environment relative to project root, production relative to extraResources directory
 */
import EventEmitter from 'events';
import path from 'path';
import crossSpawn from 'cross-spawn';
import tkill from 'tree-kill';
import { coreLogger } from '../log/index.js';
import { getExtraResourcesDir, isPackaged, isDev, getBaseDir } from '../ps/index.js';
import { Events } from '../const/channel.js';
import { getValueFromArgv, getRandomString } from '../utils/helper.js';
import { parseArgv } from '../utils/pargv.js';
import * as is from '../utils/is.js';
import { electronApp } from '../electron/app/index.js';
import type { CrossTargetConfig } from '../types/index.js';

export type { CrossTargetConfig };

/** Options when creating a CrossProcess */
export interface CrossProcessOptions {
  /** Target service configuration */
  targetConf: CrossTargetConfig;
  /** Allocated port number */
  port: number;
}

/**
 * CrossProcess - child process instance
 *
 * Encapsulates the complete lifecycle of an external process:
 * Create → Run → Listen for events → Terminate
 *
 * Notifies the Cross manager of child process events (exit/error) via the host's emitter.
 */
export class CrossProcess {
  /** Event emitter */
  emitter: EventEmitter;
  /** Host (Cross manager), used to notify process events */
  host: CrossHost;
  /** Child process object returned by cross-spawn */
  child: ReturnType<typeof crossSpawn> | undefined;
  /** Child process PID */
  pid: number;
  /** Allocated port number */
  port: number;
  /** Unique service name (may be rewritten by Cross manager to avoid conflicts) */
  name: string;
  /** Service configuration */
  config: CrossTargetConfig;

  constructor(host: CrossHost, opt: CrossProcessOptions = { targetConf: { name: '' }, port: 0 }) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = undefined;
    this.pid = 0;
    this.port = 0;
    this.name = '';
    this.config = { name: '' };
    this._init(opt);
  }

  /**
   * Initialize child process
   *
   * Execution flow:
   * 1. Save configuration and port
   * 2. Resolve executable file path (handle cmd/directory configuration and platform differences)
   * 3. Set standard output mode (inherit in dev environment, ignore in production)
   * 4. Start child process using cross-spawn
   * 5. Listen for exit and error events
   */
  _init(options: CrossProcessOptions = { targetConf: { name: '' }, port: 0 }): void {
    const { targetConf, port } = options;
    this.config = targetConf;
    this.port = port;

    // This name may be rewritten by the Cross manager if duplicated in childrenMap
    this.name = targetConf.name;

    // Resolve executable file path
    let cmdPath = '';
    const cmdArgs = targetConf.args || [];
    let execDir = getExtraResourcesDir();
    // Standard output configuration: inherit terminal output in dev, ignore in production
    let standardOutput: ('pipe' | 'ignore' | 'inherit' | 'ipc')[] = ['inherit', 'inherit', 'inherit', 'ipc'];
    if (isPackaged()) {
      standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
    }
    if (targetConf.stdio) {
      standardOutput = targetConf.stdio;
    }

    const { cmd, directory } = targetConf;
    // Prefer cmd configuration
    if (cmd) {
      if (!directory) {
        throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
      }
      cmdPath = cmd;
      // In non-dev environments, relative paths are resolved based on extraResources
      if (!path.isAbsolute(cmd) && !isDev()) {
        cmdPath = path.join(getExtraResourcesDir(), cmd);
      }
    } else {
      // Without cmd, use extraResourcesDir/{name} as the executable file path
      cmdPath = path.join(getExtraResourcesDir(), targetConf.name);
    }

    // Windows platform automatically adds .exe extension
    if (is.windows() && path.extname(cmdPath) !== '.exe') {
      if (targetConf.windowsExtname === true || !isDev()) {
        cmdPath += '.exe';
      }
    }

    // Resolve working directory
    if (directory && path.isAbsolute(directory)) {
      execDir = directory;
    } else if (directory && !path.isAbsolute(directory)) {
      if (isDev()) {
        execDir = path.join(getBaseDir(), directory);
      } else {
        execDir = path.join(getExtraResourcesDir(), directory);
      }
    } else {
      execDir = getExtraResourcesDir();
    }

    coreLogger.info(`[cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
    const coreProcess = crossSpawn(cmdPath, cmdArgs, {
      stdio: standardOutput,
      detached: false,
      cwd: execDir,
    });
    this.child = coreProcess;
    this.pid = coreProcess.pid || 0;

    // Listen for child process exit: caused by external termination or internal error
    coreProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessExit, data);
      coreLogger.info(
        `[cross/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`
      );
      this._exitElectron();
    });

    // Listen for child process errors
    coreProcess.on('error', (err: Error) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessError, data);
      coreLogger.error(
        `[cross/process] received a error from child-process, error: ${err}, pid:${this.pid}`
      );
      this._exitElectron();
    });
  }

  /**
   * Terminate child process
   *
   * First sends SIGINT signal for graceful exit, then sends SIGKILL for forced termination if it fails.
   * If the process still hasn't exited after timeout, triggers _exitElectron as a safety net.
   *
   * @param timeout - Timeout for waiting exit (milliseconds)
   */
  kill(timeout = 1000): void {
    tkill(this.pid, 'SIGINT', (err: Error | undefined) => {
      if (err) {
        coreLogger.error(
          `[cross/process] kill cross-process, error: ${err}, pid:${this.pid}`
        );
        // SIGINT failed, use SIGKILL for forced termination
        tkill(this.pid, 'SIGKILL');
      }
      // Timeout safety net: if exit event is not triggered within timeout, manually call _exitElectron
      setTimeout(() => {
        if (this.child && !this.child.killed) {
          this._exitElectron();
        }
      }, timeout);
    });
  }

  /**
   * Get the service URL of the child process
   *
   * Parses hostname and ssl flag from startup arguments, constructs HTTP/HTTPS URL.
   * Outputs warning when port is 0 (service may not have bound port correctly).
   *
   * @returns Service URL, e.g., http://127.0.0.1:7070
   */
  getUrl(): string {
    if (!this.port) {
      coreLogger.warn(`[cross/process] getUrl called with port 0, pid:${this.pid}`);
    }
    const ssl = getValueFromArgv(this.config.args || [], 'ssl');
    let hostname = getValueFromArgv(this.config.args || [], 'hostname') as string | undefined;
    let protocol = 'http://';
    if (ssl && (ssl === 'true' || ssl === '1')) {
      protocol = 'https://';
    }
    hostname = hostname ? hostname : '127.0.0.1';
    const url = protocol + hostname + ':' + this.port;

    return url;
  }

  /**
   * Get key-value object of startup arguments
   *
   * @returns Parsed arguments object
   */
  getArgsObj(): Record<string, unknown> {
    const obj = parseArgv(this.config.args || []);
    return obj;
  }

  /**
   * Set port number
   *
   * @param port - Port number (strings will be converted to numbers)
   */
  setPort(port: string | number): void {
    this.port = typeof port === 'string' ? parseInt(port, 10) : port;
  }

  /**
   * Generate unique ID
   *
   * @returns Unique identifier in the format 'node:{pid}:{randomString}'
   */
  _generateId(): string {
    const rid = getRandomString();
    return `node:${this.pid}:${rid}`;
  }

  /**
   * Trigger Electron main process exit when child process exits
   *
   * Only effective when appExit=true is configured, ensuring the main process also exits when the child process crashes.
   *
   * @param timeout - Delayed exit time (milliseconds), waiting for resource release
   */
  _exitElectron(timeout = 1000): void {
    if (this.config.appExit) {
      setTimeout(() => {
        electronApp.quit();
      }, timeout);
    }
  }
}

/**
 * CrossHost interface
 *
 * CrossProcess communicates with the host (Cross manager) through this interface,
 * sending child process exit and error events.
 */
export interface CrossHost {
  emitter: EventEmitter | undefined;
}
