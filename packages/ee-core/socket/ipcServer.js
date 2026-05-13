'use strict';

const debug = require('debug')('ee-core:socket:ipcServer');
const is = require('is-type-of');
const { ipcMain } = require('electron');
const { coreLogger } = require('../log');
const { getController } = require('../controller');
const { EXPORTS } = require('../core/loader/file_loader');
const { getConfig } = require('../config');

class IpcServer {
  constructor () {
    const { mainServer } = getConfig();
    this.channelSeparator = mainServer.channelSeparator;
    this.directory = 'controller';
    this.init();
  }
  init() {
    const controller = getController();
    this.loop(controller, this.directory);
  }

  loop(obj, pathname) {
    const keys = Object.keys(obj);
    // debug("[loop] keys: %j", keys);
    for (const key of keys) {
      if (key === 'constructor') {
        continue;
      }
      let subObj = obj[key];
      let propertyChain = pathname + '.' + key;
      if (subObj && subObj[EXPORTS] === true) {
        this.register(subObj, propertyChain);
      } else if (typeof subObj === 'object') {
        // 如果子对象依然是对象，则递归调用继续判断
        this.loop(subObj, propertyChain);
      }
    }
  }

  register(exportObj, propertyChain) {
    const controller = getController();
    const keys = Object.keys(exportObj);
    for (const key of keys) {
      // Supports two types of routing separators
      // channel: controller.file.function | controller/file/function
      const tmpChannel = `${propertyChain}.${key}`;
      const channel = tmpChannel.split('.').join(this.channelSeparator);
      debug('[register] channel %s', channel);

      // send/on model
      ipcMain.on(channel, async (event, params) => {
        try {
          const fn = this.findFn(controller, channel);
          const result = await fn.call(controller, params, event);

          event.returnValue = result;
          event.reply(`${channel}`, result);
        } catch(e) {
          coreLogger.error('[ee-core] [socket/IpcServer] send/on throw error:', e);
        }
      });

      // invoke/handle model
      ipcMain.handle(channel, async (event, params) => {
        try {
          const fn = this.findFn(controller, channel);
          const result = await fn.call(controller, params, event);

          return result;
        } catch(e) {
          coreLogger.error('[ee-core] [socket/IpcServer] invoke/handle throw error:', e);
        }
      });
    }
  }

  findFn (controller, c) {
    try {
      // 找函数
      const cmd = c;
      let fn = null;
      if (is.string(cmd)) {
        const actions = cmd.split(this.channelSeparator);
        debug('[findFn] channel %o', actions);
        let obj = { controller };
        actions.forEach(key => {
          obj = obj[key];
          if (!obj) throw new Error(`class or function '${key}' not exists`);
        });
        fn = obj;
      }
      if (!fn) throw new Error('function not exists');
      
      return fn;
    } catch (err) {
      coreLogger.error('[ee-core] [socket/IpcServer] throw error:', err);
    }
    return null;
  }

}

module.exports = {
  IpcServer
};