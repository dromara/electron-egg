/**
 * @module jobs/load-balancer/algorithm
 * @description Load balancing algorithm registry. Maps algorithm type names to their corresponding
 * algorithm functions, for use by the Scheduler.
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

/** Algorithm function type */
export type AlgorithmFn = (
  tasks: LoadBalancerTarget[],
  ...args: unknown[]
) => LoadBalancerTarget | null;

/** Algorithm name -> algorithm function mapping */
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
