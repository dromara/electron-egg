import { app as electronApp, screen } from 'electron';
import { logger } from 'ee-core/log';
import { getConfig } from 'ee-core/config';
import { getMainWindow } from 'ee-core/electron';

class Lifecycle {
  /**
   * Core app has been loaded
   */
  async ready(): Promise<void> {
    logger.info('[lifecycle] ready');
  }

  /**
   * Electron app is ready
   */
  async electronAppReady(): Promise<void> {
    logger.info('[lifecycle] electron-app-ready');

    // When double clicking the icon, display the opened window
    electronApp.on('second-instance', () => {
      const win = getMainWindow();
      if (win.isMinimized()) {
        win.restore();
      }
      win.show();
      win.focus();
    });    
  }

  /**
   * Main window has been loaded
   */
  async windowReady(): Promise<void> {
    logger.info('[lifecycle] window-ready');

    const win = getMainWindow();

    // The window is centered and scaled proportionally
    // Obtain the size information of the main screen, calculate the width and height of the window as a percentage of the screen, 
    // and calculate the coordinates of the upper left corner when the window is centered
    const mainScreen = screen.getPrimaryDisplay();
    const { width, height } = mainScreen.workAreaSize;
    const windowWidth = Math.floor(width * 0.6);
    const windowHeight = Math.floor(height * 0.8);
    const x = Math.floor((width - windowWidth) / 2);
    const y = Math.floor((height - windowHeight) / 2);
    win.setBounds({ x, y, width: windowWidth, height: windowHeight });

    // Delay loading, no white screen
    const config = getConfig();
    const { windowsOption } = config;
    if (windowsOption?.show == false) {
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
      });
    }
  }

  /**
   * Before app close
   */
  async beforeClose(): Promise<void> {
    logger.info('[lifecycle] before-close');
  }
}
Lifecycle.toString = () => '[class Lifecycle]';

export { Lifecycle };