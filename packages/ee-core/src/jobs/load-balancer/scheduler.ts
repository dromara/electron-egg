import { AlgorithmType } from './consts.js';
import algorithms from './algorithm/index.js';
import type { AlgorithmFn } from './algorithm/index.js';
import type { LoadBalancerTarget } from './types.js';

/**
 * Algorithm scheduler
 */
export class Scheduler {
  private algorithm: string;

  constructor(algorithm?: string) {
    this.algorithm = algorithm || AlgorithmType.polling;
  }

  /**
   * Calculate
   */
  calculate(tasks: LoadBalancerTarget[], params: unknown[]): LoadBalancerTarget | null {
    const algo = algorithms[this.algorithm] as AlgorithmFn;
    return algo(tasks, ...params);
  }

  /**
   * Set algorithm
   */
  setAlgorithm(algorithm: string): void {
    if (algorithm in AlgorithmType) {
      this.algorithm = algorithm;
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(AlgorithmType).join('|')}`);
    }
  }
}
