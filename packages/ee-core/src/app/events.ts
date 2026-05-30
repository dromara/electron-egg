import { coreLogger } from '../log/index.js';

export const Ready = 'ready';
export const ElectronAppReady = 'electron-app-ready';
export const WindowReady = 'window-ready';
export const BeforeClose = 'before-close';
export const Preload = 'preload';

type EventHandler = (...args: unknown[]) => unknown;

export class EventBus {
  private lifecycleEvents: Record<string, EventHandler> = {};
  private eventsMap: Record<string, EventHandler> = {};

  // add lifecycle event
  register(eventName: string, handler: EventHandler): void {
    if (this.lifecycleEvents[eventName]) {
      coreLogger.warn(`[EventBus] Lifecycle event '${eventName}' already registered, overriding.`);
    }
    this.lifecycleEvents[eventName] = handler;
  }

  // call lifecycle event
  emitLifecycle(eventName: string, ...args: unknown[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (eventFn) {
      try {
        const result = eventFn(...args);
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            coreLogger.error(`[EventBus] Async lifecycle handler '${eventName}' error:`, err);
          });
        }
      } catch (err) {
        coreLogger.error(`[EventBus] Lifecycle handler '${eventName}' error:`, err);
      }
    }
  }

  // add listener
  on(eventName: string, handler: EventHandler): void {
    if (this.eventsMap[eventName]) {
      coreLogger.warn(`[EventBus] Event '${eventName}' already registered, overriding.`);
    }
    this.eventsMap[eventName] = handler;
  }

  // emit listener
  emit(eventName: string, ...args: unknown[]): void {
    const eventFn = this.eventsMap[eventName];
    if (eventFn) {
      try {
        const result = eventFn(...args);
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            coreLogger.error(`[EventBus] Async event handler '${eventName}' error:`, err);
          });
        }
      } catch (err) {
        coreLogger.error(`[EventBus] Event handler '${eventName}' error:`, err);
      }
    }
  }
}

export const eventBus = new EventBus();
