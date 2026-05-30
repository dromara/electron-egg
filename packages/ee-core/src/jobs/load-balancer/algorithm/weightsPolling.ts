import type { LoadBalancerTarget, LoadBalancerParams } from '../types.js';

/**
 * Weighted round-robin algorithm
 */
export default function weightsPolling(
  tasks: LoadBalancerTarget[],
  weightIndex: number,
  weightTotal: number,
  context: LoadBalancerParams
): LoadBalancerTarget | null {
  if (!tasks.length) return null;

  let weight = 0;
  let task: LoadBalancerTarget | undefined;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (!t) continue;
    weight += t.weight || 0;
    if (weight > weightIndex) {
      task = t;
      break;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= weightTotal + 1;

  return task || null;
}
