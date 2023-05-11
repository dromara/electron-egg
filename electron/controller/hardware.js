'use strict';

const { Controller } = require('ee-core');
const path = require('path');
const Ps = require('ee-core/ps');
const Electron = require('ee-core/electron');

/**
 * 硬件设备 - 功能demo
 * @class
 */
class HardwareController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 获取打印机列表
   */
  getPrinterList () {

    //主线程获取打印机列表
    const list = Electron.mainWindow.webContents.getPrinters();

    return list;
  }  

  /**
   * 打印
   */
  print (args, event) {
    const { view, deviceName } = args;
    let content = null;
    if (view.type == 'html') {
      content = path.join('file://', Ps.getHomeDir(), view.content)
    } else {
      content = view.content;
    }

    const addonWindow = this.app.addon.window;
    let opt = {
      title: 'printer window',
      x: 10,
      y: 10,
      width: 980, 
      height: 650 
    }
    const name = 'window-printer';
    const printWindow = addonWindow.create(name, opt);

    printWindow.loadURL(content);
    printWindow.webContents.once('did-finish-load', () => {
      // 页面完全加载完成后，开始打印
      printWindow.webContents.print({
        silent: false, // 显示打印对话框
        printBackground: true,
        deviceName,
      }, (success, failureReason) => {
        const channel = 'controller.hardware.printStatus';
        event.reply(`${channel}`, { success, failureReason });
        printWindow.close();
      });
    });

    return true;
  }  
}

HardwareController.toString = () => '[class HardwareController]';
module.exports = HardwareController;  