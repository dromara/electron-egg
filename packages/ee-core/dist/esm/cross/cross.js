import EventEmitter from "events";
import { getConfig } from "../config";
import { getValueFromArgv, replaceArgsValue } from "../utils/helper";
import { CrossProcess } from "./crossProcess";
import { Events } from "../const/channel";
import { extend } from "../utils/extend";
import { getPort } from "../utils/port";
class Cross {
  constructor() {
    this.emitter = void 0;
    this.children = {};
    this.childrenMap = {};
    this._initEventEmitter();
  }
  async create() {
    const crossCfg = getConfig().cross;
    for (let key of Object.keys(crossCfg)) {
      let val = crossCfg[key];
      if (val.enable == true) {
        this.run(key);
      }
    }
  }
  // run
  async run(service, opt = {}) {
    const crossConf = getConfig().cross;
    const defaultOpt = crossConf[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt);
    if (Object.keys(targetConf).length == 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }
    let tmpArgs = targetConf.args;
    let confPort = parseInt(getValueFromArgv(tmpArgs, "port"));
    if (isNaN(confPort) && targetConf.port > 0) {
      confPort = targetConf.port;
    }
    if (confPort > 0) {
      confPort = await getPort({ port: confPort });
      targetConf.args = replaceArgsValue(tmpArgs, "port", String(confPort));
    }
    const subProcess = new CrossProcess(this, { targetConf, port: confPort });
    let uniqueName = targetConf.name;
    const pid = subProcess.pid;
    if (pid) {
      if (this.childrenMap.hasOwnProperty(uniqueName)) {
        uniqueName = uniqueName + "-" + String(pid);
      }
      this.childrenMap[uniqueName] = pid;
      subProcess.name = uniqueName;
      this.children[pid] = {
        name: uniqueName,
        entity: subProcess
      };
    }
    return subProcess;
  }
  killAll() {
    Object.keys(this.children).forEach((pid) => {
      this.kill(pid);
    });
  }
  kill(pid) {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  }
  killByName(name) {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  }
  getUrl(name) {
    const entity = this.getProcByName(name);
    const url = entity.getUrl();
    return url;
  }
  // 获取 proc
  getProcByName(name) {
    const pid = this.childrenMap[name];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
    }
    const entity = this.getProc(pid);
    return entity;
  }
  // 获取 proc
  getProc(pid) {
    const child = this.children[pid];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
    }
    return child.entity;
  }
  // 获取pids  
  getPids() {
    let pids = Object.keys(this.children);
    return pids;
  }
  _initEventEmitter() {
    this.emitter = new EventEmitter();
    this.emitter.on(Events.childProcessExit, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
    this.emitter.on(Events.childProcessError, (data) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
  }
}
const cross = new Cross();
export {
  Cross,
  cross
};
