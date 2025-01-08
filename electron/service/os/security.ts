import { logger } from 'ee-core/log';
import { app as electronApp } from 'electron';

/**
 * SecurityService class for handling security-related operations
 */
class SecurityService {
  /**
   * Create and configure the security service
   */
  create(): void {
    logger.info('[security] load');
    const runWithDebug = process.argv.find((e) => {
      const isHasDebug = e.includes('--inspect') || e.includes('--inspect-brk') || e.includes('--remote-debugging-port');
      return isHasDebug;
    });

    // Do not allow remote debugging
    if (runWithDebug) {
      logger.error('[error] Remote debugging is not allowed, runWithDebug:', runWithDebug);
      electronApp.quit();
    }
  }
}
SecurityService.toString = () => '[class SecurityService]';
const securityService = new SecurityService();

export { 
  SecurityService,  
  securityService
};