import { electronApp, createElectron } from './app';
import { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './window';

// load socket server
function loadElectron() {
  createElectron();
}

export {
  electronApp,
  createElectron,
  loadElectron,
  getMainWindow,
  createMainWindow,
  restoreMainWindow,
  setCloseAndQuit,
  getCloseAndQuit,
  loadServer
};