const Log = require('ee-core/log');
const EE = require('ee-core/ee');

/**
 * 安全插件
 * @class
 */
class SecurityAddon {

  constructor() {
  }

  /**
   * 创建
   */
  create () {
    Log.info('[addon:security] load');
    const { CoreApp } = EE;
    const runWithDebug = process.argv.find(function(e){
      let isHasDebug = e.includes("--inspect") || e.includes("--inspect-brk") || e.includes("--remote-debugging-port");
      return isHasDebug;
    })
  
    // 不允许远程调试
    if (runWithDebug) {
      Log.error('[error] Remote debugging is not allowed,  runWithDebug:', runWithDebug);
      CoreApp.appQuit();
    }
  }
}

SecurityAddon.toString = () => '[class SecurityAddon]';
module.exports = SecurityAddon;