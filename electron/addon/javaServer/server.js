const _ = require("lodash");
const assert = require("assert");
const fs = require("fs");
const is = require('electron-is');
const path = require("path");
const { exec, execSync } = require("child_process");
const Utils = require("ee-core").Utils;
const ps = require("./ps");

/**
 * java server
 */
class JavaServer {
  constructor (app) {
    this.app = app;
    this.options = app.config.addons.javaServer;
  }

  /**
   * 创建服务
   */
  async create () {
    if (!this.options.enable) {
      return;
    }
  
    let port = process.env.EE_JAVA_PORT ? parseInt(process.env.EE_JAVA_PORT) : parseInt(this.options.port);
    assert(typeof port === "number", "java port required, and must be a number");
  
    try {
      const jarName = this.options.name;
      let softwarePath = path.join(Utils.getExtraResourcesDir(), jarName);
      let javaOptStr = this.options.opt;
      let jrePath = path.join(Utils.getExtraResourcesDir(), this.options.jreVersion);
      let cmdStr = '';
      
      this.app.console.info("[addon:javaServer] jar file path:", softwarePath); 
      if (!fs.existsSync(softwarePath)) throw new Error('java program does not exist');

      // 替换opt参数
      javaOptStr = _.replace(javaOptStr, "${port}", port);
      javaOptStr = _.replace(javaOptStr, "${path}", Utils.getLogDir());

      if (is.windows()) {
        jrePath = path.join(jrePath, "bin", "javaw.exe");
        cmdStr = `start ${jrePath} -jar ${javaOptStr} ${softwarePath}`;
      } else if (is.macOS()) {
        // 如果提示：不受信任，请执行：  sudo spctl --master-disable
        jrePath = path.join(jrePath, "Contents", "Home", "bin", "java");
        //cmdStr = `nohup ${jrePath} -jar ${javaOptStr} ${softwarePath} >/dev/null 2>&1 &`;
        cmdStr = `${jrePath} -jar ${javaOptStr} ${softwarePath}`;
      } else {
        // todo linux
      }

      this.app.logger.info("[addon:javaServer] cmdStr:", cmdStr);
      exec(cmdStr);

    } catch (err) {
      this.app.logger.error('[addon:javaServer] throw error:', err);
    }
  }

  /**
   * 关闭服务
   */
  async kill () {
    const jarName = this.options.name;
    if (is.windows()) {
      const resultList = ps.lookup({
        command: "java",
        where: 'caption="javaw.exe"',
        arguments: jarName,
      });
  
      //this.app.logger.info("[addon:javaServer] resultList:", resultList);
      resultList.forEach((item) => {
        ps.kill(item.pid, "SIGKILL", (err) => {
          if (err) {
            throw new Error(err);
          }
          console.info("[addon:javaServer] java程序退出 pid: ", item.pid);
        });
      });
  
      //   const cmd = `for /f "tokens=1-5" %i in ('netstat -ano ^| findstr ":${port}"') do taskkill /F /T /PID %m`;
      //   const a = await execSync(cmd, {encoding: 'utf-8'});
      //   app.logger.info("[javaServer] kill:", a);
    } else if (is.macOS()) {
      const cmd = `ps -ef | grep java | grep ${jarName} | grep -v grep | awk '{print $2}' | xargs kill -9`;
      const result = await execSync(cmd);
      this.app.logger.info("[addon:javaServer] kill:", result != null ? result.toString(): '');
    } else {
      // todo linux
    }
  }
}

module.exports = JavaServer;