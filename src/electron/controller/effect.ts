import { dialog } from 'electron';
import _ from 'lodash';
import { getMainWindow } from 'ee-core/electron/window';

/**
 * EffectController class
 */
class EffectController {
  /**
   * Select file
   */
  selectFile(): string | null {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile']
    });

    if (_.isEmpty(filePaths)) {
      return null;
    }

    return filePaths[0];
  }

  /**
   * Login window
   */
  loginWindow(args: { width?: number; height?: number }): void {
    const { width, height } = args;
    const win = getMainWindow();

    const size = {
      width: width || 400,
      height: height || 300
    };
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }

  /**
   * Restore window
   */
  restoreWindow(args: { width?: number; height?: number }): void {
    const { width, height } = args;
    const win = getMainWindow();

    const size = {
      width: width || 980,
      height: height || 650
    };
    win.setSize(size.width, size.height);
    win.setResizable(true);
    win.center();
    win.show();
    win.focus();
  }
}

// 设置类的toString方法，虽然在TypeScript中不常见
EffectController.toString = () => '[class EffectController]';

// 默认导出类
export default EffectController;