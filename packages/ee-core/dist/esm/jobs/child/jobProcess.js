import path from "path";
import EventEmitter from "events";
import serialize from "serialize-javascript";
import { fork } from "child_process";
import { coreLogger } from "../../log";
import { getBaseDir, isPackaged, allEnv } from "../../ps";
import { Processes, Events, Receiver } from "../../const/channel";
import { getRandomString } from "../../utils/helper";
import { getFullpath } from "../../core";
import { extend } from "../../utils/extend";
class JobProcess {
  constructor(host, opt = {}) {
    let cwd = getBaseDir();
    const appPath = path.join(__dirname, "app.js");
    if (isPackaged()) {
      cwd = path.join(getBaseDir(), "..");
    }
    const options = extend(true, {
      processArgs: {},
      processOptions: {
        cwd,
        env: allEnv(),
        stdio: "ignore"
        // pipe
      }
    }, opt);
    this.emitter = new EventEmitter();
    this.host = host;
    this.args = [];
    this.sleeping = false;
    this.args.push(JSON.stringify(options.processArgs));
    this.child = fork(appPath, this.args, options.processOptions);
    this.pid = this.child.pid;
    this._init();
  }
  _init() {
    const { messageLog } = this.host.config || {};
    this.child.on("message", (m) => {
      if (messageLog == true) {
        coreLogger.info(`[ee-core] [jobs/child] received a message from child-process, message: ${serialize(m)}`);
      }
      if (m.channel == Processes.showException) {
        coreLogger.error(`${m.data}`);
      }
      if (m.channel == Processes.sendToMain) {
        this._eventEmit(m);
      }
    });
    this.child.on("exit", (code, signal) => {
      let data = {
        pid: this.pid
      };
      this.host.emit(Events.childProcessExit, data);
      coreLogger.info(`[ee-core] [jobs/child] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}`);
    });
    this.child.on("error", (err) => {
      let data = {
        pid: this.pid
      };
      this.host.emit(Events.childProcessError, data);
      coreLogger.error(`[ee-core] [jobs/child] received a error from child-process, error: ${err}, pid:${this.pid}`);
    });
  }
  _eventEmit(m) {
    switch (m.eventReceiver) {
      case Receiver.forkProcess:
        this.emitter.emit(m.event, m.data);
        break;
      case Receiver.childJob:
        this.host.emit(m.event, m.data);
        break;
      default:
        this.host.emit(m.event, m.data);
        this.emitter.emit(m.event, m.data);
        break;
    }
  }
  dispatch(cmd, jobPath = "", ...params) {
    const mid = getRandomString();
    let msg = {
      mid,
      cmd,
      jobPath,
      jobParams: params
    };
    this.child.send(msg);
  }
  callFunc(jobPath = "", funcName = "", ...params) {
    jobPath = getFullpath(jobPath);
    const mid = getRandomString();
    let msg = {
      mid,
      cmd: "run",
      jobPath,
      jobFunc: funcName,
      jobFuncParams: params
    };
    this.child.send(msg);
  }
  kill(timeout = 1e3) {
    this.child.kill("SIGINT");
    setTimeout(() => {
      if (this.child.killed) return;
      this.child.kill("SIGKILL");
    }, timeout);
  }
}
export {
  JobProcess
};
