const electronApp = require('electron').app;

/**
 * 唤醒插件
 * @class
 */
class AwakenAddon {

  constructor(app) {
    this.app = app;
    this.cfg = app.config.addons.awaken;
    this.protocol = '';
  }

  /**
   * 创建
   */
  create () {
    this.app.console.info('[addon:awaken] load');

    this.protocol = this.cfg.protocol;
  
    electronApp.setAsDefaultProtocolClient(this.protocol);
  
    const self = this;
    this.handleArgv(process.argv);
    electronApp.on('second-instance', (event, argv) => {
      if (process.platform === 'win32') {
        self.handleArgv(argv)
      }
    })
  
    // 仅用于macOS
    electronApp.on('open-url', (event, urlStr) => {
      self.handleUrl(urlStr)
    })
  }

  /**
   * 参数处理
   */  
  handleArgv(argv) {
    const offset = electronApp.isPackaged ? 1 : 2;
    const url = argv.find((arg, i) => i >= offset && arg.startsWith(this.protocol));
    this.handleUrl(url)
  }

  /**
   * url解析
   */
  handleUrl(awakeUrlStr) {
    if (!awakeUrlStr || awakeUrlStr.length === 0) {
      return
    }
    const {hostname, pathname, search} = new URL(awakeUrlStr);
    let awakeUrlInfo = {
      urlStr: awakeUrlStr,
      urlHost: hostname,
      urlPath: pathname,
      urlParams: search && search.slice(1)
    }
    this.app.logger.info('[addon:awaken] awakeUrlInfo:', awakeUrlInfo);
  }
}

AwakenAddon.toString = () => '[class AwakenAddon]';
module.exports = AwakenAddon;