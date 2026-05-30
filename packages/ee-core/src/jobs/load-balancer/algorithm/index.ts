/**
 * @module jobs/load-balancer/algorithm
 * @description 负载均衡算法注册表。将算法类型名称映射到对应的算法函数，
 * 供 Scheduler 调度器使用。
 */
import { AlgorithmType } from '../consts.js';
import polling from './polling.js';
import weights from './weights.js';
import random from './random.js';
import specify from './specify.js';
import minimumConnection from './minimumConnection.js';
import weightsPolling from './weightsPolling.js';
import weightsRandom from './weightsRandom.js';
import weightsMinimumConnection from './weightsMinimumConnection.js';
import type { LoadBalancerTarget } from '../types.js';

/** 算法函数类型 */
export type AlgorithmFn = (
  tasks: LoadBalancerTarget[],
  ...args: unknown[]
) => LoadBalancerTarget | null;

/** 算法名称 → 算法函数的映射 */
const algorithms: Record<string, AlgorithmFn> = {
  [AlgorithmType.polling]: polling as AlgorithmFn,
  [AlgorithmType.weights]: weights as AlgorithmFn,
  [AlgorithmType.random]: random as AlgorithmFn,
  [AlgorithmType.specify]: specify as AlgorithmFn,
  [AlgorithmType.minimumConnection]: minimumConnection as AlgorithmFn,
  [AlgorithmType.weightsPolling]: weightsPolling as AlgorithmFn,
  [AlgorithmType.weightsRandom]: weightsRandom as AlgorithmFn,
  [AlgorithmType.weightsMinimumConnection]: weightsMinimumConnection as AlgorithmFn,
};

export default algorithms;
