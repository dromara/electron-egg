'use strict';

const { SqliteStorage } = require('ee-core/storage');
const { getStorageDir } = require('ee-core/ps');
const path = require('path');

/**
 * sqlite数据存储
 * @class
 */
class BasedbService {

  constructor(options) {
    super();

    const { dbname } = options;
    this.dbname = dbname;
    this.db = undefined;
    this._init();
  }

  /*
   * 初始化
   */
  _init() {
    // 定义数据文件
    const dbFile = path.join(getStorageDir(), "db", this.dbname);
    const sqliteOptions = {
      driver: 'sqlite',
      default: {
        timeout: 6000,
        verbose: null // 打印sql语法 console.log
      }
    }
    const storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = storage.db;
  }
}  

BasedbService.toString = () => '[class BasedbService]';
module.exports = {
  BasedbService,
};