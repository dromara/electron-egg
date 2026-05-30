/**
 * @module core/utils/timing
 * @description Timing utility. Used to record the loading duration of each framework stage for
 * performance analysis and debugging. Used in ConfigLoader and ControllerLoader to record
 * timing for stages like "Load Config", "Load Controller", etc.
 */
import type { TimingItem } from '../../types/index.js';

const MAP = Symbol('Timing#map');
const LIST = Symbol('Timing#list');

/**
 * Timing — Timer
 *
 * Usage:
 * ```ts
 * const timing = new Timing();
 * timing.start('Load Controller');
 * // ... perform loading
 * timing.end('Load Controller');
 * const items = timing.toJSON(); // Get all timing records
 * ```
 *
 * Supports nested timing. Repeatedly calling start with the same name will automatically end the previous one first.
 */
export class Timing {
  private _enable = true;
  /** Mapping of timing item names to timing items, for quick lookup and end() */
  private [MAP]: Map<string, TimingItem>;
  /** Chronologically ordered list of timing items */
  private [LIST]: TimingItem[];

  constructor() {
    this[MAP] = new Map();
    this[LIST] = [];
    this.init();
  }

  /**
   * Initialize: record process start time and script start execution time
   */
  init(): void {
    // Record Node.js process start time (current time - process uptime)
    this.start('Process Start', Date.now() - Math.floor(process.uptime() * 1000));
    this.end('Process Start');

    // If scriptStartTime exists (provided by some runtimes), record script start time
    const proc = process as unknown as { scriptStartTime?: number };
    if (typeof proc.scriptStartTime === 'number') {
      this.start('Script Start', proc.scriptStartTime);
      this.end('Script Start');
    }
  }

  /**
   * Start timing
   *
   * @param name - Timing item name
   * @param start - Custom start timestamp (milliseconds); uses current time if not provided
   * @returns Timing item object; if an item with the same name already exists, the previous one is ended first
   */
  start(name: string, start?: number): TimingItem | undefined {
    if (!name || !this._enable) return undefined;

    // If a timing item with the same name already exists, end the previous one first
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
   * End timing
   *
   * @param name - Timing item name (must be started first)
   * @returns Timing item object (including duration)
   * @throws Throws an error when the timing item does not exist
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

  /** Enable timing */
  enable(): void {
    this._enable = true;
  }

  /** Disable timing */
  disable(): void {
    this._enable = false;
  }

  /** Clear all timing records */
  clear(): void {
    this[MAP].clear();
    this[LIST] = [];
  }

  /**
   * Export as JSON-formatted timing records
   *
   * @returns Chronologically ordered list of timing items
   */
  toJSON(): TimingItem[] {
    return this[LIST];
  }
}
