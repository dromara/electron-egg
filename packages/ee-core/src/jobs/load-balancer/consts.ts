/**
 * @module jobs/load-balancer/consts
 * @description Load balancing algorithm type constants.
 *
 * Supported algorithms:
 * - polling: Round-robin, select in sequence
 * - weights: Weighted, select by weight
 * - random: Random selection
 * - specify: Select by specified ID
 * - weightsPolling: Weighted round-robin
 * - weightsRandom: Weighted random
 * - minimumConnection: Least connections
 * - weightsMinimumConnection: Weighted least connections
 */
export const AlgorithmType = {
  /** Polling: select the next target in sequence */
  polling: 'polling',
  /** Weighted: select by weight ratio */
  weights: 'weights',
  /** Random: randomly select a target */
  random: 'random',
  /** Specify: select a target by ID */
  specify: 'specify',
  /** Weighted polling: combines weight and round-robin */
  weightsPolling: 'weightsPolling',
  /** Weighted random: combines weight and random selection */
  weightsRandom: 'weightsRandom',
  /** Least connections: select the target with the fewest current connections */
  minimumConnection: 'minimumConnection',
  /** Weighted least connections: combines weight and least connections */
  weightsMinimumConnection: 'weightsMinimumConnection',
} as const;

export type AlgorithmTypeKey = keyof typeof AlgorithmType;
export type AlgorithmTypeValue = typeof AlgorithmType[AlgorithmTypeKey];
