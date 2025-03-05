/**
 * Preload module, this file will be loaded when the program starts.
 */

import { logger } from 'ee-core/log';
import { trayService } from '../service/os/tray';
import { securityService } from '../service/os/security';
import { autoUpdaterService } from '../service/os/auto_updater';
import { crossService } from '../service/cross';
import { sqlitedbService } from '../service/database/sqlitedb';

function preload(): void {
  // Example feature module, optional to use and modify
  logger.info('[preload] load 5');
  trayService.create();
  securityService.create();
  autoUpdaterService.create();

  // go server
  crossService.createGoServer();

  // init sqlite db
  sqlitedbService.init();
}

/**
 * Entry point of the preload module
 */
export { preload };