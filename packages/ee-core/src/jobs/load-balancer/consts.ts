/**
 * @module jobs/load-balancer/consts
 * @description 负载均衡算法类型常量。
 *
 * 支持的算法：
 * - polling：轮询，依次选择
 * - weights：加权，按权重选择
 * - random：随机选择
 * - specify：指定 ID 选择
 * - weightsPolling：加权轮询
 * - weightsRandom：加权随机
 * - minimumConnection：最小连接数
 * - weightsMinimumConnection：加权最小连接数
 */
export const AlgorithmType = {
  /** 轮询：依次选择下一个目标 */
  polling: 'polling',
  /** 加权：按权重比例选择 */
  weights: 'weights',
  /** 随机：随机选择一个目标 */
  random: 'random',
  /** 指定：按 ID 选择指定目标 */
  specify: 'specify',
  /** 加权轮询：结合权重和轮询 */
  weightsPolling: 'weightsPolling',
  /** 加权随机：结合权重和随机 */
  weightsRandom: 'weightsRandom',
  /** 最小连接数：选择当前连接数最少的目标 */
  minimumConnection: 'minimumConnection',
  /** 加权最小连接数：结合权重和最小连接数 */
  weightsMinimumConnection: 'weightsMinimumConnection',
} as const;

export type AlgorithmTypeKey = keyof typeof AlgorithmType;
export type AlgorithmTypeValue = typeof AlgorithmType[AlgorithmTypeKey];
