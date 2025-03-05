import { BasedbService } from './basedb';

/**
 * sqlite数据存储
 * @class
 */
class SqlitedbService extends BasedbService {
  userTableName: string;
  constructor () {
    const options = {
      dbname: 'sqlite-demo.db',
    }
    super(options);
    this.userTableName = 'user';
  }

  /*
   * 初始化表
   */
  init(): void {
    this._init();

    // 检查表是否存在
    const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
    let tableExists = masterStmt.get('table', this.userTableName);
    if (!tableExists) {
      // 创建表
      const create_user_table_sql =
      `CREATE TABLE ${this.userTableName}
      (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name CHAR(50) NOT NULL,
         age INT
      );`
      this.db.exec(create_user_table_sql);
    }
  }

  /*
   * 增 Test data (sqlite)
   */
  async addTestDataSqlite(data: { name: string; age: number }) {
    const insert = this.db.prepare(`INSERT INTO ${this.userTableName} (name, age) VALUES (@name, @age)`);
    insert.run(data);
    return true;
  }

  /*
   * 删 Test data (sqlite)
   */
  async delTestDataSqlite(name: string = ''): Promise<boolean> {
    const delUser = this.db.prepare(`DELETE FROM ${this.userTableName} WHERE name = ?`);
    delUser.run(name);
    return true;
  }

  /*
   * 改 Test data (sqlite)
   */
  async updateTestDataSqlite(name: string = '', age: number = 0): Promise<boolean>  {
    const updateUser = this.db.prepare(`UPDATE ${this.userTableName} SET age = ? WHERE name = ?`);
    updateUser.run(age, name);
    return true;
  }  

  /*
   * 查 Test data (sqlite)
   */
  async getTestDataSqlite(age: number = 0): Promise<any[]> {
    const selectUser = this.db.prepare(`SELECT * FROM ${this.userTableName} WHERE age = @age`);
    const users = selectUser.all({age: age});
    return users;
  }  
  
  /*
   * all Test data (sqlite)
   */
  async getAllTestDataSqlite(): Promise<any[]> {
    const selectAllUser = this.db.prepare(`SELECT * FROM ${this.userTableName} `);
    const allUser =  selectAllUser.all();
    return allUser;
  }
  
  /*
   * get data dir (sqlite)
   */
  async getDataDir(): Promise<string> {
    const dir = this.storage.getDbDir();    
    return dir;
  } 

  /*
   * set custom data dir (sqlite)
   */
  async setCustomDataDir(dir: string): Promise<void> {
    if (dir.length == 0) {
      return;
    }

    this.changeDataDir(dir);
    this.init();
    return;
  }
}
SqlitedbService.toString = () => '[class SqlitedbService]';
const sqlitedbService = new SqlitedbService();

export {
  SqlitedbService,
  sqlitedbService
};
