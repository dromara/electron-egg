const getPort = require('get-port');
const server = require("./server");
const electronApp = require('electron').app;
const Log = require('ee-core/log');

/**
 * java server插件
 * @class
 */
class JavaServerAddon {

  constructor(app) {
    this.app = app;
    this.cfg = app.config.addons.javaServer;
    this.javaServer = null;
  }

  /**
   * 创建java服务
   *
   * @function 
   * @since 1.0.0
   */
  async createServer () {
    await this.createJavaPorts();

    this.javaServer = new server(this.app);
    await this.javaServer.create();

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
    this.app.getCoreDB().setItem("config", this.app.config);
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