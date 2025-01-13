'use strict';

const fs = require('fs');
const path = require('path');
const {
  app: electronApp, dialog, shell, Notification, 
} = require('electron');
const { windowService } = require('../service/os/window');

/**
 * example
 * @class
 */
class OsController {

  /**
   * All methods receive two parameters
   * @param args Parameters transmitted by the frontend
   * @param event - Event are only available during IPC communication. For details, please refer to the controller documentation
   */

  /**
   * Message prompt dialog box
   */
  messageShow() {
    dialog.showMessageBoxSync({
      type: 'info', // "none", "info", "error", "question" 或者 "warning"
      title: 'Custom Title',
      message: 'Customize message content',
      detail: 'Other additional information'
    })
  
    return 'Opened the message box';
  }

  /**
   * Message prompt and confirmation dialog box
   */
  messageShowConfirm() {
    const res = dialog.showMessageBoxSync({
      type: 'info',
      title: 'Custom Title',
      message: 'Customize message content',
      detail: 'Other additional information',
      cancelId: 1, // Index of buttons used to cancel dialog boxes
      defaultId: 0, // Set default selected button
      buttons: ['confirm', 'cancel'], 
    })
    let data = (res === 0) ? 'click the confirm button' : 'click the cancel button';
  
    return data;
  }

  /**
   * Select Directory
   */
  selectFolder() {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openDirectory', 'createDirectory']
    });

    if (!filePaths) {
      return null
    }

    return filePaths[0];
  } 

  /**
   * open directory
   */
  openDirectory(args) {
    const { id } = args;
    if (!id) {
      return false;
    }
    let dir = '';
    if (path.isAbsolute(id)) {
      dir = id;
    } else {
      dir = electronApp.getPath(id);
    }

    shell.openPath(dir);
    return true;
  }

  /**
   * Select Picture
   */
  selectPic() {
    const filePaths = dialog.showOpenDialogSync({
      title: 'select pic',
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      ]
    });
    if (!filePaths) {
      return null
    }
    
    try {
      const data = fs.readFileSync(filePaths[0]);
      const pic =  'data:image/jpeg;base64,' + data.toString('base64');
      return pic;
    } catch (err) {
      console.error(err);
      return null;
    }
  }   

  /**
   * Open a new window
   */
  createWindow(args) {
    const wcid = windowService.createWindow(args);
    return wcid;
  }
  
  /**
   * Get Window contents id
   */
  getWCid(args) {
    const wcid = windowService.getWCid(args);
    return wcid;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window1ToWindow2(args, event) {
    windowService.communicate(args, event);
    return;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window2ToWindow1(args, event) {
    windowService.communicate(args, event);
    return;
  }

  /**
   * Create system notifications
   */
  sendNotification(args, event) {
    const { title, subtitle, body, silent} = args;

    if (!Notification.isSupported()) {
      return '当前系统不支持通知';
    }

    let options = {};
    if (!title) {
      options.title = title;
    }
    if (!subtitle) {
      options.subtitle = subtitle;
    }
    if (!body) {
      options.body = body;
    }
    if (!silent) {
      options.silent = silent;
    }
    windowService.createNotification(options, event);

    return true
  }   
}
OsController.toString = () => '[class OsController]';

module.exports = OsController;  