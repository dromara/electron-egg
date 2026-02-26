import { app as electronApp } from "electron";
import { coreLogger } from "../../log";
import { macOS } from "../../utils/is";
import { cross } from "../../cross";
import { createMainWindow, setCloseAndQuit, loadServer } from "../window";
import { eventBus, ElectronAppReady, BeforeClose, Preload } from "../../app/events";
import { getConfig } from "../../config";
function createElectron() {
  const { singleLock } = getConfig();
  const gotTheLock = electronApp.requestSingleInstanceLock();
  if (singleLock && !gotTheLock) {
    electronApp.quit();
    return;
  }
  electronApp.whenReady().then(() => {
    createMainWindow();
    eventBus.emitLifecycle(Preload);
    loadServer();
  });
  electronApp.on("window-all-closed", () => {
    if (!macOS()) {
      coreLogger.info("[ee-core] [lib/eeApp] window-all-closed quit");
      electronApp.quit();
    }
  });
  electronApp.on("before-quit", () => {
    setCloseAndQuit(true);
    eventBus.emitLifecycle(BeforeClose);
    cross.killAll();
  });
  eventBus.emitLifecycle(ElectronAppReady);
}
export {
  createElectron,
  electronApp
};
