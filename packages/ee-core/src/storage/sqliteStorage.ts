/**
 * @module storage/sqliteStorage
 * @description SQLite database storage module. Based on better-sqlite3, provides synchronous database operations,
 * supporting three database file location modes (name only, relative path, absolute path) and in-memory database (:memory:).
 *
 * Core responsibilities:
 * - Automatically determine storage mode based on database name (onlyName / relative / absolute / memory)
 * - Automatically create the database directory (ensures the directory exists before opening the database file)
 * - Prevent path traversal attacks (validates that ".." is not present in the name during construction)
 * - Provide a unified interface for obtaining database file paths
 *
 * Usage examples:
 * ```ts
 * // Name-only mode: file stored at {dataDir}/db/{name}.db
 * const db1 = new SqliteStorage('myapp.db');
 *
 * // Relative path mode: file stored at {dataDir}/db/sub/myapp.db
 * const db2 = new SqliteStorage('sub/myapp.db');
 *
 * // Absolute path mode: file stored at the specified path
 * const db3 = new SqliteStorage('/tmp/data/myapp.db');
 *
 * // In-memory mode: not persisted, data is lost when the process exits
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
 * SqliteStorage - SQLite database storage class
 *
 * Encapsulates the database instance creation flow of better-sqlite3, automatically inferring
 * the storage mode based on the provided database name and completing initialization tasks
 * such as directory creation and file path calculation.
 *
 * Storage modes:
 * - memory: In-memory database, name is ":memory:", not persisted to disk
 * - onlyName: Filename only (e.g. "app.db"), stored under {dataDir}/db/
 * - relative: Relative path (e.g. "sub/app.db"), resolved relative to {dataDir}/db/
 * - absolute: Absolute path (e.g. "/tmp/app.db"), uses the specified path directly
 *
 * Security:
 * The constructor validates the database name for path traversal, disallowing ".." in the name
 * to prevent malicious input from accessing files outside the intended directory.
 */
export class SqliteStorage {
  /** Database name (original input value) */
  name: string;

  /** Storage mode: memory / onlyName / relative / absolute */
  mode: string;

  /** Absolute path of the directory containing the database file */
  dbDir: string;

  /** Database filename (only the filename part, excluding directory) */
  fileName: string;

  /** better-sqlite3 database instance */
  db: Database.Database;

  /**
   * Create a SqliteStorage instance
   *
   * Initialization flow:
   * 1. Validate that the name is non-empty and does not contain path traversal characters ".."
   * 2. Infer storage mode from the name (getMode)
   * 3. Create the database file directory (_createDatabaseDir)
   * 4. Extract the filename part (_formatFileName)
   * 5. Open the database connection (_initDB)
   *
   * @param name - Database name or path. Supports the following formats:
   *   - ":memory:" - In-memory database
   *   - "app.db" - Filename only, stored under {dataDir}/db/
   *   - "sub/app.db" - Relative path, relative to {dataDir}/db/
   *   - "/tmp/app.db" - Absolute path
   * @param opt - better-sqlite3 database options, defaults merged with timeout: 5000
   * @throws Asserts error if name is empty or contains ".." path traversal characters
   */
  constructor(name: string, opt: Record<string, unknown> = {}) {
    assert(name, `db name ${name} Cannot be empty`);
    // Prevent path traversal attacks: disallow ".." in the name to avoid directory backtracking
    assert(!name.includes('..'), `db name ${name} contains path traversal`);

    this.name = name;
    this.mode = this.getMode(name);
    this.dbDir = this._createDatabaseDir();
    this.fileName = this._formatFileName(name);
    this.db = this._initDB(opt);
  }

  /**
   * Initialize the database connection
   *
   * Determines the database path based on storage mode:
   * - memory mode: Uses ":memory:" as the path, better-sqlite3 creates the database in memory
   * - file mode: Uses getFilePath() to get the full database file path
   *
   * In file mode, additionally validates that the database file was created successfully.
   * If the file does not exist, throws an assertion error (possibly due to insufficient directory permissions, etc.).
   *
   * @param opt - better-sqlite3 database options, defaults merged with { timeout: 5000 }
   * @returns better-sqlite3 Database instance
   * @throws Asserts error if the database file was not created successfully in file mode
   */
  _initDB(opt: Record<string, unknown> = {}): Database.Database {
    const options = Object.assign({ timeout: 5000 }, opt);

    // Storage type: db file, in-memory (:memory:)
    let dbPath = this.name;
    if (this.mode !== 'memory') {
      dbPath = this.getFilePath();
    }

    const db = new Database(dbPath, options as Database.Options);

    // For file mode, check if the file was created successfully
    if (this.mode !== 'memory') {
      assert(fs.existsSync(dbPath), `error: db ${dbPath} not exists`);
    }

    return db;
  }

  /**
   * Extract the database filename
   *
   * - memory mode: Returns the ":memory:" original name directly
   * - file mode: Uses path.basename to extract the pure filename part, removing directory prefix
   *
   * @param name - Original database name
   * @returns Filename part (returns ":memory:" for memory mode, pure filename for file mode)
   */
  _formatFileName(name: string): string {
    if (this.mode === 'memory') {
      return name;
    }
    return path.basename(name);
  }

  /**
   * Create the directory for the database file
   *
   * The directory path is determined by storage mode:
   * - absolute mode: Uses the directory part from the database name (path.dirname)
   * - Other modes: Uses {dataDir}/db as the default directory
   *
   * If the directory does not exist, it is created automatically with permission 0o755
   * (owner can read/write/execute, others can read/execute).
   *
   * @returns Absolute path of the directory containing the database file
   */
  _createDatabaseDir(): string {
    let dbDir = path.join(getDataDir(), 'db');
    if (this.mode === 'absolute') {
      // Absolute path mode: directory is taken from the path part of the name, not the default data/db
      dbDir = path.dirname(this.name);
    }

    if (!fs.existsSync(dbDir)) {
      mkdir(dbDir, { mode: 0o755 });
    }

    return dbDir;
  }

  /**
   * Infer storage mode from the database name
   *
   * Inference logic:
   * 1. Name is ":memory:" -> memory mode
   * 2. File extension must be ".db", otherwise throws assertion error
   * 3. Name contains path separators (/ or \):
   *    - Absolute path -> absolute mode
   *    - Relative path -> relative mode
   * 4. Name contains no path separators -> onlyName mode
   *
   * @param name - Database name or path
   * @returns Storage mode string: memory / onlyName / relative / absolute
   * @throws Asserts error if file extension is not ".db"
   */
  getMode(name: string): string {
    // Memory mode
    if (name === ':memory:') {
      return 'memory';
    }

    assert(path.extname(name) === '.db', `error: db ${name} file ext name must be .db`);

    // Path mode
    const normalized = name.replace(/[/\\]/g, '/');
    if (normalized.indexOf('/') !== -1) {
      return path.isAbsolute(name) ? 'absolute' : 'relative';
    }

    return 'onlyName';
  }

  /**
   * Get the directory containing the database file
   *
   * @returns Absolute path of the database directory
   */
  getDbDir(): string {
    return this.dbDir;
  }

  /**
   * Get the full path of the database file
   *
   * Composed by joining dbDir and fileName, only meaningful for file modes
   * (in memory mode this path has no practical use).
   *
   * @returns Absolute path of the database file
   */
  getFilePath(): string {
    return path.join(this.dbDir, this.fileName);
  }
}
