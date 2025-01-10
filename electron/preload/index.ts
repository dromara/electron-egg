/**
 * Preload module, this file will be loaded when the program starts.
 */

import { logger } from 'ee-core/log';
import { trayService } from '../service/os/tray';
import { securityService } from '../service/os/security';
import { autoUpdaterService } from '../service/os/auto_updater';

function preload(): void {
  // Example feature module, optional to use and modify
  logger.info('[preload] load 5');
  trayService.create();
  securityService.create();
  autoUpdaterService.create();
}

/**
 * Entry point of the preload module
 */
export { preload };