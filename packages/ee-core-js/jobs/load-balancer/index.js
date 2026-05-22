const Consts = require("./consts");
const Scheduler = require("./scheduler");

/**
 * 负载均衡器
 * @intro 参考electron-re项目，并做了一些改动
 * @since 1.0.0
 */
class LoadBalancer {

  static Algorithm = Consts;

  /**
    * @param  {Object} options
    * @param  {Array } options.targets [ targets for load balancing calculation: [{id: 1, weight: 1}, {id: 2, weight: 2}] ]
    * @param  {String} options.algorithm 
    */
  constructor(options) {
    this.targets = options.targets;
    this.algorithm = options.algorithm || Consts.polling;
    this.params = { // data for algorithm
      currentIndex: 0, // index
      weightIndex: 0, // index for weight alogrithm
      weightTotal: 0, // total weight
      connectionsMap: {}, // connections of each target
      cpuOccupancyMap: {}, // cpu occupancy of each target
      memoryOccupancyMap: {}, // cpu occupancy of each target
    };
    this.scheduler = new Scheduler(this.algorithm);
    this.memoParams = this.memorizedParams();
    this.calculateWeightIndex();
  }

  /**
   * 算法参数
   */
  memorizedParams() {
    return {
      [Consts.random]: () => [],
      [Consts.polling]: () => [this.params.currentIndex, this.params],
      [Consts.weights]: () => [this.params.weightTotal, this.params],
      [Consts.specify]: (id) => [id],
      [Consts.weightsRandom]: () => [this.params.weightTotal],
      [Consts.weightsPolling]: () => [this.params.weightIndex, this.params.weightTotal, this.params],
      [Consts.minimumConnection]: () => [this.params.connectionsMap],
      [Consts.weightsMinimumConnection]: () => [this.params.weightTotal, this.params.connectionsMap, this.params],
    };
  }

  /**
   * 刷新参数
   */
  refreshParams(pidMap) {
    const infos = Object.values(pidMap);
    for (let info of infos) {
      // this.params.connectionsMap[id] = connections;
      this.params.cpuOccupancyMap[info.pid] = info.cpu;
      this.params.memoryOccupancyMap[info.pid] = info.memory;
    }
  }

  /**
   * 选举出一个进程
   */
  pickOne(...params) {
    return this.scheduler.calculate(
      this.targets, this.memoParams[this.algorithm](...params)
    );
  }

  /**
   * 选举出多个进程
   */
  pickMulti(count = 1, ...params) {
    return new Array(count).fill().map(
      () => this.pickOne(...params)
    );
  }

  /**
   * 计算权重
   */
  calculateWeightIndex() {
    this.params.weightTotal = this.targets.reduce((total, cur) => total + (cur.weight || 0), 0);
    if (this.params.weightIndex > this.params.weightTotal) {
      this.params.weightIndex = this.params.weightTotal;
    }
  }

  /**
   * 计算索引
   */
  calculateIndex() {
    if (this.params.currentIndex >= this.targets.length) {
      this.params.currentIndex = (this.params.currentIndex - 1 >= 0) ? (this.params.currentIndex - 1) : 0;
    }
  }

  /**
   * 清除data
   */
  clean(id) {
    if (id) {
      delete this.params.connectionsMap[id];
      delete this.params.cpuOccupancyMap[id];
      delete this.params.memoryOccupancyMap[id];
    } else {
      this.params = {
        currentIndex: 0,
        connectionsMap: {},
        cpuOccupancyMap: {},
        memoryOccupancyMap: {},
      };
    }
  }

  /**
   * 添加一个进程信息
   */
  add(task) {
    if (this.targets.find(target => target.id === task.id)) {
      return console.warn(`Add Operation: the task ${task.id} already exists.`);
    }
    this.targets.push(task);
    this.calculateWeightIndex();
  }

  /**
   * 删除一个进程信息
   */
  del(target) {
    let found = false;
    for (let i  = 0; i < this.targets.length; i++) {
      if (this.targets[i].id === target.id) {
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
   * 擦除
   */
  wipe() {
    this.targets = [];
    this.calculateWeightIndex();
    this.clean();
  }

  /**
   * 更新计算参数
   */
  updateParams(object) {
    Object.entries(object).map(([key, value]) => {
      if (key in this.params) {
        this.params[key] = value;
      }
    });
  }

  /**
   * 设置targets
   */
  setTargets(targets) {
    const targetsMap = targets.reduce((total, cur) => {
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
   * 设置算法
   */
  setAlgorithm = (algorithm) => {
    if (algorithm in Consts) {
      this.algorithm = algorithm;
      this.params.weightIndex = 0;
      this.scheduler.setAlgorithm(this.algorithm);
    } else {
      throw new Error(`Invalid algorithm: ${algorithm}, pick from ${Object.keys(Consts).join('|')}`);
    }
  }
}

module.exports = LoadBalancer;