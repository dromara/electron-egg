import { isClass, isFunction } from '../../utils/type_check.js';
import { loadException } from '../../exception/index.js';
import { requireFile } from '../../loader/index.js';
import { coreLogger } from '../../log/index.js';
import { isBytecodeClass } from '../../core/utils/index.js';
import type { JobMessage } from './jobProcess.js';

loadException();

const commands = ['run'];

class ChildApp {
  jobMap: Map<string, unknown>;

  constructor() {
    this._initEvents();
    this.jobMap = new Map();
  }

  /**
   * 初始化事件监听
   */
  _initEvents(): void {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code: number | null) => {
      coreLogger.info(`[jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
    });
  }

  /**
   * 监听消息
   */
  _handleMessage(m: JobMessage): void {
    if (commands.indexOf(m.cmd) === -1) {
      return;
    }
    switch (m.cmd) {
      case 'run':
        this.run(m);
        break;
      default:
        break;
    }
    coreLogger.info(`[jobs/child] received a message from main-process, message: ${JSON.stringify(m)}`);
  }

  /**
   * 运行脚本
   */
  run(msg: JobMessage = { mid: '', cmd: '' }): void {
    const { jobPath, jobParams, jobFunc, jobFuncParams } = msg;
    if (!jobPath) return;

    const mod = requireFile(jobPath);
    if (isClass(mod) || isBytecodeClass(mod)) {
      let instance: Record<string, unknown>;
      if (!this.jobMap.has(jobPath)) {
        instance = new (mod as new (...args: unknown[]) => Record<string, unknown>)(...(jobParams || []));
        this.jobMap.set(jobPath, instance);
      } else {
        instance = this.jobMap.get(jobPath) as Record<string, unknown>;
      }

      // 如果指定了函数名，则调用指定的函数
      if (jobFunc && Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(instance), jobFunc) && typeof instance[jobFunc] === 'function') {
        (instance[jobFunc] as (...args: unknown[]) => unknown)(...(jobFuncParams || []));
      } else if (typeof instance.handle === 'function') {
        instance.handle(...(jobParams || []));
      }
    } else if (isFunction(mod)) {
      (mod as (...args: unknown[]) => unknown)(jobParams);
    }
  }
}

new ChildApp();
