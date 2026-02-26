"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.electronApp = void 0;
exports.createElectron = createElectron;
const electron_1 = require("electron");
Object.defineProperty(exports, "electronApp", { enumerable: true, get: function () { return electron_1.app; } });
const log_1 = require("../../log");
const is_1 = require("../../utils/is");
const cross_1 = require("../../cross");
const window_1 = require("../window");
const events_1 = require("../../app/events");
const config_1 = require("../../config");
/**
 * 创建electron应用
 */
function createElectron() {
    const { singleLock } = (0, config_1.getConfig)();
    // 允许多个实例 
    const gotTheLock = electron_1.app.requestSingleInstanceLock();
    if (singleLock && !gotTheLock) {
        electron_1.app.quit();
        return;
    }
    electron_1.app.whenReady().then(() => {
        (0, window_1.createMainWindow)();
        events_1.eventBus.emitLifecycle(events_1.Preload);
        (0, window_1.loadServer)();
    });
    electron_1.app.on('window-all-closed', () => {
        if (!(0, is_1.macOS)()) {
            log_1.coreLogger.info('[ee-core] [lib/eeApp] window-all-closed quit');
            electron_1.app.quit();
        }
    });
    electron_1.app.on('before-quit', () => {
        (0, window_1.setCloseAndQuit)(true);
        events_1.eventBus.emitLifecycle(events_1.BeforeClose);
        cross_1.cross.killAll();
    });
    events_1.eventBus.emitLifecycle(events_1.ElectronAppReady);
}
//# sourceMappingURL=index.js.map