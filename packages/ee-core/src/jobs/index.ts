/**
 * @module jobs
 * @description 后台任务模块入口。提供子进程任务管理和负载均衡能力。
 *
 * 核心组件：
 * - ChildJob：单次任务执行，每次创建新子进程
 * - ChildPoolJob：进程池，复用子进程，通过负载均衡分配任务
 * - LoadBalancer：负载均衡器，支持多种调度算法
 * - AlgorithmType：算法类型常量
 */
export { ChildJob } from './child/index.js';
export { ChildPoolJob } from './child-pool/index.js';
export { LoadBalancer } from './load-balancer/index.js';
export { AlgorithmType } from './load-balancer/consts.js';
export type { LoadBalancerTarget, LoadBalancerParams, LoadBalancerOptions } from './load-balancer/types.js';
export type { JobProcessOptions, JobMessage, ProcessMessage } from './child/jobProcess.js';
export type { ChildPoolOptions } from './child-pool/index.js';
