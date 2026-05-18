import { EventEmitter } from 'events';
import { JobProcess, type JobProcessOptions } from './jobProcess.js';
import { getFullpath } from '../../loader/index.js';
import { Events } from '../../const/channel.js';
import { getConfig } from '../../config/index.js';
import type { JobsConfig } from '../../types/index.js';

export class ChildJob extends EventEmitter {
  jobs: Record<number, JobProcess>;
  config: JobsConfig;

  constructor() {
    super();
    this.jobs = {};
    this.config = { messageLog: false };

    const cfg = getConfig().jobs as JobsConfig | undefined;
    if (cfg) {
      this.config = cfg;
    }

    this._initEvents();
  }

  /**
   * 初始化监听
   */
  _initEvents(): void {
    this.on(Events.childProcessExit, (data: { pid: number | undefined }) => {
      if (data.pid !== undefined) {
        delete this.jobs[data.pid];
      }
    });
    this.on(Events.childProcessError, (data: { pid: number | undefined }) => {
      if (data.pid !== undefined) {
        delete this.jobs[data.pid];
      }
    });
  }

  /**
   * 执行一个job文件
   */
  exec(filepath: string, params: Record<string, unknown> = {}, opt: JobProcessOptions = {}): JobProcess {
    const jobPath = getFullpath(filepath);
    const proc = this.createProcess(opt);
    const cmd = 'run';
    proc.dispatch(cmd, jobPath as string, params);

    return proc;
  }

  /**
   * 创建子进程
   */
  createProcess(opt: JobProcessOptions = {}): JobProcess {
    const options: JobProcessOptions = {
      processArgs: {
        type: 'childJob',
      },
      ...opt,
    };
    const proc = new JobProcess(this, options, this.config);
    if (!proc) {
      throw new Error('[ee-core] [jobs/child] Failed to obtain the child process !');
    }
    if (proc.pid !== undefined) {
      this.jobs[proc.pid] = proc;
    }

    return proc;
  }

  /**
   * 获取当前pids
   */
  getPids(): string[] {
    return Object.keys(this.jobs);
  }

  /**
   * 异步执行一个job文件
   */
  async execPromise(filepath: string, params: Record<string, unknown> = {}, opt: JobProcessOptions = {}): Promise<JobProcess> {
    return this.exec(filepath, params, opt);
  }
}
