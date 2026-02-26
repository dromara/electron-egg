

const Ready = "ready";
const ElectronAppReady = "electron-app-ready";
const WindowReady = "window-ready";
const BeforeClose = "before-close";
const Preload = "preload";

type EventHandler = (...args: any[]) => any;

class EventBus {
  private lifecycleEvents: Record<string, EventHandler>;
  private eventsMap: Record<string, EventHandler>;

  constructor() {
    this.lifecycleEvents = {};
    this.eventsMap = {};
  }

  // add lifecycle event
  register(eventName: string, handler: EventHandler): void {
    if (!this.lifecycleEvents[eventName]) {
      this.lifecycleEvents[eventName] = handler;
    }
  }

  // call lifecycle event
  emitLifecycle(eventName: string, ...args: any[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  } 

  // add listener
  on(eventName: string, handler: EventHandler): void {
    if (!this.eventsMap[eventName]) {
      this.eventsMap[eventName] = handler;
    }
  }

  // emit listener
  emit(eventName: string, ...args: any[]): void {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }
}

const eventBus = new EventBus();

export {
  EventBus,
  eventBus,
  Ready,
  ElectronAppReady,
  WindowReady,
  Preload,
  BeforeClose
};