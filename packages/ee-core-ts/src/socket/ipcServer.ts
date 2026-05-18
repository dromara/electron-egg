import debug from 'debug';
import is from 'is-type-of';
import { ipcMain } from 'electron';
import { coreLogger } from '../log/index.js';
import { getController } from '../controller/index.js';
import { EXPORTS } from '../core/loader/file_loader.js';
import { getConfig } from '../config/index.js';

const log = debug('ee-core:socket:ipcServer');

export class IpcServer {
  channelSeparator: string;
  directory: string;

  constructor() {
    const { mainServer } = getConfig() as { mainServer: { channelSeparator: string } };
    this.channelSeparator = mainServer.channelSeparator;
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
      log('[register] channel %s', channel);

      ipcMain.on(channel, async (event, params) => {
        try {
          const fn = this.findFn(controller, channel);
          if (!fn) return;
          const result = await fn.call(controller, params, event);
          event.returnValue = result;
          event.reply(channel, result);
        } catch (e) {
          coreLogger.error('[ee-core] [socket/IpcServer] send/on throw error:', e);
        }
      });

      ipcMain.handle(channel, async (event, params) => {
        try {
          const fn = this.findFn(controller, channel);
          if (!fn) return undefined;
          return await fn.call(controller, params, event);
        } catch (e) {
          coreLogger.error('[ee-core] [socket/IpcServer] invoke/handle throw error:', e);
        }
      });
    }
  }

  findFn(controller: Record<string, unknown>, c: string): ((...args: unknown[]) => unknown) | null {
    try {
      const cmd = c;
      let fn: ((...args: unknown[]) => unknown) | null = null;
      if (is.string(cmd)) {
        const actions = cmd.split(this.channelSeparator);
        log('[findFn] channel %o', actions);
        let obj: Record<string, unknown> = { controller };
        actions.forEach((key) => {
          obj = obj[key] as Record<string, unknown>;
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj as unknown as (...args: unknown[]) => unknown;
      }
      if (!fn) throw new Error('function not exists');
      return fn;
    } catch (err) {
      coreLogger.error('[ee-core] [socket/IpcServer] throw error:', err);
    }
    return null;
  }
}
