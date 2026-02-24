const Consts = require("./consts");
const algorithm = require('./algorithm');

/**
 * 算法调度器
 */
class Scheduler {
  constructor(algorithm) {
    this.algorithm = algorithm || Consts.polling;
  }

  /**
   * 计算
   */
  calculate(tasks, params) {
    const results = algorithm[this.algorithm](tasks, ...params);
    return results;
  }

  /**
   * 设置算法
   */
  setAlgorithm = (algorithm) => {
    if (algorithm in Consts) {
      this.algorithm = algorithm;
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(Consts).join('|')}`);
    }
  }
}

module.exports = Scheduler;