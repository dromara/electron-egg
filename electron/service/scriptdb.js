'use strict';

const { BasedbService } = require('./database/basedb');
const { logger } = require('ee-core/log');

/**
 * 控场话术数据库服务
 * @class
 */
class ScriptdbService extends BasedbService {

    constructor() {
        const options = {
            dbname: 'script-db.db',
        }
        super(options);
        this.tableNamePrefix = 'script_table_';
        this.scriptTablesName = 'script_tables'; // 存储所有表名的表
    }

    /**
     * 初始化数据库
     */
    init() {
        // 初始化数据库
        this._init();

        // 检查表名管理表是否存在
        const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
        let tableExists = masterStmt.get('table', this.scriptTablesName);
        if (!tableExists) {
            // 创建表名管理表
            const createTablesSql = `
            CREATE TABLE ${this.scriptTablesName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                display_name TEXT NOT NULL,
                create_time INTEGER NOT NULL
            );`;
            this.db.exec(createTablesSql);

            // 创建默认表
            this.createScriptTable('默认');
        }
    }

    /**
     * 获取所有控场话术表
     */
    async getScriptTables() {
        try {
            const selectTables = this.db.prepare(`SELECT * FROM ${this.scriptTablesName} ORDER BY create_time ASC`);
            const tables = selectTables.all();
            return { status: 'success', tables };
        } catch (error) {
            logger.error('获取控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 创建新的控场话术表
     * @param {string} displayName 显示名称
     */
    async createScriptTable(displayName) {
        try {
            if (!displayName || displayName.trim() === '') {
                return { status: 'error', message: '表名不能为空' };
            }

            // 生成唯一表名
            const timestamp = new Date().getTime();
            const tableName = `${this.tableNamePrefix}${timestamp}`;

            // 创建脚本表
            const createScriptTableSql = `
            CREATE TABLE ${tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                create_time INTEGER NOT NULL
            );`;
            this.db.exec(createScriptTableSql);

            // 记录到表名管理表
            const insertTable = this.db.prepare(`
            INSERT INTO ${this.scriptTablesName} (table_name, display_name, create_time) 
            VALUES (?, ?, ?)`);
            insertTable.run(tableName, displayName, timestamp);

            return { status: 'success', tableName, displayName };
        } catch (error) {
            logger.error('创建控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新控场话术表名
     * @param {string} tableName 表名
     * @param {string} newDisplayName 新显示名称
     */
    async updateScriptTable(tableName, newDisplayName) {
        try {
            if (!newDisplayName || newDisplayName.trim() === '') {
                return { status: 'error', message: '表名不能为空' };
            }

            const updateTable = this.db.prepare(`
            UPDATE ${this.scriptTablesName} SET display_name = ? WHERE table_name = ?`);
            const result = updateTable.run(newDisplayName, tableName);

            if (result.changes === 0) {
                return { status: 'error', message: '表不存在' };
            }

            return { status: 'success', message: '更新成功' };
        } catch (error) {
            logger.error('更新控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除控场话术表
     * @param {string} tableName 表名
     */
    async deleteScriptTable(tableName) {
        try {
            // 删除表
            this.db.exec(`DROP TABLE IF EXISTS ${tableName}`);

            // 从表管理中删除记录
            const deleteTable = this.db.prepare(`DELETE FROM ${this.scriptTablesName} WHERE table_name = ?`);
            deleteTable.run(tableName);

            return { status: 'success', message: '删除成功' };
        } catch (error) {
            logger.error('删除控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取指定表的所有脚本
     * @param {string} tableName 表名
     */
    async getScripts(tableName) {
        try {
            // 检查表是否存在
            const tableCheck = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`);
            const tableExists = tableCheck.get(tableName);

            if (!tableExists) {
                return { status: 'error', message: '表不存在' };
            }

            const selectScripts = this.db.prepare(`SELECT * FROM ${tableName} ORDER BY id ASC`);
            const scripts = selectScripts.all();
            return { status: 'success', scripts };
        } catch (error) {
            logger.error('获取控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 添加控场话术
     * @param {string} tableName 表名
     * @param {string} content 内容
     */
    async addScript(tableName, content) {
        try {
            if (!content || content.trim() === '') {
                return { status: 'error', message: '内容不能为空' };
            }

            const insert = this.db.prepare(`INSERT INTO ${tableName} (content, create_time) VALUES (?, ?)`);
            const timestamp = new Date().getTime();
            const result = insert.run(content, timestamp);

            return {
                status: 'success',
                id: result.lastInsertRowid,
                script: {
                    id: result.lastInsertRowid,
                    content,
                    create_time: timestamp
                }
            };
        } catch (error) {
            logger.error('添加控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新控场话术
     * @param {string} tableName 表名
     * @param {number} id 话术ID
     * @param {string} content 内容
     */
    async updateScript(tableName, id, content) {
        try {
            if (!content || content.trim() === '') {
                return { status: 'error', message: '内容不能为空' };
            }

            const update = this.db.prepare(`UPDATE ${tableName} SET content = ? WHERE id = ?`);
            const result = update.run(content, id);

            if (result.changes === 0) {
                return { status: 'error', message: '话术不存在' };
            }

            return { status: 'success', message: '更新成功' };
        } catch (error) {
            logger.error('更新控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除控场话术
     * @param {string} tableName 表名
     * @param {number} id 话术ID
     */
    async deleteScript(tableName, id) {
        try {
            // 执行删除，保持最简单的删除逻辑
            const deleteScript = this.db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
            const result = deleteScript.run(id);

            if (result.changes === 0) {
                return { status: 'error', message: '话术不存在' };
            }

            return { status: 'success', message: '删除成功' };
        } catch (error) {
            logger.error('删除控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }
}

ScriptdbService.toString = () => '[class ScriptdbService]';

module.exports = {
    ScriptdbService,
    scriptdbService: new ScriptdbService()
};