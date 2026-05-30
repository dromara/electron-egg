/**
 * @module jobs/child/app
 * @description 子进程入口应用。运行在 child_process.fork() 创建的子进程中，
 * 负责接收主进程的消息并执行对应的任务文件。
 *
 * 子进程生命周期：
 * 1. 主进程 fork 子进程，加载此模块
 * 2. 子进程监听 message 事件，等待主进程指令
 * 3. 收到 run 命令后加载任务文件并执行
 * 4. 类类型的任务文件：首次执行时实例化并缓存，后续复用同一实例
 * 5. 函数类型的任务文件：每次执行直接调用
 *
 * 注意：子进程独立于主进程，需单独加载异常处理（loadException）
 */
import { isClass, isFunction } from '../../utils/type_check.js';
import { loadException } from '../../exception/index.js';
import { requireFile } from '../../loader/index.js';
import { coreLogger } from '../../log/index.js';
import { isBytecodeClass } from '../../core/utils/index.js';
import type { JobMessage } from './jobProcess.js';

// 子进程必须独立加载异常处理
loadException();

/** 支持的命令列表 */
const commands = ['run'];

/**
 * ChildApp 子进程应用
 *
 * 在子进程中运行，接收主进程的 run 命令执行任务文件。
 * 类类型的任务实例会被缓存在 jobMap 中复用。
 */
class ChildApp {
  /** 任务实例缓存：{ jobPath: instance }，同一任务文件只实例化一次 */
  jobMap: Map<string, unknown>;

  constructor() {
    this._initEvents();
    this.jobMap = new Map();
  }

  /**
   * 初始化事件监听
   *
   * 监听主进程消息和子进程退出事件。
   */
  _initEvents(): void {
    process.on('message', this._handleMessage.bind(this));
    process.once('exit', (code: number | null) => {
      coreLogger.info(`[jobs/child] received a exit from main-process, code:${code}, pid:${process.pid}`);
    });
  }

  /**
   * 处理主进程消息
   *
   * 仅处理 commands 列表中的命令，忽略未知命令。
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
   * 运行任务
   *
   * 根据任务文件导出类型执行不同逻辑：
   * - 类/字节码类：首次实例化并缓存（jobMap），后续复用实例
   *   - 若指定 jobFunc：调用实例的指定方法
   *   - 否则调用实例的 handle() 方法（默认入口）
   * - 普通函数：直接调用，传入 jobParams
   *
   * @param msg - 任务消息，包含文件路径、参数和函数名
   */
  run(msg: JobMessage = { mid: '', cmd: '' }): void {
    const { jobPath, jobParams, jobFunc, jobFuncParams } = msg;
    if (!jobPath) return;

    const mod = requireFile(jobPath);
    if (isClass(mod) || isBytecodeClass(mod)) {
      let instance: Record<string, unknown>;
      if (!this.jobMap.has(jobPath)) {
        // 首次执行：实例化并缓存
        instance = new (mod as new (...args: unknown[]) => Record<string, unknown>)(...(jobParams || []));
        this.jobMap.set(jobPath, instance);
      } else {
        // 后续执行：复用缓存实例
        instance = this.jobMap.get(jobPath) as Record<string, unknown>;
      }

      // 调用指定方法或默认 handle 方法
      // 注意：使用 typeof 检查而非 hasOwnProperty，以支持实例方法和原型方法
      if (jobFunc && typeof instance[jobFunc] === 'function') {
        (instance[jobFunc] as (...args: unknown[]) => unknown)(...(jobFuncParams || []));
      } else if (typeof instance.handle === 'function') {
        instance.handle(...(jobParams || []));
      }
    } else if (isFunction(mod)) {
      (mod as (...args: unknown[]) => unknown)(jobParams);
    }
  }
}

// 子进程启动时创建 ChildApp 实例
new ChildApp();
