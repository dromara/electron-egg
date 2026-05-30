/**
 * @module electron
 * @description Electron 主进程功能模块入口。提供应用生命周期管理和窗口管理功能。
 *
 * 核心功能：
 * - createElectron()：创建 Electron 应用，注册系统事件
 * - createMainWindow()：创建主窗口
 * - loadServer()：根据环境加载页面内容
 * - getMainWindow()：获取主窗口实例
 */
import { createElectron } from './app/index.js';

export { electronApp, createElectron } from './app/index.js';
export { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './window/index.js';

/**
 * 加载 Electron 主进程功能
 *
 * 调用 createElectron() 创建应用并注册系统事件。
 * 在框架启动流程中由 Application.run() 最后调用。
 */
export function loadElectron(): void {
  createElectron();
}
