import type { LoadBalancerTarget } from '../types.js';

/**
 * 随机算法
 */
export default function random(tasks: LoadBalancerTarget[]): LoadBalancerTarget | null {
  const length = tasks.length;
  const target = tasks[Math.floor(Math.random() * length)];

  return target || null;
}
