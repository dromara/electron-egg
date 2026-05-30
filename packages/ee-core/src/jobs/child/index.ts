import { EventEmitter } from 'events';
import { JobProcess, type JobProcessOptions } from './jobProcess.js';
import { getFullpath } from '../../loader/index.js';
import { Events } from '../../const/channel.js';
import { getConfig } from '../../config/index.js';
import type { JobsConfig, ProcessExitEventData } from '../../types/index.js';

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
   * Initialize event listeners
   */
  _initEvents(): void {
    this.on(Events.childProcessExit, (data: ProcessExitEventData) => {
      if (data.pid !== undefined) {
        delete this.jobs[data.pid];
      }
    });
    this.on(Events.childProcessError, (data: ProcessExitEventData) => {
      if (data.pid !== undefined) {
        delete this.jobs[data.pid];
      }
    });
  }

  /**
   * Execute a job file
   */
  exec(filepath: string, params: Record<string, unknown> = {}, opt: JobProcessOptions = {}): JobProcess {
    const jobPath = getFullpath(filepath);
    const proc = this.createProcess(opt);
    const cmd = 'run';
    proc.dispatch(cmd, jobPath as string, params);

    return proc;
  }

  /**
   * Create a child process
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
   * Get current PIDs
   */
  getPids(): string[] {
    return Object.keys(this.jobs);
  }

  /**
   * Asynchronously execute a job file
   */
  async execPromise(filepath: string, params: Record<string, unknown> = {}, opt: JobProcessOptions = {}): Promise<JobProcess> {
    return this.exec(filepath, params, opt);
  }
}
