/**
 * @module electron
 * @description Electron main process functionality module entry point. Provides application lifecycle management and window management features.
 *
 * Core features:
 * - createElectron(): Create Electron application, register system events
 * - createMainWindow(): Create main window
 * - loadServer(): Load page content based on environment
 * - getMainWindow(): Get main window instance
 */
import { createElectron } from './app/index.js';

export { electronApp, createElectron } from './app/index.js';
export { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './window/index.js';

/**
 * Load Electron main process functionality
 *
 * Calls createElectron() to create the application and register system events.
 * Called last by Application.run() in the framework startup flow.
 */
export function loadElectron(): void {
  createElectron();
}
