"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeforeClose = exports.Preload = exports.WindowReady = exports.ElectronAppReady = exports.Ready = exports.eventBus = exports.EventBus = void 0;
const Ready = "ready";
exports.Ready = Ready;
const ElectronAppReady = "electron-app-ready";
exports.ElectronAppReady = ElectronAppReady;
const WindowReady = "window-ready";
exports.WindowReady = WindowReady;
const BeforeClose = "before-close";
exports.BeforeClose = BeforeClose;
const Preload = "preload";
exports.Preload = Preload;
class EventBus {
    constructor() {
        this.lifecycleEvents = {};
        this.eventsMap = {};
    }
    // add lifecycle event
    register(eventName, handler) {
        if (!this.lifecycleEvents[eventName]) {
            this.lifecycleEvents[eventName] = handler;
        }
    }
    // call lifecycle event
    emitLifecycle(eventName, ...args) {
        const eventFn = this.lifecycleEvents[eventName];
        if (eventFn) {
            eventFn(...args);
        }
    }
    // add listener
    on(eventName, handler) {
        if (!this.eventsMap[eventName]) {
            this.eventsMap[eventName] = handler;
        }
    }
    // emit listener
    emit(eventName, ...args) {
        const eventFn = this.eventsMap[eventName];
        if (eventFn) {
            eventFn(...args);
        }
    }
}
exports.EventBus = EventBus;
const eventBus = new EventBus();
exports.eventBus = eventBus;
//# sourceMappingURL=events.js.map