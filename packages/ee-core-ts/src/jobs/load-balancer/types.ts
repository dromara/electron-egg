export interface LoadBalancerTarget {
  id: string | number;
  weight?: number;
}

export interface LoadBalancerParams {
  currentIndex: number;
  weightIndex: number;
  weightTotal: number;
  connectionsMap: Record<string | number, number>;
  cpuOccupancyMap: Record<string | number, number>;
  memoryOccupancyMap: Record<string | number, number>;
}

export interface LoadBalancerOptions {
  targets: LoadBalancerTarget[];
  algorithm?: string;
}

export interface PidInfo {
  pid: string | number;
  cpu: number;
  memory: number;
}
