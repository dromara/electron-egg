'use strict';

const { Controller } = require('ee-core');
const { dialog } = require('electron');
const _ = require('lodash');
const CoreWindow = require('ee-core/electron/window');

/**
 * 特效 - 功能demo
 * @class
 */
class EffectController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 选择文件
   */
  selectFile() {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile']
    });

    if (_.isEmpty(filePaths)) {
      return null
    }

    return filePaths[0];
  }

  /**
   * login window
   */
  loginWindow(args) {
    const { width, height } = args;
    const win = CoreWindow.getMainWindow();
    
    const size = {
      width: width || 400,
      height: height || 300
    }
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }
  
  /**
   * restore window
   */
  restoreWindow(args) {
    const { width, height } = args;
    const win = CoreWindow.getMainWindow();

    const size = {
      width: width || 980,
      height: height || 650
    }
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }  
}

EffectController.toString = () => '[class EffectController]';
module.exports = EffectController;  