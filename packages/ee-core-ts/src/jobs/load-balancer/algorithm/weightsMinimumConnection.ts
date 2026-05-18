import type { LoadBalancerTarget, LoadBalancerParams } from '../types.js';

/**
 * 权重最小连接数算法
 */
export default function weightsMinimumConnection(
  tasks: LoadBalancerTarget[],
  weightTotal: number,
  connectionsMap: Record<string | number, number>,
  context: LoadBalancerParams
): LoadBalancerTarget | null {
  if (!tasks.length) return null;

  const first = tasks[0];
  if (!first) return null;

  let min = first.weight || 0;
  let minIndex = 0;
  let sum: number;

  const connectionsTotal = tasks.reduce((total, cur) => {
    total += connectionsMap[cur.id] || 0;
    return total;
  }, 0);

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;
    sum =
      (task.weight || 0) +
      Math.random() * weightTotal +
      (((connectionsMap[task.id] || 0) * weightTotal) / (connectionsTotal || 1));
    if (sum <= min) {
      min = sum;
      minIndex = i;
    }
  }

  context.weightIndex += 1;
  context.weightIndex %= weightTotal + 1;

  return tasks[minIndex] || null;
}
