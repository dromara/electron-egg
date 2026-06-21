'use strict';

const { SqliteStorage } = require('ee-core/storage');
const { getDataDir } = require('ee-core/ps');
const path = require('path');

/**
 * sqlite数据存储
 * @class
 */
class BasedbService {

  constructor(options) {
    const { dbname } = options;
    this.dbname = dbname;
    this.db = undefined;
  }

  /*
   * 初始化
   */
  async _init() {
    // 定义数据文件
    const dbFile = path.join(getDataDir(), "db", this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    }
    this.storage = new SqliteStorage(dbFile);
    await this.storage.init(sqliteOptions);
    this.db = this.storage.db;
  }

  /*
   * change data dir (sqlite)
   */
  async changeDataDir(dir) {
    // the absolute path of the db file
    const dbFile = path.join(dir, this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    }
    this.storage = new SqliteStorage(dbFile);
    await this.storage.init(sqliteOptions);
    this.db = this.storage.db;
  }
}  

module.exports = {
  BasedbService,
};
