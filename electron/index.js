const { Application } = require('ee-core');
<<<<<<< HEAD
=======
const { app: electronApp } = require("electron");
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c

class Index extends Application {

  constructor() {
    super();
    // this === eeApp;
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things
<<<<<<< HEAD
=======
    electronApp.commandLine.appendSwitch('enable-webgl');
    electronApp.commandLine.appendSwitch("disable-web-security");
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
  }

  /**
   * electron app ready
   */
  async electronAppReady () {
    // do some things
  }

  /**
   * main window have been loaded
   */
  async windowReady () {
    // do some things
    // 延迟加载，无白屏
    const winOpt = this.config.windowsOption;
    if (winOpt.show == false) {
      const win = this.electron.mainWindow;
      win.once('ready-to-show', () => {
        win.show();
        win.focus();
      })
    }
  }

  /**
   * before app close
   */  
  async beforeClose () {
    // do some things

  }
}

Index.toString = () => '[class Index]';
module.exports = Index;