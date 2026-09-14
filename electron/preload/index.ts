/*************************************************
 ** preload为预加载模块，该文件将会在程序启动时加载 **
 *************************************************/

import { logger } from 'ee-core/log';
import { trayService } from '../service/os/tray';
import { securityService } from '../service/os/security';
import { crossService } from '../service/cross';
import { sqlitedbService } from '../service/database/sqlitedb';
import { windowService } from '../service/os/window';
// import { printEnvTree, probeGoExec } from '../service/debug';

export async function preload(): Promise<void> {
  // 示例功能模块，可选择性使用和修改
  logger.info('[preload] load 5');
  windowService.init();
  trayService.init();
  securityService.init();
  // init sqlite db (lazy loads better-sqlite3 on first use)
  await sqlitedbService.init();

  // 调试：打印真机运行时路径与安装包目录树（放在 go 启动之前，闪退也能留下日志；排查完删除）
  // try {
  //   printEnvTree();
  // } catch (e) {
  //   logger.info('[dirs] printEnvTree failed:', e instanceof Error ? e.message : e);
  // }

  // 调试：探测 goapp 执行权限（bundle 路径 vs 可写目录），定位 spawn EACCES；排查完删除
  // try {
  //   await probeGoExec();
  // } catch (e) {
  //   logger.info('[exec-probe] failed:', e instanceof Error ? e.message : e);
  // }

  // go server
  crossService.createGoServer();
}


