"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.Appliaction = void 0;
const debug_1 = __importDefault(require("debug"));
const controller_1 = require("../controller");
const events_1 = require("./events");
const socket_1 = require("../socket");
const electron_1 = require("../electron");
const debugLog = (0, debug_1.default)('ee-core:app:appliaction');
class Appliaction {
    constructor() {
    }
    register(eventName, handler) {
        return events_1.eventBus.register(eventName, handler);
    }
    run() {
        (0, controller_1.loadController)();
        (0, socket_1.loadSocket)();
        events_1.eventBus.emitLifecycle(events_1.Ready);
        (0, electron_1.loadElectron)();
    }
}
exports.Appliaction = Appliaction;
const app = new Appliaction();
exports.app = app;
//# sourceMappingURL=application.js.map