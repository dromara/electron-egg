/**
 * @module cross/crossProcess
 * @description 跨进程子进程管理。封装 cross-spawn 创建外部进程的逻辑，
 * 处理进程路径解析、平台差异、生命周期监听和优雅退出。
 *
 * 支持的外部程序类型：
 * - Go 编译的二进制文件
 * - Python 脚本
 * - 其他可执行程序
 *
 * 进程路径解析规则：
 * - 配置中有 cmd → 使用 cmd 作为可执行文件路径
 * - 配置中无 cmd → 使用 extraResourcesDir/{name} 作为路径
 * - Windows 平台自动补充 .exe 扩展名
 * - 开发环境相对于项目根目录，生产环境相对于 extraResources 目录
 */
import EventEmitter from 'events';
import path from 'path';
import crossSpawn from 'cross-spawn';
import tkill from 'tree-kill';
import { coreLogger } from '../log/index.js';
import { getExtraResourcesDir, isPackaged, isDev, getBaseDir } from '../ps/index.js';
import { Events } from '../const/channel.js';
import { getValueFromArgv, getRandomString } from '../utils/helper.js';
import { parseArgv } from '../utils/pargv.js';
import * as is from '../utils/is.js';
import { electronApp } from '../electron/app/index.js';
import type { CrossTargetConfig } from '../types/index.js';

export type { CrossTargetConfig };

/** 创建 CrossProcess 时的选项 */
export interface CrossProcessOptions {
  /** 目标服务配置 */
  targetConf: CrossTargetConfig;
  /** 分配的端口号 */
  port: number;
}

/**
 * CrossProcess 子进程实例
 *
 * 封装了一个外部进程的完整生命周期：
 * 创建 → 运行 → 监听事件 → 终止
 *
 * 通过 host 的 emitter 将子进程事件（退出/错误）通知给 Cross 管理器。
 */
export class CrossProcess {
  /** 事件发射器 */
  emitter: EventEmitter;
  /** 宿主（Cross 管理器），用于通知进程事件 */
  host: CrossHost;
  /** cross-spawn 返回的子进程对象 */
  child: ReturnType<typeof crossSpawn> | undefined;
  /** 子进程 PID */
  pid: number;
  /** 分配的端口号 */
  port: number;
  /** 服务唯一名称（可能被 Cross 管理器重写以避免冲突） */
  name: string;
  /** 服务配置 */
  config: CrossTargetConfig;

  constructor(host: CrossHost, opt: CrossProcessOptions = { targetConf: { name: '' }, port: 0 }) {
    this.emitter = new EventEmitter();
    this.host = host;
    this.child = undefined;
    this.pid = 0;
    this.port = 0;
    this.name = '';
    this.config = { name: '' };
    this._init(opt);
  }

  /**
   * 初始化子进程
   *
   * 执行流程：
   * 1. 保存配置和端口
   * 2. 解析可执行文件路径（处理 cmd/directory 配置和平台差异）
   * 3. 设置标准输出模式（开发环境继承，生产环境忽略）
   * 4. 使用 cross-spawn 启动子进程
   * 5. 监听 exit 和 error 事件
   */
  _init(options: CrossProcessOptions = { targetConf: { name: '' }, port: 0 }): void {
    const { targetConf, port } = options;
    this.config = targetConf;
    this.port = port;

    // 该名称如果在 childrenMap 重复，会被 Cross 管理器重写
    this.name = targetConf.name;

    // 解析可执行文件路径
    let cmdPath = '';
    const cmdArgs = targetConf.args || [];
    let execDir = getExtraResourcesDir();
    // 标准输出配置：开发环境继承终端输出，生产环境忽略
    let standardOutput: ('pipe' | 'ignore' | 'inherit' | 'ipc')[] = ['inherit', 'inherit', 'inherit', 'ipc'];
    if (isPackaged()) {
      standardOutput = ['ignore', 'ignore', 'ignore', 'ipc'];
    }
    if (targetConf.stdio) {
      standardOutput = targetConf.stdio;
    }

    const { cmd, directory } = targetConf;
    // 优先使用 cmd 配置
    if (cmd) {
      if (!directory) {
        throw new Error(`[ee-core] [cross] The config [directory] attribute does not exist`);
      }
      cmdPath = cmd;
      // 非开发环境下，相对路径基于 extraResources 解析
      if (!path.isAbsolute(cmd) && !isDev()) {
        cmdPath = path.join(getExtraResourcesDir(), cmd);
      }
    } else {
      // 无 cmd 时，使用 extraResourcesDir/{name} 作为可执行文件路径
      cmdPath = path.join(getExtraResourcesDir(), targetConf.name);
    }

    // Windows 平台自动补充 .exe 扩展名
    if (is.windows() && path.extname(cmdPath) !== '.exe') {
      if (targetConf.windowsExtname === true || !isDev()) {
        cmdPath += '.exe';
      }
    }

    // 解析工作目录
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

    coreLogger.info(`[cross/run] cmd: ${cmdPath}, args: ${cmdArgs}`);
    const coreProcess = crossSpawn(cmdPath, cmdArgs, {
      stdio: standardOutput,
      detached: false,
      cwd: execDir,
    });
    this.child = coreProcess;
    this.pid = coreProcess.pid || 0;

    // 监听子进程退出：外部终止或内部错误导致退出
    coreProcess.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessExit, data);
      coreLogger.info(
        `[cross/process] received a exit from child-process, code:${code}, signal:${signal}, pid:${this.pid}, cmd:${cmdPath}, args: ${cmdArgs}`
      );
      this._exitElectron();
    });

    // 监听子进程错误
    coreProcess.on('error', (err: Error) => {
      const data = { pid: this.pid };
      this.host.emitter?.emit(Events.childProcessError, data);
      coreLogger.error(
        `[cross/process] received a error from child-process, error: ${err}, pid:${this.pid}`
      );
      this._exitElectron();
    });
  }

  /**
   * 终止子进程
   *
   * 先发送 SIGINT 信号尝试优雅退出，失败则发送 SIGKILL 强制终止。
   * 超时后如果进程仍未退出，触发 _exitElectron 作为安全网。
   *
   * @param timeout - 等待退出的超时时间（毫秒）
   */
  kill(timeout = 1000): void {
    tkill(this.pid, 'SIGINT', (err: Error | undefined) => {
      if (err) {
        coreLogger.error(
          `[cross/process] kill cross-process, error: ${err}, pid:${this.pid}`
        );
        // SIGINT 失败，使用 SIGKILL 强制终止
        tkill(this.pid, 'SIGKILL');
      }
      // 超时安全网：如果 exit 事件未在 timeout 内触发，手动调用 _exitElectron
      setTimeout(() => {
        if (this.child && !this.child.killed) {
          this._exitElectron();
        }
      }, timeout);
    });
  }

  /**
   * 获取子进程的服务 URL
   *
   * 从启动参数中解析 hostname 和 ssl 标志，构造 HTTP/HTTPS URL。
   * 端口为 0 时输出警告（可能服务未正确绑定端口）。
   *
   * @returns 服务 URL，如 http://127.0.0.1:7070
   */
  getUrl(): string {
    if (!this.port) {
      coreLogger.warn(`[cross/process] getUrl called with port 0, pid:${this.pid}`);
    }
    const ssl = getValueFromArgv(this.config.args || [], 'ssl');
    let hostname = getValueFromArgv(this.config.args || [], 'hostname') as string | undefined;
    let protocol = 'http://';
    if (ssl && (ssl === 'true' || ssl === '1')) {
      protocol = 'https://';
    }
    hostname = hostname ? hostname : '127.0.0.1';
    const url = protocol + hostname + ':' + this.port;

    return url;
  }

  /**
   * 获取启动参数的键值对对象
   *
   * @returns 解析后的参数对象
   */
  getArgsObj(): Record<string, unknown> {
    const obj = parseArgv(this.config.args || []);
    return obj;
  }

  /**
   * 设置端口号
   *
   * @param port - 端口号（字符串会被转为数字）
   */
  setPort(port: string | number): void {
    this.port = typeof port === 'string' ? parseInt(port, 10) : port;
  }

  /**
   * 生成唯一 ID
   *
   * @returns 格式为 'node:{pid}:{randomString}' 的唯一标识
   */
  _generateId(): string {
    const rid = getRandomString();
    return `node:${this.pid}:${rid}`;
  }

  /**
   * 子进程退出时触发 Electron 主进程退出
   *
   * 仅当配置 appExit=true 时生效，确保子进程崩溃时主进程也随之退出。
   *
   * @param timeout - 延迟退出时间（毫秒），等待资源释放
   */
  _exitElectron(timeout = 1000): void {
    if (this.config.appExit) {
      setTimeout(() => {
        electronApp.quit();
      }, timeout);
    }
  }
}

/**
 * CrossHost 接口
 *
 * CrossProcess 通过此接口与宿主（Cross 管理器）通信，
 * 发送子进程的退出和错误事件。
 */
export interface CrossHost {
  emitter: EventEmitter | undefined;
}
