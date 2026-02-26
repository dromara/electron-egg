declare const Ready = "ready";
declare const ElectronAppReady = "electron-app-ready";
declare const WindowReady = "window-ready";
declare const BeforeClose = "before-close";
declare const Preload = "preload";
type EventHandler = (...args: any[]) => any;
declare class EventBus {
    private lifecycleEvents;
    private eventsMap;
    constructor();
    register(eventName: string, handler: EventHandler): void;
    emitLifecycle(eventName: string, ...args: any[]): void;
    on(eventName: string, handler: EventHandler): void;
    emit(eventName: string, ...args: any[]): void;
}
declare const eventBus: EventBus;
export { EventBus, eventBus, Ready, ElectronAppReady, WindowReady, Preload, BeforeClose };
