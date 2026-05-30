/**
 * @module cross/cross
 * @description 跨进程通信管理器。负责创建、管理和终止外部子进程（如 Go/Python 后端），
 * 并为子进程动态分配端口。
 *
 * 核心概念：
 * - children：以 pid 为键的进程映射，存储 CrossProcess 实例
 * - childrenMap：以 name 为键的映射，通过名称快速查找进程
 * - 事件监听：子进程退出/错误时自动从映射中清理
 *
 * 使用方式：
 * ```ts
 * const proc = await cross.run('goServer');
 * const url = cross.getUrl('goServer');
 * cross.killByName('goServer');
 * ```
 */
import EventEmitter from 'events';
import { getConfig } from '../config/index.js';
import { getValueFromArgv, replaceArgsValue } from '../utils/helper.js';
import { CrossProcess } from './crossProcess.js';
import type { CrossTargetConfig } from '../types/index.js';
import type { CrossHost } from './crossProcess.js';
import { Events } from '../const/channel.js';
import { extend } from '../utils/extend.js';
import { getPort } from '../utils/port/index.js';
import type { ProcessExitEventData } from '../types/index.js';

/** 运行子进程时的额外选项 */
export interface CrossRunOptions {
  [key: string]: unknown;
  /** 覆盖启动参数 */
  args?: string[];
  /** 指定端口号 */
  port?: number;
}

/**
 * Cross 跨进程通信管理器
 *
 * 实现了 CrossHost 接口，为子进程提供事件通知能力。
 * 通过 children 和 childrenMap 双索引管理进程，支持按 pid 或 name 操作。
 */
export class Cross implements CrossHost {
  /** 事件发射器，用于接收子进程的退出/错误事件 */
  emitter: EventEmitter | undefined;

  /** pid 索引：{ pid: { name, entity } } */
  private children: Record<string, { name: string; entity: CrossProcess }>;

  /** name 索引：{ name: pid } */
  private childrenMap: Record<string, number>;

  constructor() {
    this.emitter = undefined;
    this.children = {};
    this.childrenMap = {};
    this._initEventEmitter();
  }

  /**
   * 创建并启动所有配置中 enable=true 的跨进程服务
   *
   * 遍历 config.cross 配置，对每个 enable=true 的服务调用 run()。
   */
  async create(): Promise<void> {
    const crossCfg = getConfig().cross;

    for (const key of Object.keys(crossCfg)) {
      const val = crossCfg[key];
      if (val && val.enable === true) {
        await this.run(key);
      }
    }
  }

  /**
   * 运行指定的跨进程服务
   *
   * 流程：
   * 1. 从配置中获取服务配置，与运行时选项合并
   * 2. 解析端口参数，若指定则动态获取可用端口
   * 3. 创建 CrossProcess 子进程
   * 4. 注册到 children 和 childrenMap 索引
   *
   * @param service - 服务名称（对应 config.cross 中的键名）
   * @param opt - 运行时选项，可覆盖配置中的参数
   * @returns CrossProcess 实例
   * @throws 服务配置不存在时抛出错误
   */
  async run(service: string, opt: CrossRunOptions = {}): Promise<CrossProcess> {
    const crossConf = getConfig().cross;
    const defaultOpt = crossConf[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt) as unknown as CrossTargetConfig;
    if (Object.keys(targetConf).length === 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }

    // 解析并分配端口
    const tmpArgs = targetConf.args || [];
    let confPort = parseInt(String(getValueFromArgv(tmpArgs, 'port') || '0'), 10);
    // 某些程序传入不存在的参数会报错，此时使用配置中的 port 字段
    if (isNaN(confPort) && (targetConf.port || 0) > 0) {
      confPort = targetConf.port || 0;
    }
    if (confPort > 0) {
      // 动态获取可用端口
      confPort = await getPort({ port: confPort });
      // 替换参数中的端口号
      targetConf.args = replaceArgsValue(tmpArgs, 'port', String(confPort));
    }

    // 创建子进程
    const subProcess = new CrossProcess(this, { targetConf, port: confPort });
    let uniqueName = targetConf.name;
    // 同名服务追加 pid 后缀避免冲突
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

  /** 终止所有子进程 */
  killAll(): void {
    Object.keys(this.children).forEach((pid) => {
      this.kill(pid);
    });
  }

  /** 按 pid 终止子进程 */
  kill(pid: string | number): void {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  }

  /** 按名称终止子进程 */
  killByName(name: string): void {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  }

  /**
   * 获取指定服务的 URL
   *
   * @param name - 服务名称
   * @returns 服务 URL，进程不存在时返回 undefined
   */
  getUrl(name: string): string | undefined {
    const pid = this.childrenMap[name];
    if (!pid) return undefined;
    const child = this.children[String(pid)];
    if (!child) return undefined;
    return child.entity.getUrl();
  }

  /**
   * 按名称获取进程实例
   *
   * @param name - 服务名称
   * @returns CrossProcess 实例
   * @throws 进程不存在时抛出错误
   */
  getProcByName(name: string): CrossProcess {
    const pid = this.childrenMap[name];
    if (!pid) {
      throw new Error(`[ee-core] [cross] The process named [${name}] does not exit`);
    }
    const entity = this.getProc(pid);

    return entity;
  }

  /**
   * 按 pid 获取进程实例
   *
   * @param pid - 进程 ID
   * @returns CrossProcess 实例
   * @throws 进程不存在时抛出错误
   */
  getProc(pid: string | number): CrossProcess {
    const child = this.children[String(pid)];
    if (!child) {
      throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
    }

    return child.entity;
  }

  /** 获取所有子进程的 pid 列表 */
  getPids(): string[] {
    const pids = Object.keys(this.children);
    return pids;
  }

  /**
   * 初始化事件监听
   *
   * 监听子进程的退出和错误事件，自动从索引中清理已终止的进程。
   */
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

/** Cross 管理器单例 */
export const cross = new Cross();
