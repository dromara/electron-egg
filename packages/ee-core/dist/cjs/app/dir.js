"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDir = loadDir;
const fs_1 = __importDefault(require("fs"));
const ps_1 = require("../ps");
const helper_1 = require("../utils/helper");
function loadDir() {
    initDir();
}
function initDir() {
    const homeHiddenAppDir = (0, ps_1.getUserHomeHiddenAppDir)();
    if (!fs_1.default.existsSync(homeHiddenAppDir)) {
        (0, helper_1.mkdir)(homeHiddenAppDir, { mode: 0o755 });
    }
    const dataDir = (0, ps_1.getDataDir)();
    if (!fs_1.default.existsSync(dataDir)) {
        (0, helper_1.mkdir)(dataDir, { mode: 0o755 });
    }
    const logDir = (0, ps_1.getLogDir)();
    if (!fs_1.default.existsSync(logDir)) {
        (0, helper_1.mkdir)(logDir, { mode: 0o755 });
    }
}
//# sourceMappingURL=dir.js.map