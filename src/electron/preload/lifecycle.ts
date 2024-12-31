import { getConfig, Config } from 'ee-core/config';
import { getMainWindow } from 'ee-core/electron';

class Lifecycle {
  /**
   * Core app has been loaded
   */
  async ready(): Promise<void> {
    // Do some things
    console.log('[lifecycle] ready');
  }

  /**
   * Electron app is ready
   */
  async electronAppReady(): Promise<void> {
    // Do some things
    console.log('[lifecycle] electron-app-ready');
  }

  /**
   * Main window has been loaded
   */
  async windowReady(): Promise<void> {
    console.log('[lifecycle] window-ready');
    // Delay loading, no white screen
    const config: Config = getConfig();
    const { windowsOption } = config;
    if (windowsOption.show === false) {
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
    console.log('[lifecycle] before-close');
  }
}

// 设置类的toString方法，虽然在TypeScript中不常见
Lifecycle.toString = () => '[class Lifecycle]';

export { Lifecycle };