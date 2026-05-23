'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BSqlite = require('better-sqlite3');
const { mkdir } = require('../utils/helper');
const { getDataDir } = require('../ps');

class SqliteStorage {
  constructor (name, opt = {}) {
    assert(name, `db name ${name} Cannot be empty`);

    this.name = name;
    this.mode = this.getMode(name);
    this.dbDir = this._createDatabaseDir();
    this.fileName = this._formatFileName(name);
    this.db = this._initDB(opt);
  }

  /**
   * 初始化db
   */
  _initDB (opt = {}) {
    let options = Object.assign({
      timeout: 5000,
    }, opt);

    // 存储类型：db文件、内存(:memory:)
    let dbPath = this.name;
    if (this.mode != 'memory') {
      dbPath = this.getFilePath();
    }

    const db = new BSqlite(dbPath, options);

    // 如果是文件类型，判断文件是否创建成功
    if (this.mode != 'memory') {
      assert(fs.existsSync(dbPath), `error: db ${dbPath} not exists`);
    }

    return db;
  }

  /**
   * 获取文件名
   */
  _formatFileName (name) {
    let fileName = name;
    if (this.mode != 'memory') {
      fileName = path.basename(name);
    }

    return fileName;
  }

  /**
   * 创建storage目录
   */
  _createDatabaseDir () {
    let dbDir = path.join(getDataDir(), 'db');
    if (this.mode == 'absolute') {
      dbDir = path.dirname(this.name); 
    }

    if (!fs.existsSync(dbDir)) {
      mkdir(dbDir, { mode: 0o755 });
    }

    return dbDir;
  }

  /**
   * 获取file path 模式
   */
  getMode (name) {
    let mode = '';

    // 内存模式
    if (name == ':memory:') {
      mode = 'memory';
      return mode;
    }

    assert(path.extname(name) == '.db', `error: db ${name} file ext name must be .db`);

    // 路径模式
    name = name.replace(/[/\\]/g, '/');
    if (name.indexOf('/') !== -1) {
      const isAbsolute = path.isAbsolute(name);
      if (isAbsolute) {
        mode = 'absolute';
      } else {
        mode = 'relative';
      }
      return mode;
    }

    // 仅文件名
    mode = 'onlyName';

    return mode;
  }

  /**
   * 获取 db 文件目录
   */
  getDbDir () {
    return this.dbDir;
  }

  /**
   * 获取文件绝对路径
   */
  getFilePath () {
    const dbFile = path.join(this.dbDir, this.fileName);

    return dbFile;
  }
}

module.exports = {
  SqliteStorage
};