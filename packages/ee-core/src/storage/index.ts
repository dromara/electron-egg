/**
 * @module storage
 * @description Data storage module entry point. Provides SqliteStorage for SQLite database operations.
 *
 * SqliteStorage class is exported statically — loading this module only imports built-in
 * Node.js modules (assert, fs, path), NOT better-sqlite3. The native better-sqlite3 binding
 * is only loaded when `SqliteStorage.init()` is called, via dynamic import().
 *
 * Usage:
 * ```ts
 * import { SqliteStorage } from 'ee-core/storage';
 * const db = new SqliteStorage('myapp.db');
 * await db.init();  // ← here better-sqlite3 is actually loaded
 * ```
 */
export { SqliteStorage } from './sqliteStorage.js';
