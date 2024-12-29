'use strict';

const { getConfig } = require('ee-core/config');
const { getMainWindow } = require('ee-core/electron');

class Lifecycle {

  /**
   * core app have been loaded
   */
  async ready() {
    // do some things
    console.log('[lifecycle] ready');
  }

  /**
   * electron app ready
   */
  async electronAppReady() {
    // do some things
    console.log('[lifecycle] electron-app-ready');
  }

  /**
   * main window have been loaded
   */
  async windowReady() {
    console.log('[lifecycle] window-ready');
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
    console.log('[lifecycle] before-close');
  }
}

Lifecycle.toString = () => '[class Lifecycle]';
module.exports = {
  Lifecycle
};