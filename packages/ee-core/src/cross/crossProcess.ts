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

export interface CrossTargetConfig {
  name: string;
  args?: string[];
  cmd?: string;
  directory?: string;
  windowsExtname?: boolean;
  stdio?: ('pipe' | 'ignore' | 'inherit' | 'ipc')[];
  appExit?: boolean;
  port?: number;
  enable?: boolean;
}

export interface CrossProcessOptions {
  targetConf: CrossTargetConfig;
  port: number;
}

export class CrossProcess {
  emitter: EventEmitter;
  host: CrossHost;
  child: ReturnType<typeof crossSpawn> | undefined;
  pid: number;
  port: number;
  name: string;
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
   * 初始化子进程
   */
  _init(options: CrossProcessOptions = { targetConf: { name: '' }, port: 0 }): void {
    const { targetConf, port } = options;
    this.config = targetConf;
    this.port = port;

    // 该名称如果在childrenMap重复，会被重写
    this.name = targetConf.name;

    // Launch executable program
    let cmdPath = '';
    const cmdArgs = targetConf.args || [];
    let execDir = getExtraResourcesDir();
    let standardOutput: ('pipe' | 'ignore' | 'inherit' | 'ipc')[] = ['inherit', 'inherit', 'inherit', 'ipc'];
    if (isPackaged()) {
      standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
    }
    if (targetConf.stdio) {
      standardOutput = targetConf.stdio;
    }

    const { cmd, directory } = targetConf;
    // use cmd first
    if (cmd) {
      if (!directory) {
        throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
      }
      cmdPath = cmd;
      if (!path.isAbsolute(cmd) && !isDev()) {
        cmdPath = path.join(getExtraResourcesDir(), cmd);
      }
    } else {
      cmdPath = path.join(getExtraResourcesDir(), targetConf.name);
    }

    // windows
    if (is.windows() && path.extname(cmdPath) !== '.exe') {
      // Complete the executable program extension
      // notice: python.exe may bring up the App Store
      if (targetConf.windowsExtname === true || !isDev()) {
        cmdPath += '.exe';
      }
    }

    // executable program directory
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

    coreProcess.on('exit', (code, signal) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessExit, data);
      // Child process closed: The child process was killed externally or an internal error caused the application to stop, resulting in the application exiting
      coreLogger.info(
        `[cross/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`
      );
      this._exitElectron();
    });

    coreProcess.on('error', (err) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessError, data);
      coreLogger.error(
        `[cross/process] received a error from child-process, error: ${err}, pid:${this.pid}`
      );
      this._exitElectron();
    });
  }

  /**
   * kill
   */
  kill(timeout = 1000): void {
    tkill(this.pid, 'SIGINT', (err: Error | undefined) => {
      if (err) {
        coreLogger.error(
          `[cross/process] kill cross-process, error: ${err}, pid:${this.pid}`
        );
        tkill(this.pid, 'SIGKILL');
      }
      setTimeout(() => {
        this._exitElectron();
      }, timeout);
    });
  }

  getUrl(): string {
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

  getArgsObj(): Record<string, unknown> {
    const obj = parseArgv(this.config.args || []);
    return obj;
  }

  setPort(port: string | number): void {
    this.port = typeof port === 'string' ? parseInt(port, 10) : port;
  }

  _generateId(): string {
    const rid = getRandomString();
    return `node:${this.pid}:${rid}`;
  }

  /**
   * exit electron
   */
  _exitElectron(timeout = 1000): void {
    if (this.config.appExit) {
      setTimeout(() => {
        // 主进程退出
        electronApp.quit();
      }, timeout);
    }
  }
}

export interface CrossHost {
  emitter: EventEmitter | undefined;
}
