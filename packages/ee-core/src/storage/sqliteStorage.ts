/**
 * @module storage/sqliteStorage
 * @description SQLite 数据库存储模块。基于 better-sqlite3 提供同步的数据库操作能力，
 * 支持三种数据库文件定位模式（仅名称、相对路径、绝对路径）以及内存数据库（:memory:）。
 *
 * 核心职责：
 * - 根据数据库名称自动判断存储模式（onlyName / relative / absolute / memory）
 * - 自动创建数据库所在目录（确保目录存在后再打开数据库文件）
 * - 防止路径穿越攻击（构造时校验名称中不允许出现 ".."）
 * - 提供统一的数据库文件路径获取接口
 *
 * 使用示例：
 * ```ts
 * // 仅名称模式：文件存放在 {dataDir}/db/{name}.db
 * const db1 = new SqliteStorage('myapp.db');
 *
 * // 相对路径模式：文件存放在 {dataDir}/db/sub/myapp.db
 * const db2 = new SqliteStorage('sub/myapp.db');
 *
 * // 绝对路径模式：文件存放在指定路径
 * const db3 = new SqliteStorage('/tmp/data/myapp.db');
 *
 * // 内存模式：不落盘，进程退出后数据丢失
 * const db4 = new SqliteStorage(':memory:');
 * ```
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { mkdir } from '../utils/helper.js';
import { getDataDir } from '../ps/index.js';

/**
 * SqliteStorage — SQLite 数据库存储类
 *
 * 封装 better-sqlite3 的数据库实例创建流程，根据传入的数据库名称
 * 自动推断存储模式并完成目录创建、文件路径计算等初始化工作。
 *
 * 存储模式说明：
 * - memory：内存数据库，名称为 ":memory:"，不落盘
 * - onlyName：仅文件名（如 "app.db"），存放在 {dataDir}/db/ 下
 * - relative：相对路径（如 "sub/app.db"），相对于 {dataDir}/db/ 解析
 * - absolute：绝对路径（如 "/tmp/app.db"），直接使用指定路径
 *
 * 安全说明：
 * 构造函数中对数据库名称进行路径穿越校验，禁止名称中包含 ".."，
 * 防止恶意输入导致访问预期目录之外的文件。
 */
export class SqliteStorage {
  /** 数据库名称（原始传入值） */
  name: string;

  /** 存储模式：memory / onlyName / relative / absolute */
  mode: string;

  /** 数据库文件所在目录的绝对路径 */
  dbDir: string;

  /** 数据库文件名（仅文件名部分，不含目录） */
  fileName: string;

  /** better-sqlite3 数据库实例 */
  db: Database.Database;

  /**
   * 创建 SqliteStorage 实例
   *
   * 初始化流程：
   * 1. 校验名称非空且不含路径穿越字符 ".."
   * 2. 根据名称推断存储模式（getMode）
   * 3. 创建数据库文件所在目录（_createDatabaseDir）
   * 4. 提取文件名部分（_formatFileName）
   * 5. 打开数据库连接（_initDB）
   *
   * @param name - 数据库名称或路径。支持以下格式：
   *   - ":memory:" — 内存数据库
   *   - "app.db" — 仅文件名，存放于 {dataDir}/db/
   *   - "sub/app.db" — 相对路径，相对于 {dataDir}/db/
   *   - "/tmp/app.db" — 绝对路径
   * @param opt - better-sqlite3 数据库选项，默认合并 timeout: 5000
   * @throws 名称 为空或包含 ".." 路径穿越字符时抛出断言错误
   */
  constructor(name: string, opt: Record<string, unknown> = {}) {
    assert(name, `db name ${name} Cannot be empty`);
    // 防止路径穿越攻击：禁止名称中包含 ".." 以避免目录回溯
    assert(!name.includes('..'), `db name ${name} contains path traversal`);

    this.name = name;
    this.mode = this.getMode(name);
    this.dbDir = this._createDatabaseDir();
    this.fileName = this._formatFileName(name);
    this.db = this._initDB(opt);
  }

  /**
   * 初始化数据库连接
   *
   * 根据存储模式决定数据库路径：
   * - memory 模式：使用 ":memory:" 作为路径，better-sqlite3 在内存中创建数据库
   * - 文件模式：使用 getFilePath() 获取完整的数据库文件路径
   *
   * 文件模式下会额外校验数据库文件是否成功创建，
   * 若文件不存在则抛出断言错误（可能因目录权限不足等原因导致）。
   *
   * @param opt - better-sqlite3 数据库选项，默认合并 { timeout: 5000 }
   * @returns better-sqlite3 Database 实例
   * @throws 文件模式下数据库文件未成功创建时抛出断言错误
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
   * 提取数据库文件名
   *
   * - memory 模式：直接返回 ":memory:" 原始名称
   * - 文件模式：使用 path.basename 提取纯文件名部分，去除目录前缀
   *
   * @param name - 数据库原始名称
   * @returns 文件名部分（memory 模式返回 ":memory:"，文件模式返回纯文件名）
   */
  _formatFileName(name: string): string {
    if (this.mode === 'memory') {
      return name;
    }
    return path.basename(name);
  }

  /**
   * 创建数据库文件所在目录
   *
   * 目录路径根据存储模式决定：
   * - absolute 模式：使用数据库名称中的目录部分（path.dirname）
   * - 其他模式：使用 {dataDir}/db 作为默认目录
   *
   * 若目录不存在则自动创建，权限为 0o755（所有者可读写执行，其他人可读执行）。
   *
   * @returns 数据库文件所在目录的绝对路径
   */
  _createDatabaseDir(): string {
    let dbDir = path.join(getDataDir(), 'db');
    if (this.mode === 'absolute') {
      // 绝对路径模式：目录取自名称中的路径部分，而非默认的 data/db
      dbDir = path.dirname(this.name);
    }

    if (!fs.existsSync(dbDir)) {
      mkdir(dbDir, { mode: 0o755 });
    }

    return dbDir;
  }

  /**
   * 根据数据库名称推断存储模式
   *
   * 推断逻辑：
   * 1. 名称为 ":memory:" → memory 模式
   * 2. 文件扩展名必须为 ".db"，否则抛出断言错误
   * 3. 名称中含路径分隔符（/ 或 \）：
   *    - 绝对路径 → absolute 模式
   *    - 相对路径 → relative 模式
   * 4. 名称中无路径分隔符 → onlyName 模式
   *
   * @param name - 数据库名称或路径
   * @returns 存储模式字符串：memory / onlyName / relative / absolute
   * @throws 文件扩展名不为 ".db" 时抛出断言错误
   */
  getMode(name: string): string {
    // 内存模式
    if (name === ':memory:') {
      return 'memory';
    }

    assert(path.extname(name) === '.db', `error: db ${name} file ext name must be .db`);

    // 路径模式
    const normalized = name.replace(/[/\\]/g, '/');
    if (normalized.indexOf('/') !== -1) {
      return path.isAbsolute(name) ? 'absolute' : 'relative';
    }

    return 'onlyName';
  }

  /**
   * 获取数据库文件所在目录
   *
   * @returns 数据库目录的绝对路径
   */
  getDbDir(): string {
    return this.dbDir;
  }

  /**
   * 获取数据库文件的完整路径
   *
   * 由 dbDir 和 fileName 拼接而成，仅文件模式有意义
   * （memory 模式下此路径无实际用途）。
   *
   * @returns 数据库文件的绝对路径
   */
  getFilePath(): string {
    return path.join(this.dbDir, this.fileName);
  }
}
