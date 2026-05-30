/**
 * @module electron/app
 * @description Electron application lifecycle management. Responsible for creating application instances,
 * registering system events, managing single instance locks, and handling cleanup on window close and app exit.
 *
 * Lifecycle:
 * 1. createElectron() — Check single instance lock → app.whenReady() → Create main window → Load page
 * 2. window-all-closed — Quit app on non-macOS platforms
 * 3. before-quit — Clean up cross-process services and child tasks
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
 * Create and start Electron application
 *
 * Execution flow:
 * 1. Check single instance lock (when singleLock=true is configured, prevents running multiple instances simultaneously)
 * 2. Wait for app.whenReady() to complete
 * 3. Create main window, emit Preload event, load service page, emit ElectronAppReady event
 * 4. Register system event listeners: window-all-closed, before-quit
 */
export function createElectron(): void {
  const { singleLock } = getConfig() as { singleLock: boolean };
  // Request single instance lock
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    // Another instance is already running, quit current instance
    electronApp.quit();
    return;
  }

  // After Electron app is ready, create window and load page
  electronApp.whenReady().then(() => {
    createMainWindow();
    eventBus.emitLifecycle(Preload);
    loadServer();
    eventBus.emitLifecycle(ElectronAppReady);
  });

  // Quit app when all windows are closed (except on macOS, where apps typically stay running)
  electronApp.on('window-all-closed', () => {
    if (!is.macOS()) {
      coreLogger.info('[lib/eeApp] window-all-closed quit');
      electronApp.quit();
    }
  });

  // Clean up resources before app quits
  electronApp.on('before-quit', () => {
    setCloseAndQuit(true);
    eventBus.emitLifecycle(BeforeClose);
    // Terminate all cross-process services (Go/Python backends, etc.)
    cross.killAll();
    // Terminate all child task processes
    killAllJobs();
  });
}
