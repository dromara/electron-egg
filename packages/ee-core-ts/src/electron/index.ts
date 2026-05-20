import { createElectron } from './app/index.js';

export { electronApp, createElectron } from './app/index.js';
export { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './window/index.js';

// load socket server
export function loadElectron(): void {
  createElectron();
}
