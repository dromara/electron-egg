import type { LoadBalancerTarget } from '../types.js';

/**
 * Specify (bind by ID) algorithm
 */
export default function specify(
  tasks: LoadBalancerTarget[],
  id: string | number
): LoadBalancerTarget | null {
  let task: LoadBalancerTarget | undefined;

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    if (t && t.id === id) {
      task = t;
      break;
    }
  }

  return task || null;
}
