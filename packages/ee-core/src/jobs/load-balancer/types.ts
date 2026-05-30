/**
 * @module jobs/load-balancer/types
 * @description Load balancer type definitions.
 */

/** Load balancer target (child process) */
export interface LoadBalancerTarget {
  /** Target identifier (usually child process PID) */
  id: string | number;
  /** Weight value (used by weighted algorithms) */
  weight?: number;
}

/** Load balancer runtime parameters */
export interface LoadBalancerParams {
  /** Current polling index */
  currentIndex: number;
  /** Current weight index (for weighted round-robin) */
  weightIndex: number;
  /** Sum of all weights */
  weightTotal: number;
  /** Connections map: pid -> current connection count */
  connectionsMap: Record<string | number, number>;
  /** CPU occupancy map: pid -> CPU usage */
  cpuOccupancyMap: Record<string | number, number>;
  /** Memory occupancy map: pid -> memory usage */
  memoryOccupancyMap: Record<string | number, number>;
}

/** Load balancer configuration options */
export interface LoadBalancerOptions {
  /** Target list */
  targets: LoadBalancerTarget[];
  /** Algorithm name (default: polling) */
  algorithm?: string;
}

/** Process info (CPU/memory) */
export interface PidInfo {
  /** Process ID */
  pid: string | number;
  /** CPU usage */
  cpu: number;
  /** Memory usage */
  memory: number;
}
