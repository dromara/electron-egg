import { EventEmitter } from 'events';
import { LoadBalancer } from '../load-balancer/index.js';
import { getFullpath } from '../../loader/index.js';
import { JobProcess, type JobProcessOptions } from '../child/jobProcess.js';
import { Events } from '../../const/channel.js';
import { validValue } from '../../utils/helper.js';
import { getConfig } from '../../config/index.js';
import type { JobsConfig, ProcessExitEventData } from '../../types/index.js';

export interface ChildPoolOptions {
  weights?: number[];
}

export class ChildPoolJob extends EventEmitter {
  config: JobsConfig;
  boundMap: Map<string | number, number>;
  children: Record<number, JobProcess>;
  min: number;
  max: number;
  strategy: string;
  weights: number[];
  LB: LoadBalancer;

  constructor(opt: ChildPoolOptions = {}) {
    super();
    const options = {
      weights: [] as number[],
      ...opt,
    };

    this.config = { messageLog: false };
    this.boundMap = new Map();
    this.children = {};
    this.min = 3;
    this.max = 6;
    this.strategy = 'polling';
    this.weights = new Array(this.max).fill(0).map((_v, i) => {
      const w = options.weights[i];
      return validValue(w) ? (w as number) : 1;
    });

    const lbOpt = {
      algorithm: LoadBalancer.Algorithm.polling,
      targets: [] as { id: number; weight: number }[],
    };
    this.LB = new LoadBalancer(lbOpt);

    const cfg = getConfig().jobs as JobsConfig | undefined;
    if (cfg) {
      this.config = cfg;
    }

    this._initEvents();
  }

  _initEvents(): void {
    this.on(Events.childProcessExit, (data: ProcessExitEventData) => {
      if (data.pid !== undefined) {
        this._removeChild(data.pid);
      }
    });
    this.on(Events.childProcessError, (data: ProcessExitEventData) => {
      if (data.pid !== undefined) {
        this._removeChild(data.pid);
      }
    });
  }

  _removeChild(pid: number): void {
    const length = Object.keys(this.children).length;
    const lbOpt = {
      id: pid,
      weight: this.weights[length - 1] || 1,
    };
    this.LB.del(lbOpt);
    delete this.children[pid];
  }

  async create(number = 3): Promise<string[]> {
    if (number < 0 || number > this.max) {
      throw new Error('[ee-core] [jobs/child-pool] The number is invalid !');
    }
    const currentNumber = Object.keys(this.children).length;
    if (currentNumber > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number of current processes number: ${currentNumber} is greater than the maximum: ${this.max} !`);
    }

    if (number + currentNumber > this.max) {
      number = this.max - currentNumber;
    }

    const options: JobProcessOptions = {
      processArgs: {
        type: 'childPoolJob',
      },
    };
    for (let i = 1; i <= number; i++) {
      const task = new JobProcess(this, options, this.config);
      this._childCreated(task);
    }

    return Object.keys(this.children);
  }

  // Post creation processing of child processes
  _childCreated(childProcess: JobProcess): void {
    const pid = childProcess.pid;
    if (pid === undefined) return;

    this.children[pid] = childProcess;

    const length = Object.keys(this.children).length;
    const lbTask = {
      id: pid,
      weight: this.weights[length - 1] || 1,
    };
    this.LB.add(lbTask);
  }

  // Execute a job file
  async run(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    const jobPath = getFullpath(filepath);
    const childProcess = await this.getChild();
    childProcess.dispatch('run', jobPath as string, params);

    return childProcess;
  }

  // Asynchronous execution of a job file
  async runPromise(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    return this.run(filepath, params);
  }

  // Get the bound process object
  async getBoundChild(boundId: string | number): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const boundPid = this.boundMap.get(boundId);
    if (boundPid !== undefined) {
      proc = this.children[boundPid];
      if (proc) return proc;
    }

    proc = await this.getChild();
    this.boundMap.set(boundId, proc.pid ?? 0);

    return proc;
  }

  getChildByPid(pid: number): JobProcess | null {
    return this.children[pid] || null;
  }

  async getChild(): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const currentPids = Object.keys(this.children);

    if (currentPids.length === 0) {
      const subIds = await this.create(1);
      const firstId = subIds[0];
      if (firstId) {
        proc = this.children[parseInt(firstId, 10)];
      }
    } else {
      const picked = this.LB.pickOne();
      if (picked && typeof picked.id === 'number') {
        proc = this.children[picked.id];
      }
    }

    if (!proc) {
      throw new Error('[ee-core] [jobs/child-pool] Failed to obtain the child process !');
    }

    return proc;
  }

  getPids(): string[] {
    return Object.keys(this.children);
  }

  killAll(type: 'sequence' | 'parallel' = 'parallel'): void {
    let i = 1;
    Object.keys(this.children).forEach(key => {
      const proc = this.children[parseInt(key, 10)];
      if (proc) {
        if (type === 'sequence') {
          setTimeout(() => {
            proc.kill();
          }, i * 1000);
          i++;
        } else {
          proc.kill();
        }
      }
    });
  }
}
