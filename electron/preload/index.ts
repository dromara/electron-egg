/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

import { logger } from 'ee-core/log';
import { trayService } from '../service/os/tray';
import { securityService } from '../service/os/security';
import { autoUpdaterService } from '../service/os/auto_updater';
import { crossService } from '../service/cross';
import { sqlitedbService } from '../service/database/sqlitedb';

export function preload(): void {
  // 示例功能模块，可选择性使用和修改
  logger.info('[preload] load 5');
  trayService.create();
  securityService.create();
  autoUpdaterService.create();

  // go server
  crossService.createGoServer();

  // init sqlite db
  sqlitedbService.init();
}


