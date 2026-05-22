export const Ready = 'ready';
export const ElectronAppReady = 'electron-app-ready';
export const WindowReady = 'window-ready';
export const BeforeClose = 'before-close';
export const Preload = 'preload';

export class EventBus {
  private lifecycleEvents: Record<string, (...args: unknown[]) => void> = {};
  private eventsMap: Record<string, (...args: unknown[]) => void> = {};

  // add lifecycle event
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    if (!this.lifecycleEvents[eventName]) {
      this.lifecycleEvents[eventName] = handler;
    }
  }

  // call lifecycle event
  // [todo] 如果是一个 async 函数，且函数的运行时间比较长，如何正确执行
  emitLifecycle(eventName: string, ...args: unknown[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }

  // add listener
  on(eventName: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventsMap[eventName]) {
      this.eventsMap[eventName] = handler;
    }
  }

  // emit listener
  emit(eventName: string, ...args: unknown[]): void {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      eventFn(...args);
    }
  }
}

export const eventBus = new EventBus();
