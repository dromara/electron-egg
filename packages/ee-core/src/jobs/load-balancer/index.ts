import { AlgorithmType } from './consts.js';
import { Scheduler } from './scheduler.js';
import type { LoadBalancerTarget, LoadBalancerParams, LoadBalancerOptions, PidInfo } from './types.js';

/**
 * Load Balancer
 * @intro Based on the electron-re project with some modifications
 * @since 1.0.0
 */
export class LoadBalancer {
  static Algorithm = AlgorithmType;

  targets: LoadBalancerTarget[];
  algorithm: string;
  params: LoadBalancerParams;
  scheduler: Scheduler;
  memoParams: Record<string, (...args: unknown[]) => unknown[]>;

  /**
   * @param options - Configuration options
   * @param options.targets - Load balancing target list [{id: 1, weight: 1}, {id: 2, weight: 2}]
   * @param options.algorithm - Algorithm name
   */
  constructor(options: LoadBalancerOptions) {
    this.targets = options.targets;
    this.algorithm = options.algorithm || AlgorithmType.polling;
    this.params = {
      currentIndex: 0,
      weightIndex: 0,
      weightTotal: 0,
      connectionsMap: {},
      cpuOccupancyMap: {},
      memoryOccupancyMap: {},
    };
    this.scheduler = new Scheduler(this.algorithm);
    this.memoParams = this.memorizedParams();
    this.calculateWeightIndex();
  }

  /**
   * Algorithm parameters
   */
  memorizedParams(): Record<string, (...args: unknown[]) => unknown[]> {
    return {
      [AlgorithmType.random]: () => [],
      [AlgorithmType.polling]: () => [this.params.currentIndex, this.params],
      [AlgorithmType.weights]: () => [this.params.weightTotal, this.params],
      [AlgorithmType.specify]: (id: unknown) => [id],
      [AlgorithmType.weightsRandom]: () => [this.params.weightTotal],
      [AlgorithmType.weightsPolling]: () => [this.params.weightIndex, this.params.weightTotal, this.params],
      [AlgorithmType.minimumConnection]: () => [this.params.connectionsMap],
      [AlgorithmType.weightsMinimumConnection]: () => [this.params.weightTotal, this.params.connectionsMap, this.params],
    };
  }

  /**
   * Refresh parameters
   */
  refreshParams(pidMap: Record<string | number, PidInfo>): void {
    const infos = Object.values(pidMap);
    for (const info of infos) {
      this.params.cpuOccupancyMap[info.pid] = info.cpu;
      this.params.memoryOccupancyMap[info.pid] = info.memory;
    }
  }

  /**
   * Elect a single process
   */
  pickOne(...params: unknown[]): LoadBalancerTarget | null {
    const memoFn = this.memoParams[this.algorithm];
    if (!memoFn) {
      throw new Error(`No memoized params function for algorithm: ${this.algorithm}`);
    }
    return this.scheduler.calculate(
      this.targets,
      memoFn(...params)
    );
  }

  /**
   * Elect multiple processes
   */
  pickMulti(count = 1, ...params: unknown[]): (LoadBalancerTarget | null)[] {
    return new Array(count).fill(null).map(() => this.pickOne(...params));
  }

  /**
   * Calculate weights
   */
  calculateWeightIndex(): void {
    this.params.weightTotal = this.targets.reduce((total, cur) => total + (cur.weight || 0), 0);
    if (this.params.weightIndex > this.params.weightTotal) {
      this.params.weightIndex = this.params.weightTotal;
    }
  }

  /**
   * Calculate index
   */
  calculateIndex(): void {
    if (this.params.currentIndex >= this.targets.length) {
      this.params.currentIndex = this.params.currentIndex - 1 >= 0 ? this.params.currentIndex - 1 : 0;
    }
  }

  /**
   * Clean data
   */
  clean(id?: string | number): void {
    if (id !== undefined) {
      delete this.params.connectionsMap[id];
      delete this.params.cpuOccupancyMap[id];
      delete this.params.memoryOccupancyMap[id];
    } else {
      this.params = {
        currentIndex: 0,
        weightIndex: this.params.weightIndex,
        weightTotal: this.params.weightTotal,
        connectionsMap: {},
        cpuOccupancyMap: {},
        memoryOccupancyMap: {},
      };
    }
  }

  /**
   * Add a process entry
   */
  add(task: LoadBalancerTarget): void {
    if (this.targets.find(target => target.id === task.id)) {
      console.warn(`Add Operation: the task ${task.id} already exists.`);
      return;
    }
    this.targets.push(task);
    this.calculateWeightIndex();
  }

  /**
   * Delete a process entry
   */
  del(target: LoadBalancerTarget): void {
    let found = false;
    for (let i = 0; i < this.targets.length; i++) {
      const t = this.targets[i];
      if (t && t.id === target.id) {
        this.targets.splice(i, 1);
        this.clean(target.id);
        this.calculateIndex();
        found = true;
        break;
      }
    }

    if (found) {
      this.calculateWeightIndex();
    } else {
      console.warn(`Del Operation: the task ${target.id} is not found.`, this.targets);
    }
  }

  /**
   * Wipe all data
   */
  wipe(): void {
    this.targets = [];
    this.calculateWeightIndex();
    this.clean();
  }

  /**
   * Update calculation parameters
   */
  updateParams(object: Partial<LoadBalancerParams>): void {
    Object.entries(object).forEach(([key, value]) => {
      if (key in this.params) {
        (this.params as unknown as Record<string, unknown>)[key] = value;
      }
    });
  }

  /**
   * Set targets
   */
  setTargets(targets: LoadBalancerTarget[]): void {
    const targetsMap = targets.reduce<Record<string | number, number>>((total, cur) => {
      total[cur.id] = 1;
      return total;
    }, {});
    this.targets.forEach(target => {
      if (!(target.id in targetsMap)) {
        this.clean(target.id);
        this.calculateIndex();
      }
    });
    this.targets = targets;
    this.calculateWeightIndex();
  }

  /**
   * Set algorithm
   */
  setAlgorithm(algorithm: string): void {
    if (algorithm in AlgorithmType) {
      this.algorithm = algorithm;
      this.params.weightIndex = 0;
      this.scheduler.setAlgorithm(this.algorithm);
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(AlgorithmType).join('|')}`);
    }
  }
}

export default LoadBalancer;
