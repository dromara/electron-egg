import { coreLogger } from '../log/index.js';

type Killable = { killAll: () => void } | { getPids: () => string[]; kill: (pid: string | number) => void };

const registeredJobs: Killable[] = [];

/**
 * Register a job manager (ChildJob or ChildPoolJob) for cleanup on app exit.
 */
export function registerJobManager(job: Killable): void {
  registeredJobs.push(job);
}

/**
 * Kill all registered job managers. Called on before-quit.
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
