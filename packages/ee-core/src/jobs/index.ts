/**
 * @module jobs
 * @description Background task module entry. Provides child process task management and load balancing capabilities.
 *
 * Core components:
 * - ChildJob: Single task execution, creates a new child process each time
 * - ChildPoolJob: Process pool, reuses child processes, distributes tasks via load balancing
 * - LoadBalancer: Load balancer, supports multiple scheduling algorithms
 * - AlgorithmType: Algorithm type constants
 */
export { ChildJob } from './child/index.js';
export { ChildPoolJob } from './child-pool/index.js';
export { LoadBalancer } from './load-balancer/index.js';
export { AlgorithmType } from './load-balancer/consts.js';
export type { LoadBalancerTarget, LoadBalancerParams, LoadBalancerOptions } from './load-balancer/types.js';
export type { JobProcessOptions, JobMessage, ProcessMessage } from './child/jobProcess.js';
export type { ChildPoolOptions } from './child-pool/index.js';
