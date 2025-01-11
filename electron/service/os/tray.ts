import { Tray, Menu } from 'electron';
import path from 'path';
import { isDev, getBaseDir } from 'ee-core/ps';
import { logger } from 'ee-core/log';
import { app as electronApp } from 'electron';
import { getMainWindow, getCloseAndQuit, setCloseAndQuit } from 'ee-core/electron';

/**
 * 托盘
 * @class
 */
class TrayService {
  tray: Tray | null;
  config: {
    title: string;
    icon: string;
  }

  constructor() {
    this.tray = null;
    this.config = {
      title: 'electron-egg',
      icon: '/public/images/tray.png',
    }
  }

  /**
   * Create the tray icon
   */
  create () {
    logger.info('[tray] load');

    const cfg = this.config;
    const mainWindow = getMainWindow();

    // tray icon
    const iconPath = path.join(getBaseDir(), cfg.icon);
  
    // Tray menu items
    const trayMenuTemplate = [
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
  
    // Set a flag to minimize to tray instead of closing
    setCloseAndQuit(false);
    mainWindow.on('close', (event: any) => {
      if (getCloseAndQuit()) {
        return;
      }
      mainWindow.hide();
      event.preventDefault();
    });
    
    // Initialize the tray
    this.tray = new Tray(iconPath);
    this.tray.setToolTip(cfg.title);
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    this.tray.setContextMenu(contextMenu);
    // Show the main window when the tray icon is clicked
    this.tray.on('click', () => {
      mainWindow.show()
    })
  }
}
TrayService.toString = () => '[class TrayService]';
const trayService = new TrayService();

export {
  trayService
}