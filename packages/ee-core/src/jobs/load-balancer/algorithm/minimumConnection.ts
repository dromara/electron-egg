import type { LoadBalancerTarget } from '../types.js';

/**
 * Least connections algorithm
 */
export default function minimumConnection(
  tasks: LoadBalancerTarget[],
  conMap: Record<string | number, number> = {}
): LoadBalancerTarget | null {
  if (tasks.length < 2) return tasks[0] || null;

  const first = tasks[0];
  if (!first) return null;

  let min = conMap[first.id] || 0;
  let minIndex = 0;

  for (let i = 1; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task) continue;
    const con = conMap[task.id] || 0;
    if (con <= min) {
      min = con;
      minIndex = i;
    }
  }

  return tasks[minIndex] || null;
}
