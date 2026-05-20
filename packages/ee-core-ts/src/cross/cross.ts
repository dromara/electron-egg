import debug from 'debug';
import path from 'path';
import { fork } from 'child_process';
import { getExtraResourcesDir, isDev, getBaseDir } from '../ps/index.js';
import { coreLogger } from '../log/index.js';
import { getValueFromArgv } from '../utils/helper.js';
import type { JobChildOptions } from '../types/index.js';

const log = debug('ee-core:cross');

export class Cross {
  // pid唯一
  // {pid:{name,entity}, pid:{name,entity}, ...}
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

    // 创建进程
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

  // 获取 proc
  getJob(name: string): ReturnType<typeof fork> | null {
    return this.jobPool.get(name)?.process || null;
  }

  // 获取pids
  getAllJobs(): Map<string, { process: ReturnType<typeof fork> | null; opt: JobChildOptions }> {
    return this.jobPool;
  }

  // 获取服务url
  getUrl(name: string): string {
    const item = this.jobPool.get(name);
    if (!item) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exist`);
    }

    const opt = item.opt;
    const args = opt.args || [];
    const ssl = getValueFromArgv(args, 'ssl');
    let hostname = getValueFromArgv(args, 'hostname') as string | undefined;
    let protocol = 'http://';
    if (ssl && (ssl === 'true' || ssl === '1')) {
      protocol = 'https://';
    }
    hostname = hostname || '127.0.0.1';

    // 从args中解析port，如果没有则使用opt.port
    let port = getValueFromArgv(args, 'port') as string | number | undefined;
    if (!port && opt.port) {
      port = opt.port;
    }
    if (!port) {
      throw new Error(`[ee-core] [cross] The process named [${name}] port does not exist`);
    }

    const url = protocol + hostname + ':' + port;
    return url;
  }
}

export const cross = new Cross();
