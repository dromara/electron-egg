'use strict';

/**
 * 安全模块
 */

module.exports = {
  
  /**
   * 安装
   */  
  install (eeApp) {
    eeApp.logger.info('[preload] load security module');
    const runWithDebug = process.argv.find(function(e){
      let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
      return isHasDebug;
    })
  
    // 不允许远程调试
    if (runWithDebug) {
      eeApp.logger.error('[error] Remote debugging is not allowed,  runWithDebug:', runWithDebug);
      eeApp.appQuit();
    }
  }

}
