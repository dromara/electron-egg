export const Ready = 'ready';
export const ElectronAppReady = 'electron-app-ready';
export const WindowReady = 'window-ready';
export const BeforeClose = 'before-close';
export const Preload = 'preload';

export class EventBus {
  private lifecycleEvents: Record<string, (...args: unknown[]) => void> = {};
  private eventsMap: Record<string, (...args: unknown[]) => void> = {};

  register(eventName: string, handler: (...args: unknown[]) => void): void {
    if (!this.lifecycleEvents[eventName]) {
      this.lifecycleEvents[eventName] = handler;
    }
  }

  emitLifecycle(eventName: string, ...args: unknown[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }

  on(eventName: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventsMap[eventName]) {
      this.eventsMap[eventName] = handler;
    }
  }

  emit(eventName: string, ...args: unknown[]): void {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }
}

export const eventBus = new EventBus();
