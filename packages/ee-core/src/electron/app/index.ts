/**
 * @module electron/app
 * @description Electron 应用生命周期管理。负责创建应用实例、注册系统事件、
 * 管理单实例锁，以及处理窗口关闭和应用退出的清理工作。
 *
 * 生命周期：
 * 1. createElectron() — 检查单实例锁 → app.whenReady() → 创建主窗口 → 加载页面
 * 2. window-all-closed — 非 macOS 平台退出应用
 * 3. before-quit — 清理跨进程服务和子任务
 */
import { app as electronApp } from 'electron';
import { coreLogger } from '../../log/index.js';
import * as is from '../../utils/is.js';
import { cross } from '../../cross/index.js';
import { createMainWindow, setCloseAndQuit, loadServer } from '../window/index.js';
import { eventBus, ElectronAppReady, BeforeClose, Preload } from '../../app/events.js';
import { getConfig } from '../../config/index.js';
import { killAllJobs } from '../../jobs/registry.js';

export { electronApp };

/**
 * 创建并启动 Electron 应用
 *
 * 执行流程：
 * 1. 检查单实例锁（配置 singleLock=true 时，阻止同时运行多个实例）
 * 2. 等待 app.whenReady() 完成
 * 3. 创建主窗口、发射 Preload 事件、加载服务页面、发射 ElectronAppReady 事件
 * 4. 注册系统事件监听：window-all-closed、before-quit
 */
export function createElectron(): void {
  const { singleLock } = getConfig() as { singleLock: boolean };
  // 请求单实例锁
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    // 已有实例运行，退出当前实例
    electronApp.quit();
    return;
  }

  // Electron app 就绪后创建窗口并加载页面
  electronApp.whenReady().then(() => {
    createMainWindow();
    eventBus.emitLifecycle(Preload);
    loadServer();
    eventBus.emitLifecycle(ElectronAppReady);
  });

  // 所有窗口关闭时退出应用（macOS 除外，macOS 应用通常保持运行）
  electronApp.on('window-all-closed', () => {
    if (!is.macOS()) {
      coreLogger.info('[lib/eeApp] window-all-closed quit');
      electronApp.quit();
    }
  });

  // 应用退出前清理资源
  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);
    eventBus.emitLifecycle(BeforeClose);
    // 终止所有跨进程服务（Go/Python 后端等）
    cross.killAll();
    // 终止所有子任务进程
    killAllJobs();
  });
}
