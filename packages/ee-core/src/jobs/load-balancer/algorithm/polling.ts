import type { LoadBalancerTarget, LoadBalancerParams } from '../types.js';

/**
 * Round-robin polling algorithm
 */
export default function polling(
  tasks: LoadBalancerTarget[],
  currentIndex: number,
  context: LoadBalancerParams
): LoadBalancerTarget | null {
  if (!tasks.length) return null;

  const task = tasks[currentIndex];
  context.currentIndex++;
  context.currentIndex %= tasks.length;

  return task || null;
}
