/**
 * @module app/application
 * @description 应用核心类，编排框架的启动流程。
 * 负责按顺序加载控制器、通信服务，发射生命周期事件，最后加载 Electron 主进程功能。
 * 由 boot.ts 中的 ElectronEgg 类持有并调用。
 */
import { loadController, loadControllerAsync } from '../controller/index.js';
import { eventBus, Ready } from './events.js';
import { loadSocket } from '../socket/index.js';
import { loadElectron } from '../electron/index.js';

/**
 * Application 类 — 框架启动流程编排器
 *
 * 职责：
 * - register(): 注册生命周期事件钩子
 * - run(): 同步启动流程（CJS 控制器加载）
 * - runAsync(): 异步启动流程（ESM 控制器加载）
 *
 * 启动顺序：
 * 1. 加载控制器（Controller）— 注册所有业务处理函数
 * 2. 加载通信服务（Socket）— 启动 IPC/HTTP/SocketIO 服务
 * 3. 发射 Ready 生命周期事件
 * 4. 加载 Electron 功能 — 创建窗口、注册快捷键等
 */
export class Application {
  /**
   * 注册生命周期事件处理器
   * @param eventName - 事件名（如 'ready'、'before-close'）
   * @param handler - 事件处理函数
   */
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    eventBus.register(eventName, handler);
  }

  /**
   * 同步方式启动应用
   *
   * 流程：
   * 1. loadController() — 同步加载控制器（使用 require()）
   * 2. loadSocket() — 启动 IPC/HTTP/SocketIO 通信服务
   * 3. emitLifecycle(Ready) — 触发 ready 生命周期事件
   * 4. loadElectron() — 初始化 Electron 主进程（创建窗口等）
   */
  async run(): Promise<void> {
    loadController();
    await loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }

  /**
   * 异步方式启动应用
   *
   * 流程与 run() 相同，但控制器使用动态 import() 异步加载，支持 ESM 模块。
   */
  async runAsync(): Promise<void> {
    await loadControllerAsync();
    await loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}

/** 应用单例 */
export const app = new Application();
