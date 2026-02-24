export declare class EventBus {
    lifecycleEvents: {};
    eventsMap: {};
    register(eventName: string, handler: Function): void;
    emitLifecycle(eventName: string, ...args: any[]): void;
    on(eventName: string, handler: Function): void;
    emit(eventName: string, ...args: any[]): void;
}
export declare const eventBus: EventBus;
export declare const Ready: "ready";
export declare const ElectronAppReady: "electron-app-ready";
export declare const WindowReady: "window-ready";
export declare const Preload: "preload";
export declare const BeforeClose: "before-close";
