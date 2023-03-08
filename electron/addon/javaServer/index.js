const getPort = require('get-port');
const server = require("./server");
const { app: electronApp } = require('electron');
const Log = require('ee-core/log');
const Conf = require('ee-core/config');

/**
 * java server插件
 * @class
 */
class JavaServerAddon {

  constructor(app) {
    this.app = app;
    this.cfg;
    this.javaServer;
  }

  /**
   * 创建java服务
   *
   * @function 
   * @since 1.0.0
   */
  async createServer () {

    this.cfg = Conf.getValue('addons.javaServer');
    await this.createJavaPorts();

    this.javaServer = new server();
    await this.javaServer.create(this.cfg);

    // kill
    electronApp.on("before-quit", async () => {
      Log.info("[addon:javaServer] before-quit: kill-----------");
      await this.javaServer.kill();
    });

    return;
  }

  /**
   * todo 检查服务是否启动
   *
   * @function 
   * @since 1.0.0
   */
  async check () {
    
  }

  /**
   * 创建服务端口
   *
   * @function 
   * @since 1.0.0
   */
  async createJavaPorts() {
    if (!this.cfg.enable) {
      return;
    }
    const javaPort = await getPort({ port: this.cfg.port });
    process.env.EE_JAVA_PORT = javaPort;
    this.cfg.port = javaPort;

    // 更新config配置
    Conf.setValue('addons.javaServer', this.cfg);
  }

  /**
   * 杀掉进程
   *
   * @function 
   * @since 1.0.0
   */
  async kill() {
    if (!this.cfg.enable) {
      return;
    }
    await this.javaServer.kill();
  }
}

JavaServerAddon.toString = () => '[class JavaServerAddon]';
module.exports = JavaServerAddon;