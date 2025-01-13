'use strict';

const { logger } = require('ee-core/log');
const { getConfig } = require('ee-core/config');
const { getMainWindow } = require('ee-core/electron');

class Lifecycle {

  /**
   * core app have been loaded
   */
  async ready() {
    logger.info('[lifecycle] ready');
  }

  /**
   * electron app ready
   */
  async electronAppReady() {
    logger.info('[lifecycle] electron-app-ready');
  }

  /**
   * main window have been loaded
   */
  async windowReady() {
    logger.info('[lifecycle] window-ready');
    // 延迟加载，无白屏
    const { windowsOption } = getConfig();
    if (windowsOption.show == false) {
      const win = getMainWindow();
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
      })
    }
  }

  /**
   * before app close
   */  
  async beforeClose() {
    logger.info('[lifecycle] before-close');
  }
}
Lifecycle.toString = () => '[class Lifecycle]';

module.exports = {
  Lifecycle
};