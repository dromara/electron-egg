declare function getMainWindow(): any;
declare function createMainWindow(): Electron.BrowserWindow;
declare function restoreMainWindow(): void;
declare function setCloseAndQuit(flag: boolean): void;
declare function getCloseAndQuit(): boolean;
declare function loadServer(): Promise<void>;
export { getMainWindow, createMainWindow, restoreMainWindow, setCloseAndQuit, getCloseAndQuit, loadServer };
