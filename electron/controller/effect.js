'use strict';

const { dialog } = require('electron');
const { getMainWindow } = require('ee-core/electron');

/**
 * effect - demo
 * @class
 */
class EffectController {

  /**
   * select file
   */
  selectFile() {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile']
    });

    if (!filePaths) {
      return null
    }

    return filePaths[0];
  }

  /**
   * login window
   */
  loginWindow(args) {
    const { width, height } = args;
    const win = getMainWindow();
    
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
    const win = getMainWindow();

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