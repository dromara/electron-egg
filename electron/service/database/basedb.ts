import { SqliteStorage } from 'ee-core/storage';
import { getDataDir } from 'ee-core/ps';
import path from 'path';

/**
 * sqlite数据存储
 * @class
 */
class BasedbService {
  protected dbname: string;
  protected db: any;
  protected storage: any;

  constructor(options: { dbname: string }) {
    const { dbname } = options;
    this.dbname = dbname;
    this.db = undefined;
  }

  /*
   * 初始化
   */
  _init(): void {
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
(BasedbService as any).toString = () => '[class BasedbService]';

export { BasedbService };
