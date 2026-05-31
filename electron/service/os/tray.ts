import { Tray, Menu, app as electronApp, BrowserWindow } from 'electron';
import path from 'path';
import { getBaseDir } from 'ee-core/ps';
import { logger } from 'ee-core/log';
import { getMainWindow, getCloseAndQuit, setCloseAndQuit } from 'ee-core/electron';

/**
 * 托盘
 * @class
 */
class TrayService {
  private tray: Tray | null;
  private config: { title: string; icon: string };

  constructor() {
    this.tray = null;
    this.config = {
      title: 'electron-egg',
      icon: '/public/images/tray.png'
    }
  }

  /**
   * 创建托盘
   */
  create (): void {
    logger.info('[tray] load');

    const cfg = this.config;
    const mainWindow = getMainWindow();

    // tray icon
    const iconPath = path.join(getBaseDir(), cfg.icon);
  
    // 托盘菜单功能列表
    const trayMenuTemplate: any[] = [
      {
        label: '显示',
        click: function () {
          mainWindow.show();
        }
      },
      {
        label: '退出',
        click: function () {
          electronApp.quit();
        }
      }
    ]
  
    // 设置一个标识，点击关闭，最小化到托盘
    setCloseAndQuit(false);
    mainWindow.on('close', (event: any) => {
      if (getCloseAndQuit()) {
        return;
      }
      mainWindow.hide();
      event.preventDefault();
    });
    
    // 实例化托盘
    this.tray = new Tray(iconPath);
    this.tray.setToolTip(cfg.title);
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(contextMenu);
    // 左键单击的时候能够显示主窗口
    this.tray.on('click', () => {
      mainWindow.show()
    })
  }
}
(TrayService as any).toString = () => '[class TrayService]';

export {
  trayService: new TrayService()
};
