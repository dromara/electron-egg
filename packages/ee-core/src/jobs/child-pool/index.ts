/**
 * @module jobs/child-pool
 * @description Child process pool manager. Maintains a set of child processes, distributes tasks
 * through a load balancing algorithm, avoiding the overhead of frequent process creation and destruction.
 *
 * Core features:
 * - Pool size: min=3, max=6, configurable
 * - Load balancing: supports multiple algorithms (polling/weights/random, etc.), default is polling
 * - Process binding: binds specific IDs to fixed processes via boundMap (e.g. session binding)
 * - Auto cleanup: child processes are automatically removed from the pool on exit/error
 *
 * Usage:
 * ```ts
 * const pool = new ChildPoolJob();
 * await pool.create(3); // Create 3 child processes
 * await pool.run('service/job'); // Load balancer selects a process to execute
 * ```
 */
import { EventEmitter } from 'events';
import { LoadBalancer } from '../load-balancer/index.js';
import { getFullpath } from '../../loader/index.js';
import { JobProcess, type JobProcessOptions } from '../child/jobProcess.js';
import { Events } from '../../const/channel.js';
import { validValue } from '../../utils/helper.js';
import { getConfig } from '../../config/index.js';
import type { JobsConfig, ProcessExitEventData } from '../../types/index.js';

/** Child process pool options */
export interface ChildPoolOptions {
  /** Weight values for each process (used by weighted load balancing algorithms) */
  weights?: number[];
}

/**
 * ChildPoolJob - Child process pool
 *
 * Manages a set of child processes, distributes tasks through LoadBalancer.
 * Inherits EventEmitter, listens for child process exit/error events for auto cleanup.
 */
export class ChildPoolJob extends EventEmitter {
  /** Task configuration */
  config: JobsConfig;
  /** Binding map: boundId -> pid (binds specific IDs to fixed processes) */
  boundMap: Map<string | number, number>;
  /** Child process pool: pid -> JobProcess */
  children: Record<number, JobProcess>;
  /** Minimum number of processes */
  min: number;
  /** Maximum number of processes */
  max: number;
  /** Load balancing strategy name */
  strategy: string;
  /** Weight array for each process */
  weights: number[];
  /** Load balancer instance */
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
    // Default weight is 1, can be customized via configuration
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

  /**
   * Initialize event listeners
   *
   * Automatically removes child processes from the pool and load balancer on exit or error.
   */
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

  /**
   * Remove a child process from the pool
   *
   * Removes from both children map and load balancer.
   */
  _removeChild(pid: number): void {
    const length = Object.keys(this.children).length;
    const lbOpt = {
      id: pid,
      weight: this.weights[length - 1] || 1,
    };
    this.LB.del(lbOpt);
    delete this.children[pid];
  }

  /**
   * Create a specified number of child processes
   *
   * New processes are added to the pool and load balancer.
   * The count is limited by max; excess processes will not be created.
   *
   * @param number - Number of processes to create
   * @returns List of all process PIDs after creation
   * @throws Throws an error if the count is invalid or exceeds the maximum limit
   */
  async create(number = 3): Promise<string[]> {
    if (number < 0 || number > this.max) {
      throw new Error('[ee-core] [jobs/child-pool] The number is invalid !');
    }
    const currentNumber = Object.keys(this.children).length;
    if (currentNumber > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number of current processes number: ${currentNumber} is greater than the maximum: ${this.max} !`);
    }

    // Adjust creation count to not exceed maximum limit
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

  /**
   * Registration handling after child process creation
   *
   * Adds the process to the children map and load balancer.
   */
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

  /**
   * Execute a task file
   *
   * Selects a child process via the load balancer and sends a run command to execute the task.
   *
   * @param filepath - Task file path
   * @param params - Task parameters
   * @returns The child process instance executing the task
   */
  async run(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    const jobPath = getFullpath(filepath);
    const childProcess = await this.getChild();
    childProcess.dispatch('run', jobPath as string, params);

    return childProcess;
  }

  /**
   * Asynchronously execute a task file (alias for run)
   */
  async runPromise(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    return this.run(filepath, params);
  }

  /**
   * Get a bound child process
   *
   * The same boundId is always assigned to the same child process, suitable for session binding scenarios.
   * If the bound process no longer exists, a new process is reassigned.
   *
   * @param boundId - Binding identifier (e.g. user ID, session ID)
   * @returns Child process instance
   */
  async getBoundChild(boundId: string | number): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const boundPid = this.boundMap.get(boundId);
    if (boundPid !== undefined) {
      proc = this.children[boundPid];
      if (proc) return proc;
    }

    // Bound process does not exist, retrieve and bind a new one
    proc = await this.getChild();
    this.boundMap.set(boundId, proc.pid ?? 0);

    return proc;
  }

  /** Get a child process by PID */
  getChildByPid(pid: number): JobProcess | null {
    return this.children[pid] || null;
  }

  /**
   * Get an available child process
   *
   * If the pool is empty, automatically creates one.
   * Uses the load balancer to select a process.
   *
   * @returns Child process instance
   * @throws Throws an error if retrieval fails
   */
  async getChild(): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const currentPids = Object.keys(this.children);

    if (currentPids.length === 0) {
      // Pool is empty, auto-create
      const subIds = await this.create(1);
      const firstId = subIds[0];
      if (firstId) {
        proc = this.children[parseInt(firstId, 10)];
      }
    } else {
      // Select via load balancer
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

  /** Get PID list of all child processes */
  getPids(): string[] {
    return Object.keys(this.children);
  }

  /**
   * Kill all child processes
   *
   * @param type - Kill mode: 'parallel' kills all at once, 'sequence' kills one per second
   */
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
