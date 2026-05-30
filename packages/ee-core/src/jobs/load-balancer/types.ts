/**
 * @module jobs/load-balancer/types
 * @description 负载均衡器相关类型定义。
 */

/** 负载均衡目标（子进程） */
export interface LoadBalancerTarget {
  /** 目标标识（通常是子进程 PID） */
  id: string | number;
  /** 权重值（用于加权算法） */
  weight?: number;
}

/** 负载均衡器运行时参数 */
export interface LoadBalancerParams {
  /** 当前轮询索引 */
  currentIndex: number;
  /** 当前权重索引（加权轮询用） */
  weightIndex: number;
  /** 所有权重总和 */
  weightTotal: number;
  /** 连接数映射：pid → 当前连接数 */
  connectionsMap: Record<string | number, number>;
  /** CPU 占用率映射：pid → CPU 使用率 */
  cpuOccupancyMap: Record<string | number, number>;
  /** 内存占用映射：pid → 内存使用量 */
  memoryOccupancyMap: Record<string | number, number>;
}

/** 负载均衡器配置选项 */
export interface LoadBalancerOptions {
  /** 目标列表 */
  targets: LoadBalancerTarget[];
  /** 算法名称（默认 polling） */
  algorithm?: string;
}

/** 进程信息（CPU/内存） */
export interface PidInfo {
  /** 进程 ID */
  pid: string | number;
  /** CPU 使用率 */
  cpu: number;
  /** 内存使用量 */
  memory: number;
}
