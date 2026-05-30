import type { LoadBalancerTarget } from '../types.js';

/**
 * Weighted random algorithm
 */
export default function weightsRandom(
  tasks: LoadBalancerTarget[],
  weightTotal: number
): LoadBalancerTarget | null {
  let task: LoadBalancerTarget | undefined;
  let weight = Math.ceil(Math.random() * weightTotal);

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t) continue;
    weight -= t.weight || 0;
    if (weight <= 0) {
      task = t;
      break;
    }
  }

  return task || null;
}
