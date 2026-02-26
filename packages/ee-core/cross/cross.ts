import EventEmitter from 'events';
import { getConfig } from '../config';
import { sleep, getValueFromArgv, replaceArgsValue } from '../utils/helper';
import { CrossProcess } from './crossProcess';
import { Events } from '../const/channel';
import { extend } from '../utils/extend';
import { getPort } from '../utils/port';

class Cross {
  private emitter: EventEmitter | undefined;
  private children: any;
  private childrenMap: any;

  constructor() {
    this.emitter = undefined;

    // pid唯一
    // {pid:{name,entity}, pid:{name,entity}, ...}
    this.children = {};
  
    // name唯一
    // {name:pid, name:pid, ...}
    this.childrenMap = {};

    // eventEmitter
    this._initEventEmitter();
  }

  async create() {

    // boot services
    const crossCfg = getConfig().cross;
    //await sleep(5 * 1000);

    for (let key of Object.keys(crossCfg)) {
      let val = crossCfg[key];
      if (val.enable == true) {
        this.run(key)
      }
    }
  }

  // run
  async run(service: string, opt: any = {}) {
    const crossConf = getConfig().cross;
    const defaultOpt = crossConf[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt);
    if (Object.keys(targetConf).length == 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }
    
    // format params
    let tmpArgs = targetConf.args;
    let confPort = parseInt(getValueFromArgv(tmpArgs, 'port'));
    // 某些程序给它传入不存在的参数时会报错
    if (isNaN(confPort) && targetConf.port > 0) {
      confPort = targetConf.port;
    }
    if (confPort > 0) {
      // 动态生成port，传入的端口必须为int
      confPort = await getPort({ port: confPort });
      // 替换port
      targetConf.args = replaceArgsValue(tmpArgs, "port", String(confPort));
    }

    // 创建进程
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
    Object.keys(this.children).forEach(pid => {
      this.kill(pid)
    });
  }

  kill(pid: string) {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  }

  killByName(name: string) {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  }

  getUrl(name: string) {
    const entity = this.getProcByName(name);
    const url = entity.getUrl();

    return url;
  }

  // 获取 proc
  getProcByName(name: string) {
    // [todo] 如果有名字一样的服务，需要加 pid
    const pid = this.childrenMap[name];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
    }
    const entity = this.getProc(pid);

    return entity;
  }

  // 获取 proc
  getProc(pid: string) {
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
    this.emitter.on(Events.childProcessExit, (data: any) => {
      const child = this.children[data.pid];
      delete this.childrenMap[child.name];
      delete this.children[data.pid];
    });
    this.emitter.on(Events.childProcessError, (data: any) => {
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
