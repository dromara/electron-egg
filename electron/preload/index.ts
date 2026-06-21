/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

import { logger } from 'ee-core/log';
 
export function preload(): void {
  logger.info('[preload] load 1');
}