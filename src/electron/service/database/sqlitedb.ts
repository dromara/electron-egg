import { BasedbService } from './basedb';
import _ from 'lodash';
import { SqliteStorage } from 'ee-core/storage';

/**
 * SqlitedbService class for sqlite data storage
 */
class SqlitedbService extends BasedbService {
  userTableName: string;
  storage: SqliteStorage;

  constructor() {
    const options = {
      dbname: 'sqlite-demo.db',
    };
    super(options);
    this.userTableName = 'user';
    this._initTable();
  }

  /**
   * Initializes the table
   */
  private _initTable(): void {
    // Check if the table exists
    const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
    let tableExists = masterStmt.get('table', this.userTableName);
    if (!tableExists) {
      // Create the table
      const create_user_table_sql =
        `CREATE TABLE ${this.userTableName} (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name CHAR(50) NOT NULL,
           age INT
        );`
      this.db.exec(create_user_table_sql);
    }
  }

  /**
   * Adds test data to sqlite
   */
  async addTestDataSqlite(data: { name: string; age: number }): Promise<boolean> {
    const insert = this.db.prepare(`INSERT INTO ${this.userTableName} (name, age) VALUES (@name, @age)`);
    insert.run(data);
    return true;
  }

  /**
   * Deletes test data from sqlite
   */
  async delTestDataSqlite(name: string = ''): Promise<boolean> {
    const delUser = this.db.prepare(`DELETE FROM ${this.userTableName} WHERE name = ?`);
    delUser.run(name);
    return true;
  }

  /**
   * Updates test data in sqlite
   */
  async updateTestDataSqlite(name: string = '', age: number = 0): Promise<boolean> {
    const updateUser = this.db.prepare(`UPDATE ${this.userTableName} SET age = ? WHERE name = ?`);
    updateUser.run(age, name);
    return true;
  }

  /**
   * Retrieves test data from sqlite
   */
  async getTestDataSqlite(age: number = 0): Promise<any[]> {
    const selectUser = this.db.prepare(`SELECT * FROM ${this.userTableName} WHERE age = @age`);
    const users = selectUser.all({ age: age });
    return users;
  }

  /**
   * Retrieves all test data from sqlite
   */
  async getAllTestDataSqlite(): Promise<any[]> {
    const selectAllUser = this.db.prepare(`SELECT * FROM ${this.userTableName} `);
    const allUser = selectAllUser.all();
    return allUser;
  }

  /**
   * Gets the data directory for sqlite
   */
  async getDataDir(): Promise<string> {
    const dir = this.storage.getStorageDir();
    return dir;
  }

  /**
   * Sets a custom data directory for sqlite
   */
  async setCustomDataDir(dir: string): Promise<void> {
    if (_.isEmpty(dir)) {
      return;
    }

    this.changeDataDir(dir);
    this._initTable();
  }
}

// Setting the class toString method, which is not common in TypeScript
SqlitedbService.toString = () => '[class SqlitedbService]';

export { 
  SqlitedbService,  
  sqlitedbService: new SqlitedbService()
};