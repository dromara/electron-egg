
import { Database } from "better-sqlite3";
export declare class SqliteStorage {
    constructor(name: any, opt?: {});
    name: string;
    mode: string;
    dbDir: string;
    fileName: string;
    db: Database;
    _initDB(opt?: {}): any;
    _formatFileName(name: string): string;
    _createDatabaseDir(): string;
    getMode(name: string): string;
    getDbDir(): string;
    getFilePath(): string;
}
