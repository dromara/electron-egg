import { AlgorithmType } from './consts.js';
import algorithms from './algorithm/index.js';
import type { AlgorithmFn } from './algorithm/index.js';
import type { LoadBalancerTarget } from './types.js';

/**
 * 算法调度器
 */
export class Scheduler {
  private algorithm: string;

  constructor(algorithm?: string) {
    this.algorithm = algorithm || AlgorithmType.polling;
  }

  /**
   * 计算
   */
  calculate(tasks: LoadBalancerTarget[], params: unknown[]): LoadBalancerTarget | null {
    const algo = algorithms[this.algorithm] as AlgorithmFn;
    return algo(tasks, ...params);
  }

  /**
   * 设置算法
   */
  setAlgorithm(algorithm: string): void {
    if (algorithm in AlgorithmType) {
      this.algorithm = algorithm;
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(AlgorithmType).join('|')}`);
    }
  }
}
