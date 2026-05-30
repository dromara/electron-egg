/**
 * @module app/application
 * @description Application core class that orchestrates the framework startup flow.
 * Responsible for sequentially loading controllers, communication services,
 * emitting lifecycle events, and finally loading Electron main process features.
 * Held and invoked by the ElectronEgg class in boot.ts.
 */
import { loadController, loadControllerAsync } from '../controller/index.js';
import { eventBus, Ready } from './events.js';
import { loadSocket } from '../socket/index.js';
import { loadElectron } from '../electron/index.js';

/**
 * Application class — Framework startup flow orchestrator
 *
 * Responsibilities:
 * - register(): Register lifecycle event hooks
 * - run(): Synchronous startup flow (CJS controller loading)
 * - runAsync(): Asynchronous startup flow (ESM controller loading)
 *
 * Startup order:
 * 1. Load Controllers — Register all business handler functions
 * 2. Load Communication Services (Socket) — Start IPC/HTTP/SocketIO services
 * 3. Emit Ready lifecycle event
 * 4. Load Electron features — Create windows, register shortcuts, etc.
 */
export class Application {
  /**
   * Register a lifecycle event handler
   * @param eventName - Event name (e.g. 'ready', 'before-close')
   * @param handler - Event handler function
   */
  register(eventName: string, handler: (...args: unknown[]) => void): void {
    eventBus.register(eventName, handler);
  }

  /**
   * Start the application synchronously
   *
   * Flow:
   * 1. loadController() — Synchronously load controllers (using require())
   * 2. loadSocket() — Start IPC/HTTP/SocketIO communication services
   * 3. emitLifecycle(Ready) — Trigger ready lifecycle event
   * 4. loadElectron() — Initialize Electron main process (create windows, etc.)
   */
  async run(): Promise<void> {
    loadController();
    await loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }

  /**
   * Start the application asynchronously
   *
   * Same flow as run(), but controllers are loaded asynchronously using dynamic import(), supporting ESM modules.
   */
  async runAsync(): Promise<void> {
    await loadControllerAsync();
    await loadSocket();
    eventBus.emitLifecycle(Ready);
    loadElectron();
  }
}

/** Application singleton */
export const app = new Application();
