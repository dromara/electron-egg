/**
 * @module jobs/child-pool
 * @description 子进程池管理器。维护一组子进程，通过负载均衡算法分配任务，
 * 避免频繁创建和销毁进程的开销。
 *
 * 核心特性：
 * - 进程池大小：min=3, max=6，可配置
 * - 负载均衡：支持多种算法（polling/weights/random 等），默认 polling
 * - 进程绑定：通过 boundMap 将特定 ID 绑定到固定进程（如会话绑定）
 * - 自动清理：子进程退出/错误时自动从池中移除
 *
 * 使用方式：
 * ```ts
 * const pool = new ChildPoolJob();
 * await pool.create(3); // 创建 3 个子进程
 * await pool.run('service/job'); // 负载均衡选择进程执行
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

/** 子进程池选项 */
export interface ChildPoolOptions {
  /** 各进程的权重值（用于权重负载均衡算法） */
  weights?: number[];
}

/**
 * ChildPoolJob 子进程池
 *
 * 管理一组子进程，通过 LoadBalancer 分配任务。
 * 继承 EventEmitter，监听子进程退出/错误事件自动清理。
 */
export class ChildPoolJob extends EventEmitter {
  /** 任务配置 */
  config: JobsConfig;
  /** 绑定映射：boundId → pid（将特定 ID 绑定到固定进程） */
  boundMap: Map<string | number, number>;
  /** 子进程池：pid → JobProcess */
  children: Record<number, JobProcess>;
  /** 最小进程数 */
  min: number;
  /** 最大进程数 */
  max: number;
  /** 负载均衡策略名称 */
  strategy: string;
  /** 各进程的权重数组 */
  weights: number[];
  /** 负载均衡器实例 */
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
    // 默认权重为 1，可通过配置自定义
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
   * 初始化事件监听
   *
   * 子进程退出或错误时，自动从进程池和负载均衡器中移除。
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
   * 从池中移除子进程
   *
   * 同时从 children 和负载均衡器中删除。
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
   * 创建指定数量的子进程
   *
   * 新进程会被添加到进程池和负载均衡器。
   * 数量受 max 限制，超出部分不会创建。
   *
   * @param number - 要创建的进程数量
   * @returns 创建后的所有进程 pid 列表
   * @throws 数量无效或超出最大限制时抛出错误
   */
  async create(number = 3): Promise<string[]> {
    if (number < 0 || number > this.max) {
      throw new Error('[ee-core] [jobs/child-pool] The number is invalid !');
    }
    const currentNumber = Object.keys(this.children).length;
    if (currentNumber > this.max) {
      throw new Error(`[ee-core] [jobs/child-pool] The number of current processes number: ${currentNumber} is greater than the maximum: ${this.max} !`);
    }

    // 调整创建数量，不超过最大限制
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
   * 子进程创建后的注册处理
   *
   * 将进程添加到 children 和负载均衡器。
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
   * 执行任务文件
   *
   * 通过负载均衡器选择一个子进程，发送 run 命令执行任务。
   *
   * @param filepath - 任务文件路径
   * @param params - 任务参数
   * @returns 执行任务的子进程实例
   */
  async run(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    const jobPath = getFullpath(filepath);
    const childProcess = await this.getChild();
    childProcess.dispatch('run', jobPath as string, params);

    return childProcess;
  }

  /**
   * 异步执行任务文件（run 的别名）
   */
  async runPromise(filepath: string, params: Record<string, unknown> = {}): Promise<JobProcess> {
    return this.run(filepath, params);
  }

  /**
   * 获取绑定的子进程
   *
   * 同一 boundId 始终分配到同一子进程，适用于会话绑定场景。
   * 若绑定的进程已不存在，重新分配新进程。
   *
   * @param boundId - 绑定标识（如用户 ID、会话 ID）
   * @returns 子进程实例
   */
  async getBoundChild(boundId: string | number): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const boundPid = this.boundMap.get(boundId);
    if (boundPid !== undefined) {
      proc = this.children[boundPid];
      if (proc) return proc;
    }

    // 绑定进程不存在，重新获取并绑定
    proc = await this.getChild();
    this.boundMap.set(boundId, proc.pid ?? 0);

    return proc;
  }

  /** 按 PID 获取子进程 */
  getChildByPid(pid: number): JobProcess | null {
    return this.children[pid] || null;
  }

  /**
   * 获取一个可用的子进程
   *
   * 若池中无进程，自动创建一个。
   * 使用负载均衡器选择进程。
   *
   * @returns 子进程实例
   * @throws 获取失败时抛出错误
   */
  async getChild(): Promise<JobProcess> {
    let proc: JobProcess | undefined;
    const currentPids = Object.keys(this.children);

    if (currentPids.length === 0) {
      // 池中无进程，自动创建
      const subIds = await this.create(1);
      const firstId = subIds[0];
      if (firstId) {
        proc = this.children[parseInt(firstId, 10)];
      }
    } else {
      // 通过负载均衡器选择
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

  /** 获取所有子进程的 pid 列表 */
  getPids(): string[] {
    return Object.keys(this.children);
  }

  /**
   * 终止所有子进程
   *
   * @param type - 终止方式：'parallel' 同时终止，'sequence' 间隔 1 秒依次终止
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
