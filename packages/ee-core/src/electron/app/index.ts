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
 * 创建electron应用
 */
export function createElectron(): void {
  const { singleLock } = getConfig() as { singleLock: boolean };
  // 允许多个实例
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    electronApp.quit();
    return;
  }

  electronApp.whenReady().then(() => {
    createMainWindow();
    eventBus.emitLifecycle(Preload);
    loadServer();
    eventBus.emitLifecycle(ElectronAppReady);
  });

  electronApp.on('window-all-closed', () => {
    if (!is.macOS()) {
      coreLogger.info('[lib/eeApp] window-all-closed quit');
      electronApp.quit();
    }
  });

  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);
    eventBus.emitLifecycle(BeforeClose);
    cross.killAll();
    killAllJobs();
  });
}
