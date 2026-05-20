import assert from 'assert';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { mkdir } from '../utils/helper.js';
import { getDataDir } from '../ps/index.js';

export class SqliteStorage {
  name: string;
  mode: string;
  dbDir: string;
  fileName: string;
  db: Database.Database;

  constructor(name: string, opt: Record<string, unknown> = {}) {
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
  _initDB(opt: Record<string, unknown> = {}): Database.Database {
    const options = Object.assign({ timeout: 5000 }, opt);

    // 存储类型：db文件、内存(:memory:)
    let dbPath = this.name;
    if (this.mode !== 'memory') {
      dbPath = this.getFilePath();
    }

    const db = new Database(dbPath, options as Database.Options);

    // 如果是文件类型，判断文件是否创建成功
    if (this.mode !== 'memory') {
      assert(fs.existsSync(dbPath), `error: db ${dbPath} not exists`);
    }

    return db;
  }

  /**
   * 获取文件名
   */
  _formatFileName(name: string): string {
    if (this.mode === 'memory') {
      return name;
    }
    return path.basename(name);
  }

  /**
   * 创建storage目录
   */
  _createDatabaseDir(): string {
    let dbDir = path.join(getDataDir(), 'db');
    if (this.mode === 'absolute') {
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
  getMode(name: string): string {
    // 内存模式
    if (name === ':memory:') {
      return 'memory';
    }

    assert(path.extname(name) === '.db', `error: db ${name} file ext name must be .db`);

    const normalized = name.replace(/[/\\]/g, '/');
    if (normalized.indexOf('/') !== -1) {
      return path.isAbsolute(name) ? 'absolute' : 'relative';
    }

    return 'onlyName';
  }

  getDbDir(): string {
    return this.dbDir;
  }

  getFilePath(): string {
    return path.join(this.dbDir, this.fileName);
  }
}
