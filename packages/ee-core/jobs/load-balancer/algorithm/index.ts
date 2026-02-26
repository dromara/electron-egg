import Consts from "../consts";
import polling from './polling';
import weights from './weights';
import random from './random';
import specify from './specify';
import minimumConnection from './minimumConnection';
import weightsPolling from './weightsPolling';
import weightsRandom from './weightsRandom';
import weightsMinimumConnection from './weightsMinimumConnection';

export default {
  [Consts.polling]: polling,
  [Consts.weights]: weights,
  [Consts.random]: random,
  [Consts.specify]: specify,
  [Consts.minimumConnection]: minimumConnection,
  [Consts.weightsPolling]: weightsPolling,
  [Consts.weightsRandom]: weightsRandom,
  [Consts.weightsMinimumConnection]: weightsMinimumConnection,
};
