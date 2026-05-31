import { logger } from 'ee-core/log';
import { app as electronApp } from 'electron';

/**
 * 安全
 * @class
 */
class SecurityService {
  static toString() { return '[class SecurityService]'; }

  /**
   * 创建
   */
  create (): void {
    logger.info('[security] load');
    const runWithDebug = process.argv.find(function(e: string){
      let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
      return isHasDebug;
    })

    // 生产环境不允许远程调试
    if (runWithDebug && process.env.NODE_ENV === 'prod') {
      logger.error('[error] Remote debugging is not allowed,  runWithDebug:', runWithDebug);
      electronApp.quit();
    }
  }
}
export const securityService = new SecurityService();
