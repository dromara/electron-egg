import fs from 'fs';
import path from 'path';
import {
  app as electronApp, dialog, shell, Notification, 
} from 'electron';
import { windowService } from '../service/os/window';

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
  messageShow(): string {
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
  messageShowConfirm(): string {
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
  selectFolder(): string | null {
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
  openDirectory(args: { id: string }): boolean {
    const { id } = args;
    if (!id) {
      return false;
    }
    let dir = '';
    if (path.isAbsolute(id)) {
      dir = id;
    } else {
      dir = electronApp.getPath(id as any);
    }

    shell.openPath(dir);
    return true;
  }

  /**
   * Select Picture
   */
  selectPic(): string | null {
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
  createWindow(args: any): number {
    const wcid = windowService.createWindow(args);
    return wcid;
  }
  
  /**
   * Get Window contents id
   */
  getWCid(args: { windowName: string }): number {
    const wcid = windowService.getWCid(args);
    return wcid;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window1ToWindow2(args: any, event: any): void {
    windowService.communicate(args, event);
    return;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window2ToWindow1(args: any, event: any): void {
    windowService.communicate(args, event);
    return;
  }

  /**
   * Create system notifications
   */
  sendNotification(args: { title?: string; subtitle?: string; body?: string; silent?: boolean }, event: any): boolean | string {
    const { title, subtitle, body, silent} = args;

    if (!Notification.isSupported()) {
      return '当前系统不支持通知';
    }

    let options: any = {};
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
(OsController as any).toString = () => '[class OsController]';

export default OsController;
