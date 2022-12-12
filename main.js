const Appliaction = require('ee-core').Appliaction;
const getPort = require('get-port');
const { app } = require('electron');

class Main extends Appliaction {

  constructor() {
    super();
    // this === eeApp;
  }

  /**
   * core app have been loaded
   */
  async ready () {
    // do some things

    await this.createJavaPorts();
    await this.startJava();
  }

  async createJavaPorts() {
    if (this.config.javaServer.enable) {
      const javaPort = await getPort({ port: this.config.javaServer.port });
      process.env.EE_JAVA_PORT = javaPort;
      this.config.javaServer.port = javaPort;
    }
    // 更新config配置
    this.getCoreDB().setItem("config", this.config);
  }

  async startJava() {
    this.logger.info("[main] startJava start");
    const javaServer = require("./public/lib/javaServer");
    javaServer.start(this);
    this.logger.info("[main] startJava end");
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
      })
    }

    const self = this;
    this.electron.mainWindow.webContents.on("did-finish-load", () => {
      const updateFrontend = require('./public/lib/updateFrontend');
      updateFrontend.install(self);
    });

    app.on("before-quit", async () => {
      await this.killJava();
    });
  }

  /**
   * before app close
   */  
  async beforeClose () {
    // do some things

  }

  async killJava() {
    if (this.config.javaServer.enable) {
      const javaServer = require("./public/lib/javaServer");
      await javaServer.kill(this);
    }
  }
}

new Main();
 
