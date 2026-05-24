import EventEmitter from 'events';
import { getConfig } from '../config/index.js';
import { getValueFromArgv, replaceArgsValue } from '../utils/helper.js';
import { CrossProcess, CrossTargetConfig } from './crossProcess.js';
import { Events } from '../const/channel.js';
import { extend } from '../utils/extend.js';
import { getPort } from '../utils/port/index.js';
import type { ProcessExitEventData } from '../types/index.js';

export interface CrossRunOptions {
  [key: string]: unknown;
  args?: string[];
  port?: number;
}

export class Cross {
  emitter: EventEmitter | undefined;

  // pid唯一
  // {pid:{name,entity}, pid:{name,entity}, ...}
  private children: Record<string, { name: string; entity: CrossProcess }>;

  // name唯一
  // {name:pid, name:pid, ...}
  private childrenMap: Record<string, number>;

  constructor() {
    this.emitter = undefined;
    this.children = {};
    this.childrenMap = {};
    this._initEventEmitter();
  }

  async create(): Promise<void> {
    // boot services
    const crossCfg = getConfig().cross as Record<string, CrossTargetConfig>;
    //await sleep(5 * 1000);
    
    for (const key of Object.keys(crossCfg)) {
      const val = crossCfg[key];
      if (val && val.enable === true) {
        this.run(key);
      }
    }
  }

  // run
  async run(service: string, opt: CrossRunOptions = {}): Promise<CrossProcess> {
    const crossConf = getConfig().cross as Record<string, CrossTargetConfig>;
    const defaultOpt = crossConf[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt) as unknown as CrossTargetConfig;
    if (Object.keys(targetConf).length === 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }

    // format params
    const tmpArgs = targetConf.args || [];
    let confPort = parseInt(String(getValueFromArgv(tmpArgs, 'port') || '0'), 10);
    // 某些程序给它传入不存在的参数时会报错
    if (isNaN(confPort) && (targetConf.port || 0) > 0) {
      confPort = targetConf.port || 0;
    }
    if (confPort > 0) {
      // 动态生成port，传入的端口必须为int
      confPort = await getPort({ port: confPort });
      // 替换port
      targetConf.args = replaceArgsValue(tmpArgs, 'port', String(confPort));
    }

    // 创建进程
    const subProcess = new CrossProcess(this, { targetConf, port: confPort });
    let uniqueName = targetConf.name;
    if (Object.prototype.hasOwnProperty.call(this.childrenMap, uniqueName)) {
      uniqueName = uniqueName + '-' + String(subProcess.pid);
    }
    this.childrenMap[uniqueName] = subProcess.pid;
    subProcess.name = uniqueName;
    this.children[subProcess.pid] = {
      name: uniqueName,
      entity: subProcess,
    };

    return subProcess;
  }

  killAll(): void {
    Object.keys(this.children).forEach((pid) => {
      this.kill(pid);
    });
  }

  kill(pid: string | number): void {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  }

  killByName(name: string): void {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  }

  getUrl(name: string): string {
    const entity = this.getProcByName(name);
    const url = entity.getUrl();

    return url;
  }

  // 获取 proc
  getProcByName(name: string): CrossProcess {
    // [todo] 如果有名字一样的服务，需要加 pid
    const pid = this.childrenMap[name];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
    }
    const entity = this.getProc(pid);

    return entity;
  }

  // 获取 proc
  getProc(pid: string | number): CrossProcess {
    const child = this.children[String(pid)];
    if (!child) {
      throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
    }

    return child.entity;
  }

  // 获取pids
  getPids(): string[] {
    const pids = Object.keys(this.children);
    return pids;
  }

  _initEventEmitter(): void {
    this.emitter = new EventEmitter();
    this.emitter.on(Events.childProcessExit, (data: ProcessExitEventData) => {
      const child = this.children[String(data.pid)];
      if (child) {
        delete this.childrenMap[child.name];
        delete this.children[String(data.pid)];
      }
    });
    this.emitter.on(Events.childProcessError, (data: ProcessExitEventData) => {
      const child = this.children[String(data.pid)];
      if (child) {
        delete this.childrenMap[child.name];
        delete this.children[String(data.pid)];
      }
    });
  }
}

export const cross = new Cross();
