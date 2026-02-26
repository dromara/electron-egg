import EventEmitter from "events";
import path from "path";
import crossSpawn from "cross-spawn";
import { coreLogger } from "../log";
import { getExtraResourcesDir, isPackaged, isDev, getBaseDir } from "../ps";
import { Events } from "../const/channel";
import { getRandomString, getValueFromArgv } from "../utils/helper";
import { windows } from "../utils/is";
import { parseArgv } from "../utils/pargv";
import { app as electronApp } from "electron";
import tkill from "tree-kill";
class CrossProcess {
  get pid() {
    return this._pid;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
  }
  constructor(host, opt = {}) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = void 0;
    this._pid = 0;
    this.port = 0;
    this._name = "";
    this.config = {};
    this._init(opt);
  }
  /**
   * 初始化子进程
   */
  _init(options = {}) {
    const { targetConf, port } = options;
    this.config = targetConf;
    this.port = port;
    this._name = targetConf.name;
    let cmdPath = "";
    let cmdArgs = targetConf.args;
    let execDir = getExtraResourcesDir();
    let standardOutput = ["inherit", "inherit", "inherit", "ipc"];
    if (isPackaged()) {
      standardOutput = ["ignore", "ignore", "ignore", "ipc"];
    }
    if (targetConf.stdio) {
      standardOutput = targetConf.stdio;
    }
    const { cmd, directory } = targetConf;
    if (cmd) {
      if (!directory) {
        throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
      }
      cmdPath = cmd;
      if (!path.isAbsolute(cmd) && !isDev()) {
        cmdPath = path.join(getExtraResourcesDir(), cmd);
      }
    } else {
      cmdPath = path.join(getExtraResourcesDir(), targetConf.name);
    }
    if (windows() && path.extname(cmdPath) != ".exe") {
      if (targetConf.windowsExtname === true || !isDev()) {
        cmdPath += ".exe";
      }
    }
    if (directory && path.isAbsolute(directory)) {
      execDir = directory;
    } else if (directory && !path.isAbsolute(directory)) {
      if (isDev()) {
        execDir = path.join(getBaseDir(), directory);
      } else {
        execDir = path.join(getExtraResourcesDir(), directory);
      }
    } else {
      execDir = getExtraResourcesDir();
    }
    coreLogger.info(`[ee-core] [cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
    const coreProcess = crossSpawn(cmdPath, cmdArgs, {
      stdio: standardOutput,
      detached: false,
      cwd: execDir,
      maxBuffer: 1024 * 1024 * 1024
    });
    this.child = coreProcess;
    this._pid = coreProcess.pid;
    coreProcess.on("exit", (code, signal) => {
      let data = {
        pid: this._pid
      };
      this.host.emitter.emit(Events.childProcessExit, data);
      coreLogger.info(`[ee-core] [corss/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this._pid}, cmd:${cmdPath}, args: ${cmdArgs}`);
      this._exitElectron();
    });
    coreProcess.on("error", (err) => {
      let data = {
        pid: this._pid
      };
      this.host.emitter.emit(Events.childProcessError, data);
      coreLogger.error(`[ee-core] [corss/process] received a error from child-process, error: ${err}, pid:${this._pid}`);
      this._exitElectron();
    });
  }
  /**
   * kill
   */
  kill(timeout = 1e3) {
    if (this._pid) {
      tkill(this._pid, "SIGINT", (err) => {
        if (err) {
          coreLogger.error(`[ee-core] [corss/process] kill cross-process, error: ${err}, pid:${this._pid}`);
          if (this._pid) {
            tkill(this._pid, "SIGKILL");
          }
        }
        setTimeout(() => {
          this._exitElectron();
        }, timeout);
      });
    }
  }
  getUrl() {
    const ssl = getValueFromArgv(this.config.args, "ssl");
    let hostname = getValueFromArgv(this.config.args, "hostname");
    let protocol = "http://";
    if (ssl && (ssl == "true" || ssl == "1")) {
      protocol = "https://";
    }
    hostname = hostname ? hostname : "127.0.0.1";
    const url = protocol + hostname + ":" + this.port;
    return url;
  }
  getArgsObj() {
    const obj = parseArgv(this.config.args, {});
    return obj;
  }
  setPort(port) {
    this.port = port;
  }
  _generateId() {
    const rid = getRandomString();
    return `node:${this._pid}:${rid}`;
  }
  /**
   * exit electron
   */
  _exitElectron(timeout = 1e3) {
    if (this.config.appExit) {
      setTimeout(() => {
        electronApp.quit();
      }, timeout);
    }
  }
}
export {
  CrossProcess
};
