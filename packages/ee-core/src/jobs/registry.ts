/**
 * @module jobs/registry
 * @description 任务管理器注册表。统一管理所有 ChildJob 和 ChildPoolJob 实例，
 * 在应用退出时（before-quit）统一终止所有子进程，防止进程泄漏。
 */
import { coreLogger } from '../log/index.js';

/** 可终止的任务管理器接口 */
type Killable = { killAll: () => void } | { getPids: () => string[]; kill: (pid: string | number) => void };

/** 已注册的任务管理器列表 */
const registeredJobs: Killable[] = [];

/**
 * 注册任务管理器
 *
 * 在创建 ChildJob 或 ChildPoolJob 后调用，确保应用退出时能统一清理。
 *
 * @param job - 任务管理器实例（ChildJob 或 ChildPoolJob）
 */
export function registerJobManager(job: Killable): void {
  registeredJobs.push(job);
}

/**
 * 终止所有已注册的任务管理器
 *
 * 在 Electron before-quit 事件中调用，确保所有子进程被正确终止。
 * 优先使用 killAll()，其次逐个 kill()。
 */
export function killAllJobs(): void {
  for (const job of registeredJobs) {
    try {
      if ('killAll' in job && typeof job.killAll === 'function') {
        job.killAll();
      } else if ('getPids' in job && 'kill' in job) {
        const pids = job.getPids();
        for (const pid of pids) {
          job.kill(typeof pid === 'string' ? parseInt(pid, 10) : pid);
        }
      }
    } catch (err) {
      coreLogger.error('[jobs/registry] error killing job manager:', err);
    }
  }
}
