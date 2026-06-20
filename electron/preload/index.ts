/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

import { logger } from 'ee-core/log';
import { trayService } from '../service/os/tray';
import { securityService } from '../service/os/security';
import { crossService } from '../service/cross';
import { sqlitedbService } from '../service/database/sqlitedb';
import { windowService } from '../service/os/window';

export function preload(): void {
  // 示例功能模块，可选择性使用和修改
  logger.info('[preload] load 5');
  windowService.init();
  trayService.init();
  securityService.init();
  // init sqlite db
  //sqlitedbService.init();
  // go server
  //crossService.createGoServer();
}


