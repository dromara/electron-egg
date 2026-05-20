import type { TimingItem } from '../../types/index.js';

const MAP = Symbol('Timing#map');
const LIST = Symbol('Timing#list');

export class Timing {
  private _enable = true;
  private [MAP]: Map<string, TimingItem>;
  private [LIST]: TimingItem[];

  constructor() {
    this[MAP] = new Map();
    this[LIST] = [];
    this.init();
  }

  init(): void {
    // process start time
    this.start('Process Start', Date.now() - Math.floor(process.uptime() * 1000));
    this.end('Process Start');

    const proc = process as unknown as { scriptStartTime?: number };
    if (typeof proc.scriptStartTime === 'number') {
      // js script start execute time
      this.start('Script Start', proc.scriptStartTime);
      this.end('Script Start');
    }
  }

  start(name: string, start?: number): TimingItem | undefined {
    if (!name || !this._enable) return undefined;

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

  enable(): void {
    this._enable = true;
  }

  disable(): void {
    this._enable = false;
  }

  clear(): void {
    this[MAP].clear();
    this[LIST] = [];
  }

  toJSON(): TimingItem[] {
    return this[LIST];
  }
}
