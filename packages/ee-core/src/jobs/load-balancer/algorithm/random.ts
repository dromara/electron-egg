import type { LoadBalancerTarget } from '../types.js';

/**
 * Random selection algorithm
 */
export default function random(tasks: LoadBalancerTarget[]): LoadBalancerTarget | null {
  const length = tasks.length;
  const target = tasks[Math.floor(Math.random() * length)];

  return target || null;
}
