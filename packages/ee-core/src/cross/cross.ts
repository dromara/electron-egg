/**
 * @module cross/cross
 * @description Cross-process communication manager. Responsible for creating, managing, and terminating
 * external child processes (e.g., Go/Python backends), and dynamically allocating ports for them.
 *
 * Core concepts:
 * - children: Process mapping keyed by pid, storing CrossProcess instances
 * - childrenMap: Mapping keyed by name, for quick process lookup by name
 * - Event listening: Automatically cleans up from mappings when child processes exit/error
 *
 * Usage:
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

/** Additional options when running a child process.
 *  All CrossTargetConfig properties are optional here since they override config defaults. */
export type CrossRunOptions = Partial<CrossTargetConfig>;

/**
 * Cross - cross-process communication manager
 *
 * Implements the CrossHost interface, providing event notification capability for child processes.
 * Manages processes via children and childrenMap dual indexes, supporting operations by pid or name.
 */
export class Cross implements CrossHost {
  /** Event emitter for receiving child process exit/error events */
  emitter: EventEmitter | undefined;

  /** pid index: { pid: { name, entity } } */
  private children: Record<string, { name: string; entity: CrossProcess }>;

  /** name index: { name: pid } */
  private childrenMap: Record<string, number>;

  constructor() {
    this.emitter = undefined;
    this.children = {};
    this.childrenMap = {};
    this._initEventEmitter();
  }

  /**
   * Create and start all cross-process services with enable=true in config
   *
   * Iterates over config.cross configuration, calling run() for each service with enable=true.
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
   * Run the specified cross-process service
   *
   * Flow:
   * 1. Get service configuration from config, merge with runtime options
   * 2. Parse port parameter, dynamically acquire available port if specified
   * 3. Create CrossProcess child process
   * 4. Register in children and childrenMap indexes
   *
   * @param service - Service name (corresponding to key name in config.cross)
   * @param opt - Runtime options, can override configuration parameters
   * @returns CrossProcess instance
   * @throws Throws error when service configuration does not exist
   */
  async run(service: string, opt: CrossRunOptions = {}): Promise<CrossProcess> {
    const crossConf = getConfig().cross;
    const defaultOpt = crossConf[service] || {};
    const targetConf = extend(true, {}, defaultOpt, opt) as unknown as CrossTargetConfig;
    if (Object.keys(targetConf).length === 0) {
      throw new Error(`[ee-core] [cross] The service [${service}] config does not exit`);
    }

    // Parse and allocate port
    const tmpArgs = targetConf.args || [];
    let confPort = parseInt(String(getValueFromArgv(tmpArgs, 'port') || '0'), 10);
    // Some programs error when passed non-existent arguments, in which case use the port field from config
    if (isNaN(confPort) && (targetConf.port || 0) > 0) {
      confPort = targetConf.port || 0;
    }
    if (confPort > 0) {
      // Dynamically acquire available port
      confPort = await getPort({ port: confPort });
      // Replace port number in arguments
      targetConf.args = replaceArgsValue(tmpArgs, 'port', String(confPort));
    }

    // Create child process
    const subProcess = new CrossProcess(this, { targetConf, port: confPort });
    let uniqueName = targetConf.name;
    // Append pid suffix for duplicate service names to avoid conflicts
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

  /** Terminate all child processes */
  killAll(): void {
    Object.keys(this.children).forEach((pid) => {
      this.kill(pid);
    });
  }

  /** Terminate child process by pid */
  kill(pid: string | number): void {
    const entity = this.getProc(pid);
    if (entity) {
      entity.kill();
    }
  }

  /** Terminate child process by name */
  killByName(name: string): void {
    const entity = this.getProcByName(name);
    if (entity) {
      entity.kill();
    }
  }

  /**
   * Get the URL of the specified service
   *
   * @param name - Service name
   * @returns Service URL, or undefined if process does not exist
   */
  getUrl(name: string): string | undefined {
    const pid = this.childrenMap[name];
    if (!pid) return undefined;
    const child = this.children[String(pid)];
    if (!child) return undefined;
    return child.entity.getUrl();
  }

  /**
   * Get process instance by name
   *
   * @param name - Service name
   * @returns CrossProcess instance
   * @throws Throws error when process does not exist
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
   * Get process instance by pid
   *
   * @param pid - Process ID
   * @returns CrossProcess instance
   * @throws Throws error when process does not exist
   */
  getProc(pid: string | number): CrossProcess {
    const child = this.children[String(pid)];
    if (!child) {
      throw new Error(`[ee-core] [cross] The process pid [${pid}] does not exit`);
    }

    return child.entity;
  }

  /** Get list of all child process pids */
  getPids(): string[] {
    const pids = Object.keys(this.children);
    return pids;
  }

  /**
   * Initialize event listeners
   *
   * Listens for child process exit and error events, automatically cleaning up terminated processes from indexes.
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

/** Cross manager singleton */
export const cross = new Cross();
