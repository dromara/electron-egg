import { SqliteStorage } from 'ee-core/storage';
import { getDataDir } from 'ee-core/ps';
import path from 'path';
import type Database from 'better-sqlite3';

/**
 * sqlite数据存储
 * @class
 */
class BasedbService {
  protected dbname: string;
  protected db!: Database.Database;
  protected storage!: SqliteStorage;

  constructor(options: { dbname: string }) {
    const { dbname } = options;
    this.dbname = dbname;
  }

  /*
   * 初始化
   */
  async _init(): Promise<void> {
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
  async changeDataDir(dir: string): Promise<void> {
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
export { BasedbService };
