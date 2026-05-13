export = Scheduler;
/**
 * 算法调度器
 */
declare class Scheduler {
    constructor(algorithm: any);
    algorithm: any;
    /**
     * 计算
     */
    calculate(tasks: any, params: any): any;
    /**
     * 设置算法
     */
    setAlgorithm: (algorithm: any) => void;
}
