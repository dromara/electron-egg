import { type Database, SqliteStorage } from 'ee-core/storage';
import { getDataDir } from 'ee-core/ps';
import path from 'path';

/**
 * sqlite数据存储
 * @class
 */
class BasedbService {
  dbname: string;
  db!: Database;
  storage!: SqliteStorage;

  constructor(options: { dbname: string }) {
    const { dbname } = options;
    this.dbname = dbname;

  }

  /*
   * 初始化
   */
  protected _init(): void {
    // 定义数据文件
    const dbFile = path.join(getDataDir(), "db", this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    }
    this.storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = this.storage.db;
  }

  /*
   * change data dir (sqlite)
   */
  changeDataDir(dir: string): void {
    // the absolute path of the db file
    const dbFile = path.join(dir, this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    }
    this.storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = this.storage.db;   
  }
}  
BasedbService.toString = () => '[class BasedbService]';

export {
  BasedbService,
}