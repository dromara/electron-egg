/**
 * @module core/utils/timing
 * @description 计时器工具。用于记录框架各阶段加载耗时，便于性能分析和调试。
 * 在 ConfigLoader 和 ControllerLoader 中使用，记录 "Load Config"、"Load Controller" 等阶段的时间。
 */
import type { TimingItem } from '../../types/index.js';

const MAP = Symbol('Timing#map');
const LIST = Symbol('Timing#list');

/**
 * Timing 计时器
 *
 * 使用方式：
 * ```ts
 * const timing = new Timing();
 * timing.start('Load Controller');
 * // ... 执行加载
 * timing.end('Load Controller');
 * const items = timing.toJSON(); // 获取所有计时记录
 * ```
 *
 * 支持嵌套计时，重复 start 同名计时项会自动先 end 之前的。
 */
export class Timing {
  private _enable = true;
  /** 计时项名称到计时项的映射，用于快速查找和 end() */
  private [MAP]: Map<string, TimingItem>;
  /** 按时间顺序排列的计时项列表 */
  private [LIST]: TimingItem[];

  constructor() {
    this[MAP] = new Map();
    this[LIST] = [];
    this.init();
  }

  /**
   * 初始化：记录进程启动时间和脚本开始执行时间
   */
  init(): void {
    // 记录 Node.js 进程启动时间（当前时间 - 进程运行时长）
    this.start('Process Start', Date.now() - Math.floor(process.uptime() * 1000));
    this.end('Process Start');

    // 如果存在 scriptStartTime（部分运行时提供），记录脚本开始时间
    const proc = process as unknown as { scriptStartTime?: number };
    if (typeof proc.scriptStartTime === 'number') {
      this.start('Script Start', proc.scriptStartTime);
      this.end('Script Start');
    }
  }

  /**
   * 开始计时
   *
   * @param name - 计时项名称
   * @param start - 自定义起始时间戳（毫秒），不传则使用当前时间
   * @returns 计时项对象；同名项已存在时先自动结束之前的
   */
  start(name: string, start?: number): TimingItem | undefined {
    if (!name || !this._enable) return undefined;

    // 同名计时项已存在，先结束之前的
    if (this[MAP].has(name)) this.end(name);

    const item: TimingItem = {
      name,
      start: start || Date.now(),
      end: undefined,
      duration: undefined,
      pid: process.pid,
      index: this[LIST].length,
    };
    this[MAP].set(name, item);
    this[LIST].push(item);
    return item;
  }

  /**
   * 结束计时
   *
   * @param name - 计时项名称（必须先 start）
   * @returns 计时项对象（含 duration）
   * @throws 计时项不存在时抛出错误
   */
  end(name: string): TimingItem | undefined {
    if (!name || !this._enable) return undefined;
    if (!this[MAP].has(name)) {
      throw new Error(`should run timing.start('${name}') first`);
    }

    const item = this[MAP].get(name)!;
    item.end = Date.now();
    item.duration = item.end - item.start;
    return item;
  }

  /** 启用计时 */
  enable(): void {
    this._enable = true;
  }

  /** 禁用计时 */
  disable(): void {
    this._enable = false;
  }

  /** 清除所有计时记录 */
  clear(): void {
    this[MAP].clear();
    this[LIST] = [];
  }

  /**
   * 导出为 JSON 格式的计时记录
   *
   * @returns 按时间顺序排列的计时项列表
   */
  toJSON(): TimingItem[] {
    return this[LIST];
  }
}
