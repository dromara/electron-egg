/**
 * @module jobs/child/jobProcess
 * @description Child process manager. Encapsulates child_process.fork() creation and communication logic,
 * providing the main process with the ability to create child processes, send messages, and terminate processes.
 *
 * Communication mechanism:
 * - Main process sends JobMessage to child process via child.send()
 * - Child process sends ProcessMessage to main process via process.send()
 * - Messages are categorized by channel: showException (exception), sendToMain (business message)
 * - Messages are dispatched by eventReceiver: childJob (global), forkProcess (per-process), all (both)
 */
import path from 'path';
import { EventEmitter } from 'events';
import { fork, type ChildProcess, type Serializable, type ForkOptions } from 'child_process';
import serialize from 'serialize-javascript';
import { coreLogger } from '../../log/index.js';
import { getBaseDir, isPackaged, allEnv } from '../../ps/index.js';
import { getConfig } from '../../config/index.js';
import { Processes, Events, Receiver } from '../../const/channel.js';
import { getRandomString } from '../../utils/helper.js';
import { getFullpath } from '../../loader/index.js';
import { extend } from '../../utils/extend.js';
import type { JobsConfig, MessageData, ProcessExitEventData } from '../../types/index.js';

/** Options when creating a JobProcess */
export interface JobProcessOptions {
  /** Arguments object passed to the child process */
  processArgs?: Record<string, unknown>;
  /** Fork options (cwd, env, stdio, etc.) */
  processOptions?: ForkOptions;
}

/** Message format: Main process -> Child process */
export interface JobMessage {
  /** Message ID */
  mid: string;
  /** Command (e.g. 'run') */
  cmd: string;
  /** Task file path */
  jobPath?: string;
  /** Task constructor arguments */
  jobParams?: unknown[];
  /** Instance method name to call */
  jobFunc?: string;
  /** Instance method arguments */
  jobFuncParams?: unknown[];
}

/** Message format: Child process -> Main process */
export interface ProcessMessage extends MessageData {
  /** Message receiver type */
  eventReceiver: string;
}

/**
 * JobProcess - Child process manager
 *
 * Encapsulates the complete logic of forking a child process:
 * 1. Determine app.js entry path (child process entry within node_modules/ee-core)
 * 2. Configure working directory and environment variables
 * 3. Fork the child process and register event listeners
 * 4. Provide dispatch() and callFunc() for sending messages
 * 5. Provide kill() for terminating the process
 */
export class JobProcess {
  /** In-process event emitter (forkProcess-level messages) */
  emitter: EventEmitter;
  /** Host event emitter (ChildJob/ChildPoolJob, childJob-level messages) */
  host: EventEmitter;
  /** Arguments array passed to the child process */
  args: string[];
  /** Whether the child process is in a sleeping state */
  sleeping: boolean;
  /** Child process object returned by child_process.fork() */
  child: ChildProcess;
  /** Child process PID */
  pid: number | undefined;
  /** Task configuration */
  config: JobsConfig;

  constructor(host: EventEmitter, opt: JobProcessOptions = {}, config: JobsConfig = { messageLog: false }) {
    let cwd = getBaseDir();
    // Locate app.js entry: child process startup file within the ee-core package
    const currentFilePath = typeof __filename !== 'undefined' ? __filename : '';
    const appPath = path.join(path.dirname(currentFilePath), 'app.js');
    // After packaging, cwd must be outside app.asar (child processes need access to node_modules)
    if (isPackaged()) {
      cwd = path.join(getBaseDir(), '..');
    }

    const defaultOptions: JobProcessOptions = {
      processArgs: {
        type: 'childJob',
        // Pass main process config to child process so it doesn't need to load from filesystem
        eeConfig: getConfig(),
      },
      processOptions: {
        cwd,
        env: allEnv(),
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'] as ForkOptions['stdio'],
      },
    };

    const options = extend(
      true,
      defaultOptions,
      opt,
    ) as JobProcessOptions;

    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;
    this.config = config;

    // Serialize arguments and pass them to the child process
    this.args.push(JSON.stringify(options.processArgs));

    this.child = fork(appPath, this.args, options.processOptions ?? {});
    this.pid = this.child.pid;
    this._init();
  }

  /**
   * Initialize child process event listeners
   *
   * Listens for three types of events:
   * - message: Process messages from the child process (exception display, business message forwarding)
   * - exit: Child process exited, notify host to clean up
   * - error: Child process error, notify host to clean up
   */
  _init(): void {
    const { messageLog } = this.config;
    this.child.on('message', (m: ProcessMessage) => {
      if (messageLog) {
        coreLogger.info(`[jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }

      // Exception message: log it
      if (m.channel === Processes.showException) {
        coreLogger.error(`${m.data}`);
      }

      // Business message: dispatch based on eventReceiver
      if (m.channel === Processes.sendToMain) {
        this._eventEmit(m);
      }
    });

    // Capture child process stdout/stderr for debugging
    const stdout = this.child.stdout;
    const stderr = this.child.stderr;
    if (stdout) {
      stdout.on('data', (data: Buffer) => {
        coreLogger.info(`[jobs/child] stdout: ${data.toString().trim()}`);
      });
    }
    if (stderr) {
      stderr.on('data', (data: Buffer) => {
        coreLogger.error(`[jobs/child] stderr: ${data.toString().trim()}`);
      });
    }

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
   * Dispatch messages to different event emitters based on eventReceiver
   *
   * - forkProcess: send only to in-process emitter
   * - childJob: send only to host emitter
   * - all / others: send to both
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
   * Send a dispatch message to the child process
   *
   * @param cmd - Command (e.g. 'run')
   * @param jobPath - Task file path
   * @param params - Task parameters
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
   * Call a specified method on the task instance in the child process
   *
   * Resolves the task file path, then sends a run command with the specified function name.
   *
   * @param jobPath - Task file path (relative paths are resolved to absolute paths)
   * @param funcName - Method name to call
   * @param params - Method arguments
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
   * Terminate the child process
   *
   * First sends SIGINT for graceful exit, then sends SIGKILL to force termination after timeout.
   *
   * @param timeout - Timeout in milliseconds to wait for graceful exit
   */
  kill(timeout = 1000): void {
    this.child.kill('SIGINT');
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill('SIGKILL');
    }, timeout);
  }
}
