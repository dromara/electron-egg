/**
 * @module jobs/registry
 * @description Job manager registry. Centrally manages all ChildJob and ChildPoolJob instances,
 * terminating all child processes on application exit (before-quit) to prevent process leaks.
 */
import { coreLogger } from '../log/index.js';

/** Killable job manager interface */
type Killable = { killAll: () => void } | { getPids: () => string[]; kill: (pid: string | number) => void };

/** List of registered job managers */
const registeredJobs: Killable[] = [];

/**
 * Register a job manager
 *
 * Called after creating a ChildJob or ChildPoolJob to ensure cleanup on application exit.
 *
 * @param job - Job manager instance (ChildJob or ChildPoolJob)
 */
export function registerJobManager(job: Killable): void {
  registeredJobs.push(job);
}

/**
 * Kill all registered job managers
 *
 * Called in the Electron before-quit event to ensure all child processes are properly terminated.
 * Prefers killAll(), falls back to killing individual processes.
 */
export function killAllJobs(): void {
  const failed: unknown[] = [];
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
      failed.push(err);
    }
  }
  if (failed.length > 0) {
    coreLogger.error(`[jobs/registry] ${failed.length} job manager(s) failed to kill, processes may be orphaned`);
  }
}
