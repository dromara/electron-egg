/**
 * @module socket/ipcServer
 * @description Electron IPC 服务器。将控制器方法注册为 IPC 通道处理器，
 * 使渲染进程能通过 ipcRenderer 调用主进程的控制器方法。
 *
 * 支持两种通信模型：
 * - send/on 模型（同步）：渲染进程使用 ipcRenderer.sendSync()，
 *   主进程通过 event.returnValue 返回结果。
 *   ⚠️ 仅支持同步控制器方法，异步方法会返回 undefined 并输出警告。
 *
 * - invoke/handle 模型（异步）：渲染进程使用 ipcRenderer.invoke()，
 *   主进程通过 ipcMain.handle() 返回 Promise。
 *   ✅ 推荐使用此模型，支持同步和异步控制器方法。
 *
 * 通道命名规则：将控制器路径中的 '.' 替换为 channelSeparator（默认 '/'）
 * 例如：controller.user.add → controller/user/add
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
 * IpcServer IPC 服务器
 *
 * 遍历控制器对象树，为每个导出方法注册 ipcMain 通道处理器。
 * 使用递归 loop() 遍历嵌套的控制器目录结构。
 */
export class IpcServer {
  /** 通道分隔符，默认 '/' */
  channelSeparator: string;
  /** 控制器目录名（用于生成属性路径前缀） */
  directory: string;

  constructor() {
    this.channelSeparator = getConfig().mainServer.channelSeparator || '/';
    this.directory = 'controller';
    this.init();
  }

  /**
   * 初始化：遍历控制器树并注册所有 IPC 通道
   */
  init(): void {
    const controller = getController();
    this.loop(controller, this.directory);
  }

  /**
   * 递归遍历控制器对象树
   *
   * 通过 EXPORTS symbol 标记区分：
   * - 带有 EXPORTS 标记的对象 → 叶子节点（控制器方法集合），调用 register()
   * - 不带标记的对象 → 中间节点（目录/命名空间），继续递归
   *
   * @param obj - 当前遍历的对象
   * @param pathname - 当前属性路径
   */
  loop(obj: Record<string, unknown>, pathname: string): void {
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (key === 'constructor') continue;

      const subObj = obj[key];
      const propertyChain = pathname + '.' + key;
      // EXPORTS symbol 标记表示这是控制器方法集合（叶子节点）
      if (subObj && (subObj as Record<symbol, unknown>)[EXPORTS] === true) {
        this.register(subObj as Record<string, unknown>, propertyChain);
      } else if (typeof subObj === 'object') {
        this.loop(subObj as Record<string, unknown>, propertyChain);
      }
    }
  }

  /**
   * 注册控制器方法为 IPC 通道处理器
   *
   * 为每个方法注册两种处理器：
   * 1. ipcMain.on（同步模型）：设置 event.returnValue，异步方法返回 undefined
   * 2. ipcMain.handle（异步模型）：返回 Promise，推荐使用
   *
   * @param exportObj - 控制器方法集合对象
   * @param propertyChain - 属性路径（如 'controller.user'）
   */
  register(exportObj: Record<string, unknown>, propertyChain: string): void {
    const controller = getController();
    const keys = Object.keys(exportObj);
    for (const key of keys) {
      const tmpChannel = `${propertyChain}.${key}`;
      const channel = tmpChannel.split('.').join(this.channelSeparator);
      debugLog('[register] channel %s', channel);

      // send/on 模型（同步）
      // ⚠️ ipcMain.on + event.returnValue 仅支持同步。
      // 异步控制器方法与此模型不兼容，需使用 invoke/handle 模型。
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

      // invoke/handle 模型（异步，推荐）
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
