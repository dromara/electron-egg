export = LoadBalancer;
/**
 * 负载均衡器
 * @intro 参考electron-re项目，并做了一些改动
 * @since 1.0.0
 */
declare class LoadBalancer {
    static Algorithm: {
        polling: string;
        weights: string;
        random: string;
        specify: string;
        weightsPolling: string;
        weightsRandom: string;
        minimumConnection: string;
        weightsMinimumConnection: string;
    };
    /**
      * @param  {Object} options
      * @param  {Array } options.targets [ targets for load balancing calculation: [{id: 1, weight: 1}, {id: 2, weight: 2}] ]
      * @param  {String} options.algorithm
      */
    constructor(options: {
        targets: any[];
        algorithm: string;
    });
    targets: any[];
    algorithm: string;
    params: {
        currentIndex: number;
        weightIndex: number;
        weightTotal: number;
        connectionsMap: {};
        cpuOccupancyMap: {};
        memoryOccupancyMap: {};
    };
    scheduler: Scheduler;
    memoParams: {
        [x: string]: (id: any) => any[];
    };
    /**
     * 算法参数
     */
    memorizedParams(): {
        [x: string]: (id: any) => any[];
    };
    /**
     * 刷新参数
     */
    refreshParams(pidMap: any): void;
    /**
     * 选举出一个进程
     */
    pickOne(...params: any[]): any;
    /**
     * 选举出多个进程
     */
    pickMulti(count?: number, ...params: any[]): any[];
    /**
     * 计算权重
     */
    calculateWeightIndex(): void;
    /**
     * 计算索引
     */
    calculateIndex(): void;
    /**
     * 清除data
     */
    clean(id: any): void;
    /**
     * 添加一个进程信息
     */
    add(task: any): void;
    /**
     * 删除一个进程信息
     */
    del(target: any): void;
    /**
     * 擦除
     */
    wipe(): void;
    /**
     * 更新计算参数
     */
    updateParams(object: any): void;
    /**
     * 设置targets
     */
    setTargets(targets: any): void;
    /**
     * 设置算法
     */
    setAlgorithm: (algorithm: any) => void;
}
import Scheduler = require("./scheduler");
