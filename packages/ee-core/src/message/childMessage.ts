/**
 * @module message/childMessage
 * @description 子进程消息通信模块。提供子进程（通过 child_process.fork 创建）
 * 向主进程发送消息的能力，是框架 IPC 通信机制在子进程侧的核心实现。
 *
 * 子进程无法直接访问 Electron 的 ipcRenderer/ipcMain，
 * 因此通过 Node.js 内置的 process.send() 方法与主进程通信。
 * 主进程通过监听子进程的 message 事件接收并分发这些消息。
 *
 * 消息格式遵循框架统一的 IPC 协议：
 * ```
 * {
 *   channel: string,      // 通信频道，如 'ee#sendToMain'
 *   eventReceiver: string, // 接收者类型，如 'job' / 'task'
 *   event: string,        // 事件名称
 *   data: object          // 事件数据
 * }
 * ```
 *
 * 使用示例：
 * ```ts
 * // 在子进程中向主进程的 ChildJob 实例发送消息
 * childMessage.sendToMain('taskComplete', { result: 42 });
 *
 * // 在子进程中向主进程的 Fork 进程实例发送消息
 * childMessage.send('dataReady', { items: [...] });
 *
 * // 发送错误信息到终端
 * childMessage.sendErrorToTerminal(new Error('Something went wrong'));
 * ```
 */
import { Receiver, Processes } from '../const/channel.js';

/**
 * ChildMessage — 子进程消息通信类
 *
 * 封装子进程向主进程发送消息的方法，区分不同的接收者类型
 * （ChildJob / ForkProcess），并提供错误信息转发能力。
 *
 * 该类在子进程环境中运行，依赖 process.send() 进行通信，
 * 若当前进程不支持 process.send（非 fork 创建的进程），则返回 false。
 */
export class ChildMessage {
  /**
   * 向主进程的 ChildJob 实例发送消息
   *
   * 使用 Receiver.childJob 作为接收者类型，主进程收到消息后
   * 会将事件路由到对应的 ChildJob 处理器。
   *
   * @param eventName - 事件名称，主进程据此分发到对应的处理函数
   * @param params - 事件参数，默认为空对象
   * @returns 发送成功返回 true，当前进程不支持 process.send 时返回 false
   */
  sendToMain(eventName: string, params: Record<string, unknown> = {}): boolean {
    const receiver = Receiver.childJob;
    return this.send(eventName, params, receiver);
  }

  /**
   * 向主进程发送消息（通用方法）
   *
   * 构造符合框架 IPC 协议的消息对象，通过 process.send() 发送到主进程。
   * 若未指定接收者，默认使用 Receiver.forkProcess（通用任务进程）。
   *
   * @param eventName - 事件名称
   * @param params - 事件参数，默认为空对象
   * @param receiver - 接收者类型，默认为 Receiver.forkProcess
   *   - 'job'：ChildJob 类型的子进程
   *   - 'task'：Fork 进程（通用任务）
   * @returns 发送成功返回 true，当前进程不支持 process.send 时返回 false
   */
  send(eventName: string, params: Record<string, unknown> = {}, receiver?: string): boolean {
    const eventReceiver = receiver || Receiver.forkProcess;
    const message = {
      channel: Processes.sendToMain,
      eventReceiver,
      event: eventName,
      data: params,
    };

    return process.send ? process.send(message) : false;
  }

  /**
   * 退出当前子进程
   *
   * @param code - 退出码，默认为 0（正常退出）
   * @throws 永不返回（process.exit 会终止进程）
   */
  exit(code = 0): never {
    return process.exit(code);
  }

  /**
   * 向主进程发送错误信息并在渲染进程展示异常弹窗
   *
   * 使用 Processes.showException 频道发送，主进程收到后
   * 会通过 IPC 转发到渲染进程，由渲染进程弹窗显示错误信息。
   * 错误信息会附加提示语，引导用户查看日志文件获取详细信息。
   *
   * @param err - 错误对象
   * @returns 发送成功返回 true，当前进程不支持 process.send 时返回 false
   */
  sendErrorToTerminal(err: Error): boolean {
    let errTips = err && typeof err === 'object' ? err.toString() : '';
    // 附加提示语，引导用户查看日志文件获取完整的错误堆栈
    errTips += ' Error !!! Please See file ee-core.log or ee-error-xxx.log for details !';
    const message = {
      channel: Processes.showException,
      data: errTips,
    };
    return process.send ? process.send(message) : false;
  }
}

/** 子进程消息通信单例，供子进程代码直接使用 */
export const childMessage = new ChildMessage();
