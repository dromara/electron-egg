import type { LoadBalancerTarget, LoadBalancerParams } from '../types.js';

/**
 * 权重算法
 */
export default function weights(
  tasks: LoadBalancerTarget[],
  weightTotal: number,
  context: LoadBalancerParams
): LoadBalancerTarget | null {
  if (!tasks.length) return null;

  let max = -Infinity;
  let maxIndex = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;
    const sum = (task.weight || 0) + Math.random() * weightTotal;
    if (sum > max) {
      max = sum;
      maxIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= weightTotal + 1;

  return tasks[maxIndex] || null;
}
