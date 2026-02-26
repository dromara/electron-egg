import Consts from "./consts";
import * as algorithm from './algorithm';

/**
 * 算法调度器
 */
class Scheduler {
  private algorithm: string;

  constructor(algorithm: string) {
    this.algorithm = algorithm || Consts.polling;
  }

  /**
   * 计算
   */
  calculate(tasks: any[], params: any[]) {
    const results = algorithm[this.algorithm](tasks, ...params);
    return results;
  }

  /**
   * 设置算法
   */
  setAlgorithm = (algorithm: string) => {
    if (algorithm in Consts) {
      this.algorithm = algorithm;
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(Consts).join('|')}`);
    }
  }
}

export default Scheduler;
