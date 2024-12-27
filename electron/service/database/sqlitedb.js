'use strict';

const { BasedbService } = require('./basedb');
const Storage = require('ee-core/storage');
const _ = require('lodash');
const path = require('path');

/**
 * sqlite数据存储
 * @class
 */
class SqlitedbService extends BasedbService {

  constructor () {
    const options = {
      dbname:'sqlite-demo.db',
    }
    super(options);
    this._initTable();
  }

  /*
   * 初始化表
   */
  _initTable() {
    // 检查表是否存在
    const userTableName = 'user';
    const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
    let tableExists = masterStmt.get('table', userTableName);
    if (!tableExists) {
      // 创建表
      const create_user_table_sql =
      `CREATE TABLE ${userTableName}
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
  async addTestDataSqlite(data) {
    //console.log("add data:", data);

    let table = 'user';
    await this.checkAndCreateTableSqlite(table);

    const insert = this.demoSqliteDB.db.prepare(`INSERT INTO ${table} (name, age) VALUES (@name, @age)`);
    insert.run(data);

    return true;
  }

  /*
   * 删 Test data (sqlite)
   */
  async delTestDataSqlite(name = '') {
    //console.log("delete name:", name);

    let table = 'user';
    await this.checkAndCreateTableSqlite(table);

    const delUser = this.demoSqliteDB.db.prepare(`DELETE FROM ${table} WHERE name = ?`);
    delUser.run(name);

    return true;
  }

  /*
   * 改 Test data (sqlite)
   */
  async updateTestDataSqlite(name= '', age = 0) {
    //console.log("update :", {name, age});

    let table = 'user';
    await this.checkAndCreateTableSqlite(table);

    const updateUser = this.demoSqliteDB.db.prepare(`UPDATE ${table} SET age = ? WHERE name = ?`);
    updateUser.run(age, name);

    return true;
  }  

  /*
   * 查 Test data (sqlite)
   */
  async getTestDataSqlite(age = 0) {
    //console.log("select :", {age});

    let table = 'user';
    await this.checkAndCreateTableSqlite(table);

    const selectUser = this.demoSqliteDB.db.prepare(`SELECT * FROM ${table} WHERE age = @age`);
    const users = selectUser.all({age: age});
    //console.log("select users:", users);
    return users;
  }  
  
  /*
   * all Test data (sqlite)
   */
  async getAllTestDataSqlite() {
    //console.log("select all user");

    let table = 'user';
    await this.checkAndCreateTableSqlite(table);

    const selectAllUser = this.demoSqliteDB.db.prepare(`SELECT * FROM ${table} `);
    const allUser =  selectAllUser.all();
    //console.log("select allUser:", allUser);
    return allUser;
  }
  
  /*
   * get data dir (sqlite)
   */
  async getDataDir() {
    const dir = this.demoSqliteDB.getStorageDir();    

    return dir;
  } 

  /*
   * set custom data dir (sqlite)
   */
  async setCustomDataDir(dir) {
    if (_.isEmpty(dir)) {
      return;
    }

    // the absolute path of the db file
    const dbFile = path.join(dir, this.sqliteFile);
    const sqliteOptions = {
      driver: 'sqlite',
      default: {
        timeout: 6000,
        verbose: console.log
      }
    }
    this.demoSqliteDB = Storage.connection(dbFile, sqliteOptions);    

    return;
  }
}

SqlitedbService.toString = () => '[class SqlitedbService]';
module.exports = {
  SqlitedbService,
  sqlitedbService: new SqlitedbService()
};
