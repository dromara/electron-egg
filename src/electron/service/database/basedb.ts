import { SqliteStorage } from 'ee-core/storage';
import { getDataDir } from 'ee-core/ps';
import path from 'path';

/**
 * BasedbService class for sqlite data storage
 */
class BasedbService {
  dbname: string;
  db: any; // Replace 'any' with the actual type if known
  storage: SqliteStorage;

  constructor(options: { dbname: string }) {
    this.dbname = options.dbname;
    this._init();
  }

  /**
   * Initializes the sqlite database
   */
  private _init(): void {
    // Define the data file
    const dbFile = path.join(getDataDir(), "db", this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    };
    this.storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = this.storage.db;
  }

  /**
   * Changes the data directory for the sqlite database
   */
  changeDataDir(dir: string): void {
    // The absolute path of the db file
    const dbFile = path.join(dir, this.dbname);
    const sqliteOptions = {
      timeout: 6000,
      verbose: console.log
    };
    this.storage = new SqliteStorage(dbFile, sqliteOptions);
    this.db = this.storage.db;
  }
}

// Setting the class toString method, which is not common in TypeScript
BasedbService.toString = () => '[class BasedbService]';

export { BasedbService };