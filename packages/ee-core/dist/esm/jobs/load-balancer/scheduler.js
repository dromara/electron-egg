import Consts from "./consts";
import * as algorithm from "./algorithm";
class Scheduler {
  constructor(algorithm2) {
    /**
     * 设置算法
     */
    this.setAlgorithm = (algorithm2) => {
      if (algorithm2 in Consts) {
        this.algorithm = algorithm2;
      } else {
        throw new Error(`Invalid algorithm: ${algorithm2}, pick from ${Object.keys(Consts).join("|")}`);
      }
    };
    this.algorithm = algorithm2 || Consts.polling;
  }
  /**
   * 计算
   */
  calculate(tasks, params) {
    const results = algorithm[this.algorithm](tasks, ...params);
    return results;
  }
}
var scheduler_default = Scheduler;
export {
  scheduler_default as default
};
