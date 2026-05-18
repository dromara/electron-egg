import debug from 'debug';
import path from 'path';
import { fork } from 'child_process';
import is from 'is-type-of';
import { getConfig } from '../config/index.js';
import { getExtraResourcesDir, isDev, getBaseDir } from '../ps/index.js';
import { coreLogger } from '../log/index.js';
import { isFileProtocol } from '../utils/index.js';
import { sleep } from '../utils/helper.js';
import type { JobChildOptions } from '../types/index.js';

const log = debug('ee-core:cross');

export class Cross {
  private jobPool: Map<string, { process: ReturnType<typeof fork> | null; opt: JobChildOptions }> = new Map();

  createJob(name: string, opt: JobChildOptions): ReturnType<typeof fork> | null {
    let childProcess: ReturnType<typeof fork> | null = null;
    let cmd = '';
    if (isDev()) {
      cmd = path.join(getBaseDir(), opt.script);
    } else {
      cmd = path.join(getExtraResourcesDir(), opt.script);
    }

    const args = opt.args || [];
    const execArgv = process.execArgv;
    const options = {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'] as ('pipe' | 'ipc')[],
      env: { ...process.env, ...(opt.env || {}) },
      execArgv,
    };

    try {
      childProcess = fork(cmd, args, options);
    } catch (e) {
      log('[createJob] fork error:', e);
      coreLogger.error('[createJob] fork error:', e);
    }

    if (childProcess) {
      childProcess.on('exit', (code, signal) => {
        log(`[createJob] child process exited with code ${code} and signal ${signal}`);
        this.jobPool.delete(name);
      });
      this.jobPool.set(name, { process: childProcess, opt });
    }

    return childProcess;
  }

  killAll(): void {
    for (const [name, item] of this.jobPool) {
      if (item.process) {
        item.process.kill();
        log(`[killAll] kill job ${name}`);
      }
    }
    this.jobPool.clear();
  }

  kill(name: string): void {
    const item = this.jobPool.get(name);
    if (item?.process) {
      item.process.kill();
      this.jobPool.delete(name);
    }
  }

  getJob(name: string): ReturnType<typeof fork> | null {
    return this.jobPool.get(name)?.process || null;
  }

  getAllJobs(): Map<string, { process: ReturnType<typeof fork> | null; opt: JobChildOptions }> {
    return this.jobPool;
  }
}

export const cross = new Cross();
