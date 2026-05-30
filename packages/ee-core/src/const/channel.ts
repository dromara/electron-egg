/**
 * @module const/channel
 * @description IPC 通信频道和事件常量定义。
 * 统一管理框架内部使用的频道名和事件名，避免硬编码字符串。
 */

/** 进程间通信频道 */
export const Processes = {
  /** 异常展示频道：渲染进程收到此频道消息后显示异常弹窗 */
  showException: 'ee#showException',
  /** 子进程向主进程发送消息的频道 */
  sendToMain: 'ee#sendToMain',
} as const;

/** SocketIO 通信频道 */
export const SocketIO = {
  /** 第三方软件通信频道（默认 SocketIO 通信使用的频道名） */
  partySoftware: 'socket-channel',
} as const;

/** 进程生命周期事件 */
export const Events = {
  /** 子进程退出事件 */
  childProcessExit: 'ee#childProcess#exit',
  /** 子进程错误事件 */
  childProcessError: 'ee#childProcess#error',
} as const;

/** 消息接收者类型 */
export const Receiver = {
  /** ChildJob 类型的子进程 */
  childJob: 'job',
  /** Fork 进程（通用任务） */
  forkProcess: 'task',
  /** 所有接收者 */
  all: 'all',
} as const;
