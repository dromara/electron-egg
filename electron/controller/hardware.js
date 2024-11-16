'use strict';

const { Controller } = require('ee-core');
const path = require('path');
const Ps = require('ee-core/ps');
const CoreWindow = require('ee-core/electron/window');
const Addon = require('ee-core/addon');

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
  async getPrinterList () {

    //主线程获取打印机列表
    const win = CoreWindow.getMainWindow();
    const list = await win.webContents.getPrintersAsync();

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

    let opt = {
      title: 'printer window',
      x: 10,
      y: 10,
      width: 980, 
      height: 650 
    }
    const name = 'window-printer';
    const printWindow = Addon.get('window').create(name, opt);

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