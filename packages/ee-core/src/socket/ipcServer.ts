import debug from 'debug';
import { ipcMain } from 'electron';
import { coreLogger } from '../log/index.js';
import { getController } from '../controller/index.js';
import { EXPORTS } from '../core/loader/file_loader.js';
import { getConfig } from '../config/index.js';
import { resolveControllerFn } from './utils.js';

const debugLog = debug('ee-core:socket:ipcServer');

export class IpcServer {
  channelSeparator: string;
  directory: string;

  constructor() {
    this.channelSeparator = getConfig().mainServer.channelSeparator || '/';
    this.directory = 'controller';
    this.init();
  }

  init(): void {
    const controller = getController();
    this.loop(controller, this.directory);
  }

  loop(obj: Record<string, unknown>, pathname: string): void {
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key === 'constructor') continue;

      const subObj = obj[key];
      const propertyChain = pathname + '.' + key;
      if (subObj && (subObj as Record<symbol, unknown>)[EXPORTS] === true) {
        this.register(subObj as Record<string, unknown>, propertyChain);
      } else if (typeof subObj === 'object') {
        this.loop(subObj as Record<string, unknown>, propertyChain);
      }
    }
  }

  register(exportObj: Record<string, unknown>, propertyChain: string): void {
    const controller = getController();
    const keys = Object.keys(exportObj);
    for (const key of keys) {
      const tmpChannel = `${propertyChain}.${key}`;
      const channel = tmpChannel.split('.').join(this.channelSeparator);
      debugLog('[register] channel %s', channel);

      // send/on model
      // Note: event.returnValue must be set synchronously in Electron.
      // If the controller method is async, we set returnValue to undefined
      // and send the result via event.reply() for the renderer to receive.
      ipcMain.on(channel, (event, params) => {
        try {
          const fn = resolveControllerFn(controller, channel, this.channelSeparator);
          if (!fn) return;
          const result = fn.call(controller, params, event);
          if (result instanceof Promise) {
            event.returnValue = undefined;
            result.then(
              (value) => { event.reply(channel, value); },
              (err: unknown) => { coreLogger.error('[socket/IpcServer] async on handler error:', err); }
            );
          } else {
            event.returnValue = result;
          }
        } catch (e) {
          coreLogger.error('[socket/IpcServer] send/on throw error:', e);
        }
      });

      // invoke/handle model
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
