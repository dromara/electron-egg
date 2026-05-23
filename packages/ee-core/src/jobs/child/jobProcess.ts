import path from 'path';
import { EventEmitter } from 'events';
import { fork, type ChildProcess, type Serializable, type ForkOptions } from 'child_process';
import serialize from 'serialize-javascript';
import { coreLogger } from '../../log/index.js';
import { getBaseDir, isPackaged, allEnv } from '../../ps/index.js';
import { Processes, Events, Receiver } from '../../const/channel.js';
import { getRandomString } from '../../utils/helper.js';
import { getFullpath } from '../../loader/index.js';
import { extend } from '../../utils/extend.js';
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
    // todo fork的cwd目录为什么要在app.asar外 ？
    if (isPackaged()) {
      cwd = path.join(getBaseDir(), '..');
    }

    const defaultOptions: JobProcessOptions = {
      processArgs: {},
      processOptions: {
        cwd,
        env: allEnv(),
        stdio: 'ignore', // pipe
      },
    };

    const options = extend(
      true,
      defaultOptions as unknown as Record<string, unknown>,
      opt as unknown as Record<string, unknown>
    ) as unknown as JobProcessOptions;

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;
    this.config = config;

    // 传递给子进程的参数
    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions ?? {});
    this.pid = this.child.pid;
    this._init();
  }

  _init(): void {
    const { messageLog } = this.config;
    this.child.on('message', (m: ProcessMessage) => {
      if (messageLog) {
        coreLogger.info(`[jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }

      if (m.channel === Processes.showException) {
        coreLogger.error(`${m.data}`);
      }

      // 收到子进程消息，转发到 event
      if (m.channel === Processes.sendToMain) {
        this._eventEmit(m);
      }
    });

    this.child.on('exit', (code: number | null, signal: string | null) => {
      const data = { pid: this.pid };
      this.host.emit(Events.childProcessExit, data);
      coreLogger.info(`[jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    this.child.on('error', (err: Error) => {
      const data = { pid: this.pid };
      this.host.emit(Events.childProcessError, data);
      coreLogger.error(`[jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
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
    // 消息对象
    const mid = getRandomString();
    const msg: JobMessage = {
      mid,
      cmd,
      jobPath,
      jobParams: params,
    };

    // todo 是否会发生监听未完成时，接收不到消息？
    // 发消息到子进程
    this.child.send(msg as Serializable);
  }

  callFunc(jobPath = '', funcName = '', ...params: unknown[]): void {
    const fullPath = getFullpath(jobPath);

    // 消息对象
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
