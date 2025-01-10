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
  }

  /**
   * Main window has been loaded
   */
  async windowReady(): Promise<void> {
    logger.info('[lifecycle] window-ready');
    // Delay loading, no white screen
    const config = getConfig();
    const { windowsOption } = config;
    if (windowsOption?.show === false) {
      const win = getMainWindow();
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