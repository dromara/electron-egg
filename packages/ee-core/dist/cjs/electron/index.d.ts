import { electronApp, createElectron } from './app';
import { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer } from './window';
declare function loadElectron(): void;
export { electronApp, createElectron, loadElectron, getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer };
