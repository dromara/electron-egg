/**
 * @module socket/ipcServer
 * @description Electron IPC server. Registers controller methods as IPC channel handlers,
 * enabling renderer processes to call main process controller methods via ipcRenderer.
 *
 * Supports two communication models:
 * - send/on model (synchronous): Renderer uses ipcRenderer.sendSync(),
 *   main process returns results via event.returnValue.
 *   ⚠️ Only supports synchronous controller methods; async methods return undefined with a warning.
 *
 * - invoke/handle model (asynchronous): Renderer uses ipcRenderer.invoke(),
 *   main process returns a Promise via ipcMain.handle().
 *   ✅ Recommended model, supports both synchronous and asynchronous controller methods.
 *
 * Channel naming rule: Replace '.' in controller path with channelSeparator (default '/')
 * Example: controller.user.add → controller/user/add
 */
import debug from 'debug';
import { ipcMain } from 'electron';
import { coreLogger } from '../log/index.js';
import { getController } from '../controller/index.js';
import { EXPORTS } from '../core/loader/file_loader.js';
import { getConfig } from '../config/index.js';
import { resolveControllerFn } from './utils.js';

const debugLog = debug('ee-core:socket:ipcServer');

/**
 * IpcServer - IPC server
 *
 * Traverses the controller object tree and registers ipcMain channel handlers for each exported method.
 * Uses recursive loop() to traverse nested controller directory structures.
 */
export class IpcServer {
  /** Channel separator, default '/' */
  channelSeparator: string;
  /** Controller directory name (used to generate property path prefix) */
  directory: string;

  constructor() {
    this.channelSeparator = getConfig().mainServer.channelSeparator || '/';
    this.directory = 'controller';
    this.init();
  }

  /**
   * Initialize: traverse controller tree and register all IPC channels
   */
  init(): void {
    const controller = getController();
    this.loop(controller, this.directory);
  }

  /**
   * Recursively traverse the controller object tree
   *
   * Distinguished by EXPORTS symbol marker:
   * - Objects with EXPORTS marker → leaf nodes (controller method collections), call register()
   * - Objects without marker → intermediate nodes (directory/namespace), continue recursion
   *
   * @param obj - Current object being traversed
   * @param pathname - Current property path
   */
  loop(obj: Record<string, unknown>, pathname: string): void {
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key === 'constructor') continue;

      const subObj = obj[key];
      const propertyChain = pathname + '.' + key;
      // EXPORTS symbol marker indicates this is a controller method collection (leaf node)
      if (subObj && (subObj as Record<symbol, unknown>)[EXPORTS] === true) {
        this.register(subObj as Record<string, unknown>, propertyChain);
      } else if (typeof subObj === 'object') {
        this.loop(subObj as Record<string, unknown>, propertyChain);
      }
    }
  }

  /**
   * Register controller methods as IPC channel handlers
   *
   * Registers two handlers for each method:
   * 1. ipcMain.on (synchronous model): Sets event.returnValue, async methods return undefined
   * 2. ipcMain.handle (asynchronous model): Returns Promise, recommended
   *
   * @param exportObj - Controller method collection object
   * @param propertyChain - Property path (e.g., 'controller.user')
   */
  register(exportObj: Record<string, unknown>, propertyChain: string): void {
    const controller = getController();
    const keys = Object.keys(exportObj);
    for (const key of keys) {
      const tmpChannel = `${propertyChain}.${key}`;
      const channel = tmpChannel.split('.').join(this.channelSeparator);
      debugLog('[register] channel %s', channel);

      // send/on model (synchronous)
      // ⚠️ ipcMain.on + event.returnValue only supports synchronous.
      // Async controller methods are incompatible with this model; use invoke/handle model instead.
      ipcMain.on(channel, (event, params) => {
        try {
          const fn = resolveControllerFn(controller, channel, this.channelSeparator);
          if (!fn) return;
          const result = fn.call(controller, params, event);
          if (result instanceof Promise) {
            coreLogger.warn(`[socket/IpcServer] async controller method '${channel}' called via send/on model (sendSync). Use invoke/handle model instead.`);
            event.returnValue = undefined;
          } else {
            event.returnValue = result;
          }
        } catch (e) {
          coreLogger.error('[socket/IpcServer] send/on throw error:', e);
        }
      });

      // invoke/handle model (asynchronous, recommended)
      ipcMain.handle(channel, async (event, params) => {
        try {
          const fn = resolveControllerFn(controller, channel, this.channelSeparator);
          if (!fn) return undefined;
          return await fn.call(controller, params, event);
        } catch (e) {
          coreLogger.error('[socket/IpcServer] invoke/handle throw error:', e);
          return undefined;
        }
      });
    }
  }
}
