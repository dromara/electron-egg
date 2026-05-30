/**
 * @module app/events
 * @description 事件总线模块，提供框架内的生命周期事件和自定义事件机制。
 *
 * 两种事件类型：
 * - 生命周期事件（lifecycleEvents）：框架核心节点触发，如 ready、electron-app-ready、window-ready
 * - 自定义事件（eventsMap）：业务代码通过 on/emit 自由使用
 *
 * 事件处理器支持同步和异步函数，异步错误会被捕获并记录日志，不会导致进程崩溃。
 */
import { coreLogger } from '../log/index.js';

/** 生命周期：框架基础功能加载完成（控制器、通信服务已就绪） */
export const Ready = 'ready';
/** 生命周期：Electron app.whenReady() 完成 */
export const ElectronAppReady = 'electron-app-ready';
/** 生命周期：主窗口创建完成 */
export const WindowReady = 'window-ready';
/** 生命周期：窗口关闭前，可用于执行清理操作 */
export const BeforeClose = 'before-close';
/** 生命周期：预加载脚本注入时机 */
export const Preload = 'preload';

type EventHandler = (...args: unknown[]) => unknown;

/**
 * EventBus 事件总线
 *
 * 设计要点：
 * - 生命周期事件与自定义事件分离存储，避免命名冲突
 * - register() 注册生命周期事件，on() 注册自定义事件
 * - 重复注册同一事件名会覆盖并输出警告（而非静默忽略）
 * - emit 系列方法内置 try/catch，保证单个处理器异常不影响其他逻辑
 * - 异步处理器返回的 Promise 会被自动捕获错误
 */
export class EventBus {
  /** 生命周期事件处理器映射 */
  private lifecycleEvents: Record<string, EventHandler> = {};
  /** 自定义事件处理器映射 */
  private eventsMap: Record<string, EventHandler> = {};

  /**
   * 注册生命周期事件处理器
   *
   * 生命周期事件由框架内部触发，业务代码通过此方法注册钩子。
   * 若事件名已注册，会覆盖旧处理器并输出警告。
   *
   * @param eventName - 生命周期事件名（Ready / ElectronAppReady / WindowReady / BeforeClose / Preload）
   * @param handler - 事件处理函数，支持同步或异步
   */
  register(eventName: string, handler: EventHandler): void {
    if (this.lifecycleEvents[eventName]) {
      coreLogger.warn(`[EventBus] Lifecycle event '${eventName}' already registered, overriding.`);
    }
    this.lifecycleEvents[eventName] = handler;
  }

  /**
   * 触发生命周期事件
   *
   * 调用对应的事件处理器，自动捕获同步异常和异步 rejection。
   *
   * @param eventName - 生命周期事件名
   * @param args - 传递给处理器的参数
   */
  emitLifecycle(eventName: string, ...args: unknown[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      try {
        const result = eventFn(...args);
        // 异步处理器：捕获 rejection 防止 UnhandledPromiseRejection
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            coreLogger.error(`[EventBus] Async lifecycle handler '${eventName}' error:`, err);
          });
        }
      } catch (err) {
        coreLogger.error(`[EventBus] Lifecycle handler '${eventName}' error:`, err);
      }
    }
  }

  /**
   * 注册自定义事件处理器
   *
   * 业务代码可通过此方法注册自定义事件，由业务代码自行触发。
   * 若事件名已注册，会覆盖旧处理器并输出警告。
   *
   * @param eventName - 自定义事件名
   * @param handler - 事件处理函数，支持同步或异步
   */
  on(eventName: string, handler: EventHandler): void {
    if (this.eventsMap[eventName]) {
      coreLogger.warn(`[EventBus] Event '${eventName}' already registered, overriding.`);
    }
    this.eventsMap[eventName] = handler;
  }

  /**
   * 触发自定义事件
   *
   * 调用对应的事件处理器，自动捕获同步异常和异步 rejection。
   *
   * @param eventName - 自定义事件名
   * @param args - 传递给处理器的参数
   */
  emit(eventName: string, ...args: unknown[]): void {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      try {
        const result = eventFn(...args);
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            coreLogger.error(`[EventBus] Async event handler '${eventName}' error:`, err);
          });
        }
      } catch (err) {
        coreLogger.error(`[EventBus] Event handler '${eventName}' error:`, err);
      }
    }
  }
}

/** 事件总线单例，全局共享 */
export const eventBus = new EventBus();
