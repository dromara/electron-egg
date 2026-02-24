'use strict';

const assert = require('assert');
const MAP = Symbol('Timing#map');
const LIST = Symbol('Timing#list');

class Timing {

  constructor() {
    this._enable = true;
    this[MAP] = new Map();
    this[LIST] = [];

    this.init();
  }

  init() {
    // process start time
    this.start('Process Start', Date.now() - Math.floor((process.uptime() * 1000)));
    this.end('Process Start');

    if (typeof process.scriptStartTime === 'number') {
      // js script start execute time
      this.start('Script Start', process.scriptStartTime);
      this.end('Script Start');
    }
  }

  start(name, start) {
    if (!name || !this._enable) return;

    if (this[MAP].has(name)) this.end(name);

    start = start || Date.now();
    const item = {
      name,
      start,
      end: undefined,
      duration: undefined,
      pid: process.pid,
      index: this[LIST].length,
    };
    this[MAP].set(name, item);
    this[LIST].push(item);
    return item;
  }

  end(name) {
    if (!name || !this._enable) return;
    assert(this[MAP].has(name), `should run timing.start('${name}') first`);

    const item = this[MAP].get(name);
    item.end = Date.now();
    item.duration = item.end - item.start;
    return item;
  }

  enable() {
    this._enable = true;
  }

  disable() {
    this._enable = false;
  }

  clear() {
    this[MAP].clear();
    this[LIST] = [];
  }

  toJSON() {
    return this[LIST];
  }
}

module.exports = {
  Timing
};
