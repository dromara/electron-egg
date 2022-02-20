'use strict';

const { app } = require('electron');

/**
 * 应用唤醒模块
 */
module.exports = {

  /**
   * 安装
   */     
  install (eeApp) {
    console.log('[preload] load awaken module');
    const protocolInfo = eeApp.config.awakeProtocol;
    const PROTOCOL = protocolInfo.protocol;
  
    app.setAsDefaultProtocolClient(PROTOCOL);
  
    handleArgv(process.argv);
  
    app.on('second-instance', (event, argv) => {
      if (process.platform === 'win32') {
        handleArgv(argv)
      }
    })
  
    // 仅用于macOS
    app.on('open-url', (event, urlStr) => {
      handleUrl(urlStr)
    })
  
    // 参数处理
    function handleArgv(argv) {
      const offset = app.isPackaged ? 1 : 2;
      const url = argv.find((arg, i) => i >= offset && arg.startsWith(PROTOCOL));
      handleUrl(url)
    }

    // url解析
    function handleUrl(awakeUrlStr) {
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
      console.log('[awaken] [handleUrl] awakeUrlInfo:', awakeUrlInfo);
    }
  }
}

