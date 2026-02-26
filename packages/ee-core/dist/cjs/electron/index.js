"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadServer = exports.getCloseAndQuit = exports.setCloseAndQuit = exports.restoreMainWindow = exports.createMainWindow = exports.getMainWindow = exports.createElectron = exports.electronApp = void 0;
exports.loadElectron = loadElectron;
const app_1 = require("./app");
Object.defineProperty(exports, "electronApp", { enumerable: true, get: function () { return app_1.electronApp; } });
Object.defineProperty(exports, "createElectron", { enumerable: true, get: function () { return app_1.createElectron; } });
const window_1 = require("./window");
Object.defineProperty(exports, "getMainWindow", { enumerable: true, get: function () { return window_1.getMainWindow; } });
Object.defineProperty(exports, "createMainWindow", { enumerable: true, get: function () { return window_1.createMainWindow; } });
Object.defineProperty(exports, "restoreMainWindow", { enumerable: true, get: function () { return window_1.restoreMainWindow; } });
Object.defineProperty(exports, "setCloseAndQuit", { enumerable: true, get: function () { return window_1.setCloseAndQuit; } });
Object.defineProperty(exports, "getCloseAndQuit", { enumerable: true, get: function () { return window_1.getCloseAndQuit; } });
Object.defineProperty(exports, "loadServer", { enumerable: true, get: function () { return window_1.loadServer; } });
// load socket server
function loadElectron() {
    (0, app_1.createElectron)();
}
//# sourceMappingURL=index.js.map