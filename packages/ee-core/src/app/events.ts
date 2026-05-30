/**
 * @module app/events
 * @description Event bus module, providing lifecycle events and custom event mechanisms within the framework.
 *
 * Two event types:
 * - Lifecycle events (lifecycleEvents): Triggered at framework core milestones, e.g. ready, electron-app-ready, window-ready
 * - Custom events (eventsMap): Freely used by business code via on/emit
 *
 * Event handlers support both synchronous and asynchronous functions. Async errors are caught and logged
 * without causing the process to crash.
 */
import { coreLogger } from '../log/index.js';

/** Lifecycle: Framework foundational features loaded (controllers, communication services ready) */
export const Ready = 'ready';
/** Lifecycle: Electron app.whenReady() completed */
export const ElectronAppReady = 'electron-app-ready';
/** Lifecycle: Main window created */
export const WindowReady = 'window-ready';
/** Lifecycle: Before window closes, can be used for cleanup operations */
export const BeforeClose = 'before-close';
/** Lifecycle: Preload script injection timing */
export const Preload = 'preload';

type EventHandler = (...args: unknown[]) => unknown;

/**
 * EventBus — Event bus
 *
 * Design highlights:
 * - Lifecycle events and custom events are stored separately to avoid naming conflicts
 * - register() registers lifecycle events, on() registers custom events
 * - Re-registering the same event name overwrites the previous handler and outputs a warning (rather than silently ignoring)
 * - emit methods have built-in try/catch, ensuring a single handler exception does not affect other logic
 * - Promises returned by async handlers have errors automatically caught
 */
export class EventBus {
  /** Lifecycle event handler mapping */
  private lifecycleEvents: Record<string, EventHandler> = {};
  /** Custom event handler mapping */
  private eventsMap: Record<string, EventHandler> = {};

  /**
   * Register a lifecycle event handler
   *
   * Lifecycle events are triggered internally by the framework; business code registers hooks via this method.
   * If the event name is already registered, the old handler is overwritten and a warning is logged.
   *
   * @param eventName - Lifecycle event name (Ready / ElectronAppReady / WindowReady / BeforeClose / Preload)
   * @param handler - Event handler function, supports sync or async
   */
  register(eventName: string, handler: EventHandler): void {
    if (this.lifecycleEvents[eventName]) {
      coreLogger.warn(`[EventBus] Lifecycle event '${eventName}' already registered, overriding.`);
    }
    this.lifecycleEvents[eventName] = handler;
  }

  /**
   * Emit a lifecycle event
   *
   * Invokes the corresponding event handler. Errors are NOT silently swallowed —
   * sync errors propagate to the caller, async errors are re-thrown as unhandled rejections
   * (caught by the global exception handler).
   *
   * @param eventName - Lifecycle event name
   * @param args - Arguments passed to the handler
   */
  emitLifecycle(eventName: string, ...args: unknown[]): void {
    const eventFn = this.lifecycleEvents[eventName];
    if (!eventFn) return;

    const result = eventFn(...args);
    // Async handler: re-throw as unhandled rejection so the global handler catches it
    if (result instanceof Promise) {
      result.catch((err: unknown) => {
        coreLogger.error(`[EventBus] Async lifecycle handler '${eventName}' error:`, err);
        throw err;
      });
    }
  }

  /**
   * Register a custom event handler
   *
   * Business code can register custom events via this method, triggered by business code itself.
   * If the event name is already registered, the old handler is overwritten and a warning is logged.
   *
   * @param eventName - Custom event name
   * @param handler - Event handler function, supports sync or async
   */
  on(eventName: string, handler: EventHandler): void {
    if (this.eventsMap[eventName]) {
      coreLogger.warn(`[EventBus] Event '${eventName}' already registered, overriding.`);
    }
    this.eventsMap[eventName] = handler;
  }

  /**
   * Emit a custom event
   *
   * Invokes the corresponding event handler, automatically catching synchronous exceptions and async rejections.
   *
   * @param eventName - Custom event name
   * @param args - Arguments passed to the handler
   */
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

/** Event bus singleton, globally shared */
export const eventBus = new EventBus();
