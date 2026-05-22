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

  const first = tasks[0];
  if (!first) return null;

  let max = first.weight || 0;
  let maxIndex = 0;
  let sum: number;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;
    sum = (task.weight || 0) + Math.random() * weightTotal;
    if (sum >= max) {
      max = sum;
      maxIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= weightTotal + 1;

  return tasks[maxIndex] || null;
}
