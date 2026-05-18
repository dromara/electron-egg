export const AlgorithmType = {
  polling: 'polling',
  weights: 'weights',
  random: 'random',
  specify: 'specify',
  weightsPolling: 'weightsPolling',
  weightsRandom: 'weightsRandom',
  minimumConnection: 'minimumConnection',
  weightsMinimumConnection: 'weightsMinimumConnection',
} as const;

export type AlgorithmTypeKey = keyof typeof AlgorithmType;
export type AlgorithmTypeValue = typeof AlgorithmType[AlgorithmTypeKey];
