/**
 * @module jobs/child/jobProcess
 * @description 子进程管理器。封装 child_process.fork() 的创建和通信逻辑，
 * 为主进程提供创建子进程、发送消息、终止进程的能力。
 *
 * 通信机制：
 * - 主进程通过 child.send() 发送 JobMessage 到子进程
 * - 子进程通过 process.send() 发送 ProcessMessage 到主进程
 * - 消息按 channel 分类：showException（异常）、sendToMain（业务消息）
 * - 消息按 eventReceiver 分发：childJob（全局）、forkProcess（进程内）、all（两者都发）
 */
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
import type { JobsConfig, MessageData, ProcessExitEventData } from '../../types/index.js';

/** 创建 JobProcess 时的选项 */
export interface JobProcessOptions {
  /** 传递给子进程的参数对象 */
  processArgs?: Record<string, unknown>;
  /** fork 选项（cwd、env、stdio 等） */
  processOptions?: ForkOptions;
}

/** 主进程 → 子进程的消息格式 */
export interface JobMessage {
  /** 消息 ID */
  mid: string;
  /** 命令（如 'run'） */
  cmd: string;
  /** 任务文件路径 */
  jobPath?: string;
  /** 任务构造函数参数 */
  jobParams?: unknown[];
  /** 要调用的实例方法名 */
  jobFunc?: string;
  /** 实例方法参数 */
  jobFuncParams?: unknown[];
}

/** 子进程 → 主进程的消息格式 */
export interface ProcessMessage extends MessageData {
  /** 消息接收者类型 */
  eventReceiver: string;
}

/**
 * JobProcess 子进程管理器
 *
 * 封装了 fork 创建子进程的完整逻辑：
 * 1. 确定 app.js 入口路径（node_modules/ee-core 中的子进程入口）
 * 2. 配置工作目录和环境变量
 * 3. fork 子进程并注册事件监听
 * 4. 提供 dispatch() 和 callFunc() 发送消息
 * 5. 提供 kill() 终止进程
 */
export class JobProcess {
  /** 进程内事件发射器（forkProcess 级别消息） */
  emitter: EventEmitter;
  /** 宿主事件发射器（ChildJob/ChildPoolJob，childJob 级别消息） */
  host: EventEmitter;
  /** 传递给子进程的参数数组 */
  args: string[];
  /** 子进程是否处于休眠状态 */
  sleeping: boolean;
  /** child_process.fork() 返回的子进程对象 */
  child: ChildProcess;
  /** 子进程 PID */
  pid: number | undefined;
  /** 任务配置 */
  config: JobsConfig;

  constructor(host: EventEmitter, opt: JobProcessOptions = {}, config: JobsConfig = { messageLog: false }) {
    let cwd = getBaseDir();
    // 定位 app.js 入口：ee-core 包内的子进程启动文件
    const currentFilePath = typeof __filename !== 'undefined' ? __filename : '';
    const appPath = path.join(path.dirname(currentFilePath), 'app.js');
    // 打包后 cwd 需要在 app.asar 外（子进程需要访问 node_modules）
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

    const options = extend(
      true,
      defaultOptions as unknown as Record<string, unknown>,
      opt as unknown as Record<string, unknown>,
    ) as unknown as JobProcessOptions;

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;
    this.config = config;

    // 将参数序列化后传递给子进程
    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions ?? {});
    this.pid = this.child.pid;
    this._init();
  }

  /**
   * 初始化子进程事件监听
   *
   * 监听三种事件：
   * - message：处理子进程发来的消息（异常展示、业务消息转发）
   * - exit：子进程退出，通知宿主清理
   * - error：子进程错误，通知宿主清理
   */
  _init(): void {
    const { messageLog } = this.config;
    this.child.on('message', (m: ProcessMessage) => {
      if (messageLog) {
        coreLogger.info(`[jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }

      // 异常消息：记录到日志
      if (m.channel === Processes.showException) {
        coreLogger.error(`${m.data}`);
      }

      // 业务消息：根据 eventReceiver 分发
      if (m.channel === Processes.sendToMain) {
        this._eventEmit(m);
      }
    });

    this.child.on('exit', (code: number | null, signal: string | null) => {
      const data: ProcessExitEventData = { pid: this.pid };
      this.host.emit(Events.childProcessExit, data);
      coreLogger.info(`[jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });

    this.child.on('error', (err: Error) => {
      const data: ProcessExitEventData = { pid: this.pid };
      this.host.emit(Events.childProcessError, data);
      coreLogger.error(`[jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
    });
  }

  /**
   * 根据 eventReceiver 分发消息到不同的事件发射器
   *
   * - forkProcess：仅发送到进程内 emitter
   * - childJob：仅发送到宿主 host
   * - all / 其他：同时发送到两者
   */
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

  /**
   * 向子进程发送调度消息
   *
   * @param cmd - 命令（如 'run'）
   * @param jobPath - 任务文件路径
   * @param params - 任务参数
   */
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

  /**
   * 调用子进程中任务实例的指定方法
   *
   * 解析任务文件路径后，发送 run 命令指定函数名。
   *
   * @param jobPath - 任务文件路径（相对路径会被解析为绝对路径）
   * @param funcName - 要调用的方法名
   * @param params - 方法参数
   */
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

  /**
   * 终止子进程
   *
   * 先发送 SIGINT 尝试优雅退出，超时后发送 SIGKILL 强制终止。
   *
   * @param timeout - 等待优雅退出的超时时间（毫秒）
   */
  kill(timeout = 1000): void {
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout);
  }
}
