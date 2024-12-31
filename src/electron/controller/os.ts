import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import {
  app as electronApp, dialog, shell, Notification,
} from 'electron';
import { windowService } from '../service/os/window';

/**
 * OsController class
 */
class OsController {

  /**
   * Message prompt dialog box
   */
  messageShow(): string {
    dialog.showMessageBoxSync({
      type: 'info',
      title: 'Custom Title',
      message: 'Customize message content',
      detail: 'Other additional information',
    });

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
      cancelId: 1,
      defaultId: 0,
      buttons: ['confirm', 'cancel'],
    });
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

    if (_.isEmpty(filePaths)) {
      return null;
    }

    return filePaths[0];
  }

  /**
   * Open directory
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
      dir = electronApp.getPath(id);
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
    if (_.isEmpty(filePaths)) {
      return null;
    }

    try {
      const data = fs.readFileSync(filePaths[0]);
      const pic = 'data:image/jpeg;base64,' + data.toString('base64');
      return pic;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /**
   * Open a new window
   */
  createWindow(args: any): string {
    const wcid = windowService.createWindow(args);
    return wcid;
  }

  /**
   * Get Window contents id
   */
  getWCid(args: any): string | null {
    const wcid = windowService.getWCid(args);
    return wcid;
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window1ToWindow2(args: any, event: any): void {
    windowService.communicate(args, event);
  }

  /**
   * Realize communication between two windows through the transfer of the main process
   */
  window2ToWindow1(args: any, event: any): void {
    windowService.communicate(args, event);
  }

  /**
   * Create system notifications
   */
  sendNotification(args: { title?: string; subtitle?: string; body?: string; silent?: boolean }, event: any): boolean {
    if (!Notification.isSupported()) {
      return false;
    }

    let options = {};
    if (!_.isEmpty(args.title)) {
      options.title = args.title;
    }
    if (!_.isEmpty(args.subtitle)) {
      options.subtitle = args.subtitle;
    }
    if (!_.isEmpty(args.body)) {
      options.body = args.body;
    }
    if (!_.isEmpty(args.silent)) {
      options.silent = args.silent;
    }
    windowService.createNotification(options, event);

    return true;
  }
}

// 设置类的toString方法，虽然在TypeScript中不常见
OsController.toString = () => '[class OsController]';

// 默认导出类
export default OsController;