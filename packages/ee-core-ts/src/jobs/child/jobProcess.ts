import path from 'path';
import { EventEmitter } from 'events';
import { fork, type ChildProcess, type Serializable, type ForkOptions } from 'child_process';
import { coreLogger } from '../../log/index.js';
import { getBaseDir, isPackaged, allEnv } from '../../ps/index.js';
import { Processes, Events, Receiver } from '../../const/channel.js';
import { getRandomString } from '../../utils/helper.js';
import { getFullpath } from '../../loader/index.js';
import type { JobsConfig } from '../../types/index.js';

export interface JobProcessOptions {
  processArgs?: Record<string, unknown>;
  processOptions?: ForkOptions;
}

export interface JobMessage {
  mid: string;
  cmd: string;
  jobPath?: string;
  jobParams?: unknown[];
  jobFunc?: string;
  jobFuncParams?: unknown[];
}

export interface ProcessMessage {
  channel: string;
  event: string;
  data: unknown;
  eventReceiver: string;
}

function deepMergeOptions(
  defaultOpt: JobProcessOptions,
  userOpt: JobProcessOptions
): JobProcessOptions {
  return {
    processArgs: { ...defaultOpt.processArgs, ...userOpt.processArgs },
    processOptions: { ...defaultOpt.processOptions, ...userOpt.processOptions },
  };
}

export class JobProcess {
  emitter: EventEmitter;
  host: EventEmitter;
  args: string[];
  sleeping: boolean;
  child: ChildProcess;
  pid: number | undefined;
  config: JobsConfig;

  constructor(host: EventEmitter, opt: JobProcessOptions = {}, config: JobsConfig = { messageLog: false }) {
    let cwd = getBaseDir();
    const currentFilePath = typeof __filename !== 'undefined' ? __filename : '';
    const appPath = path.join(path.dirname(currentFilePath), 'app.js');
    if (isPackaged()) {
      cwd = path.join(getBaseDir(), '..');
    }

    const defaultOptions: JobProcessOptions = {
      processArgs: {},
      processOptions: {
        cwd,
        env: allEnv(),
        stdio: 'ignore',
      },
    };

    const options = deepMergeOptions(defaultOptions, opt);

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;
    this.config = config;

    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions ?? {});
    this.pid = this.child.pid;
    this._init();
  }

  _init(): void {
    const { messageLog } = this.config;
    this.child.on('message', (m: ProcessMessage) => {
      if (messageLog) {
        coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${JSON.stringify(m)}`);
      }

      if (m.channel === Processes.showException) {
        coreLogger.error(`${m.data}`);
      }

      if (m.channel === Processes.sendToMain) {
        this._eventEmit(m);
      }
    });

    this.child.on('exit', (code: number | null, signal: string | null) => {
      const data = { pid: this.pid };
      this.host.emit(Events.childProcessExit, data);
      coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    this.child.on('error', (err: Error) => {
      const data = { pid: this.pid };
      this.host.emit(Events.childProcessError, data);
      coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
    });
  }

  _eventEmit(m: ProcessMessage): void {
    switch (m.eventReceiver) {
      case Receiver.forkProcess:
        this.emitter.emit(m.event, m.data);
        break;
      case Receiver.childJob:
        this.host.emit(m.event, m.data);
        break;
      default:
        this.host.emit(m.event, m.data);
        this.emitter.emit(m.event, m.data);
        break;
    }
  }

  dispatch(cmd: string, jobPath = '', ...params: unknown[]): void {
    const mid = getRandomString();
    const msg: JobMessage = {
      mid,
      cmd,
      jobPath,
      jobParams: params,
    };

    this.child.send(msg as Serializable);
  }

  callFunc(jobPath = '', funcName = '', ...params: unknown[]): void {
    const fullPath = getFullpath(jobPath);
    const mid = getRandomString();
    const msg: JobMessage = {
      mid,
      cmd: 'run',
      jobPath: fullPath,
      jobFunc: funcName,
      jobFuncParams: params,
    };
    this.child.send(msg as Serializable);
  }

  kill(timeout = 1000): void {
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout);
  }
}
