'use strict';

const { logger } = require('ee-core/log');
const { app: electronApp } = require('electron');

/**
 * 安全
 * @class
 */
class SecurityService {

  /**
   * 创建
   */
  create () {
    logger.info('[security] load');
    const runWithDebug = process.argv.find(function(e){
      let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
      return isHasDebug;
    })
  
    // 不允许远程调试
    if (runWithDebug) {
      logger.error('[error] Remote debugging is not allowed,  runWithDebug:', runWithDebug);
      electronApp.quit();
    }
  }
}
SecurityService.toString = () => '[class SecurityService]';

module.exports = {
  securityService: new SecurityService()
};