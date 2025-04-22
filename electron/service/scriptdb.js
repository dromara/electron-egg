'use strict';

const { BasedbService } = require('./database/basedb');
const { logger } = require('ee-core/log');
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { Service } = require('ee-core');
const Storage = require('ee-core/storage');
const Log = require('ee-core/log');
const Utils = require('ee-core/utils');
const _ = require('lodash');
const { dialog } = require('electron');

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
        this.tableNamePrefix = '控场话术表_';
        this.scriptTablesName = '控场表名管理表'; // 存储所有表名的表

        // 文字回复表相关
        this.replyTablePrefix = '文字回复表_';
        this.replyTablesName = '文字回复表名管理表'; // 存储所有文字回复表名的表
    }

    /**
     * 初始化数据库
     */
    init() {
        // 初始化数据库
        this._init();

        // 检查控场话术表名管理表是否存在
        this._initScriptTables();

        // 检查文字回复表名管理表是否存在
        this._initReplyTables();
    }

    /**
     * 初始化控场话术表
     */
    _initScriptTables() {
        const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
        let tableExists = masterStmt.get('table', this.scriptTablesName);
        if (!tableExists) {
            // 创建表名管理表
            const createTablesSql = `
            CREATE TABLE ${this.scriptTablesName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                display_name TEXT NOT NULL
            );`;
            this.db.exec(createTablesSql);

            // 创建默认表
            this.createScriptTable('默认');
        } else {
            // 检查默认表是否存在并注册
            this._checkAndRegisterDefaultTable();
        }
    }

    /**
     * 初始化文字回复表
     */
    _initReplyTables() {
        const masterStmt = this.db.prepare('SELECT * FROM sqlite_master WHERE type=? AND name = ?');
        let tableExists = masterStmt.get('table', this.replyTablesName);
        if (!tableExists) {
            // 创建表名管理表
            const createTablesSql = `
            CREATE TABLE ${this.replyTablesName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                table_name TEXT NOT NULL,
                display_name TEXT NOT NULL
            );`;
            this.db.exec(createTablesSql);

            // 创建默认表
            this.createReplyTable('默认');
        } else {
            // 检查默认表是否存在并注册
            this._checkAndRegisterDefaultReplyTable();
        }
    }

    /**
     * 检查并注册默认表
     * 解决可能存在的表已创建但未注册到管理表的问题
     */
    _checkAndRegisterDefaultTable() {
        try {
            // 检查默认表是否在管理表中注册
            const defaultTableName = `${this.tableNamePrefix}默认`;
            const checkStmt = this.db.prepare(`SELECT * FROM ${this.scriptTablesName} WHERE table_name = ?`);
            const tableRecord = checkStmt.get(defaultTableName);

            // 检查默认表是否已创建
            const tableExistsStmt = this.db.prepare('SELECT name FROM sqlite_master WHERE type=? AND name = ?');
            const tableExists = tableExistsStmt.get('table', defaultTableName);

            // 如果默认表已创建但未注册，进行注册
            if (tableExists && !tableRecord) {
                const insertTable = this.db.prepare(`
                INSERT INTO ${this.scriptTablesName} (table_name, display_name) 
                VALUES (?, ?)`);
                insertTable.run(defaultTableName, '默认');
                logger.info('默认表已注册到管理表');
            }
            // 如果默认表未创建，创建默认表
            else if (!tableExists) {
                this.createScriptTable('默认');
                logger.info('默认表已创建');
            }
        } catch (error) {
            logger.error('检查默认表失败', error);
        }
    }

    /**
     * 获取所有控场话术表
     */
    async getScriptTables() {
        try {
            // 只查询需要的列
            const selectTables = this.db.prepare(`SELECT id, table_name, display_name FROM ${this.scriptTablesName}`);
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

            // 生成唯一表名 - 使用用户输入的表名作为后缀，而不是时间戳
            // 清理表名，移除不适合作为表名的字符，防止SQL注入
            const cleanedName = displayName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
            const tableName = `${this.tableNamePrefix}${cleanedName}`;

            // 创建脚本表
            const createScriptTableSql = `
            CREATE TABLE ${tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL
            );`;
            this.db.exec(createScriptTableSql);

            // 记录到表名管理表
            const insertTable = this.db.prepare(`
            INSERT INTO ${this.scriptTablesName} (table_name, display_name) 
            VALUES (?, ?)`);
            insertTable.run(tableName, displayName);

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
            // 使用EXISTS检查表是否存在，效率更高
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: '表不存在' };
            }

            // 只选择需要的字段
            const selectScripts = this.db.prepare(`SELECT id, content FROM ${tableName} ORDER BY id ASC`);
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

            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            // 直接执行插入操作
            const insert = this.db.prepare(`INSERT INTO ${tableName} (content) VALUES (?)`);
            const result = insert.run(content);

            logger.info(`添加控场话术成功，表名: ${tableName}, 内容: ${content}`);

            return {
                status: 'success',
                id: result.lastInsertRowid,
                script: {
                    id: result.lastInsertRowid,
                    content
                }
            };
        } catch (error) {
            logger.error(`添加控场话术失败, 表名: ${tableName}, 错误: ${error.message}`);
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

            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            const update = this.db.prepare(`UPDATE ${tableName} SET content = ? WHERE id = ?`);
            const result = update.run(content, id);

            if (result.changes === 0) {
                return { status: 'error', message: '话术不存在' };
            }

            logger.info(`更新控场话术成功，表名: ${tableName}, ID: ${id}, 内容: ${content}`);
            return { status: 'success', message: '更新成功' };
        } catch (error) {
            logger.error(`更新控场话术失败, 表名: ${tableName}, ID: ${id}, 错误: ${error.message}`);
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
            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            // 执行删除，保持最简单的删除逻辑
            const deleteScript = this.db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
            const result = deleteScript.run(id);

            if (result.changes === 0) {
                return { status: 'error', message: '话术不存在' };
            }

            logger.info(`删除控场话术成功，表名: ${tableName}, ID: ${id}`);
            return { status: 'success', message: '删除成功' };
        } catch (error) {
            logger.error(`删除控场话术失败, 表名: ${tableName}, ID: ${id}, 错误: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 检查并修复默认表
     * 公开接口，允许从外部调用
     */
    async checkAndFixDefaultTable() {
        try {
            // 检查默认表是否在管理表中注册
            this._checkAndRegisterDefaultTable();
            return { status: 'success', message: '检查完成' };
        } catch (error) {
            logger.error('检查默认表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 检查并注册默认回复表
     * 解决可能存在的表已创建但未注册到管理表的问题
     */
    _checkAndRegisterDefaultReplyTable() {
        try {
            // 检查默认表是否在管理表中注册
            const defaultTableName = `${this.replyTablePrefix}默认`;
            const checkStmt = this.db.prepare(`SELECT * FROM ${this.replyTablesName} WHERE table_name = ?`);
            const tableRecord = checkStmt.get(defaultTableName);

            // 检查默认表是否已创建
            const tableExistsStmt = this.db.prepare('SELECT name FROM sqlite_master WHERE type=? AND name = ?');
            const tableExists = tableExistsStmt.get('table', defaultTableName);

            // 如果默认表已创建但未注册，进行注册
            if (tableExists && !tableRecord) {
                const insertTable = this.db.prepare(`
                INSERT INTO ${this.replyTablesName} (table_name, display_name) 
                VALUES (?, ?)`);
                insertTable.run(defaultTableName, '默认');
                logger.info('默认回复表已注册到管理表');
            }
            // 如果默认表未创建，创建默认表
            else if (!tableExists) {
                this.createReplyTable('默认');
                logger.info('默认回复表已创建');
            }
        } catch (error) {
            logger.error('检查默认回复表失败', error);
        }
    }

    /**
     * 获取所有文字回复表
     */
    async getReplyTables() {
        try {
            // 只查询需要的列
            const selectTables = this.db.prepare(`SELECT id, table_name, display_name FROM ${this.replyTablesName}`);
            const tables = selectTables.all();
            return { status: 'success', tables };
        } catch (error) {
            logger.error('获取文字回复表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 创建新的文字回复表
     * @param {string} displayName 显示名称
     */
    async createReplyTable(displayName) {
        try {
            if (!displayName || displayName.trim() === '') {
                return { status: 'error', message: '表名不能为空' };
            }

            // 生成唯一表名 - 使用用户输入的表名作为后缀
            // 清理表名，移除不适合作为表名的字符，防止SQL注入
            const cleanedName = displayName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
            const tableName = `${this.replyTablePrefix}${cleanedName}`;

            // 创建回复表
            const createReplyTableSql = `
            CREATE TABLE ${tableName} (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                keyword TEXT NOT NULL,
                reply TEXT NOT NULL
            );`;
            this.db.exec(createReplyTableSql);

            // 记录到表名管理表
            const insertTable = this.db.prepare(`
            INSERT INTO ${this.replyTablesName} (table_name, display_name) 
            VALUES (?, ?)`);
            insertTable.run(tableName, displayName);

            return { status: 'success', tableName, displayName };
        } catch (error) {
            logger.error('创建文字回复表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新文字回复表名
     * @param {string} tableName 表名
     * @param {string} newDisplayName 新显示名称
     */
    async updateReplyTable(tableName, newDisplayName) {
        try {
            if (!newDisplayName || newDisplayName.trim() === '') {
                return { status: 'error', message: '表名不能为空' };
            }

            const updateTable = this.db.prepare(`
            UPDATE ${this.replyTablesName} SET display_name = ? WHERE table_name = ?`);
            const result = updateTable.run(newDisplayName, tableName);

            if (result.changes === 0) {
                return { status: 'error', message: '表不存在' };
            }

            return { status: 'success', message: '更新成功' };
        } catch (error) {
            logger.error('更新文字回复表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除文字回复表
     * @param {string} tableName 表名
     */
    async deleteReplyTable(tableName) {
        try {
            // 删除表
            this.db.exec(`DROP TABLE IF EXISTS ${tableName}`);

            // 从表管理中删除记录
            const deleteTable = this.db.prepare(`DELETE FROM ${this.replyTablesName} WHERE table_name = ?`);
            deleteTable.run(tableName);

            return { status: 'success', message: '删除成功' };
        } catch (error) {
            logger.error('删除文字回复表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取指定表的所有回复
     * @param {string} tableName 表名
     */
    async getReplies(tableName) {
        try {
            // 使用EXISTS检查表是否存在，效率更高
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: '表不存在' };
            }

            // 只选择需要的字段
            const selectReplies = this.db.prepare(`SELECT id, keyword, reply FROM ${tableName} ORDER BY id ASC`);
            const replies = selectReplies.all();
            return { status: 'success', replies };
        } catch (error) {
            logger.error('获取文字回复失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 添加文字回复
     * @param {string} tableName 表名
     * @param {string} keyword 关键词
     * @param {string} reply 回复内容
     */
    async addReply(tableName, keyword, reply) {
        try {
            if (!keyword || keyword.trim() === '') {
                return { status: 'error', message: '关键词不能为空' };
            }

            if (!reply || reply.trim() === '') {
                return { status: 'error', message: '回复内容不能为空' };
            }

            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            // 直接执行插入操作
            const insert = this.db.prepare(`INSERT INTO ${tableName} (keyword, reply) VALUES (?, ?)`);
            const result = insert.run(keyword, reply);

            logger.info(`添加文字回复成功，表名: ${tableName}, 关键词: ${keyword}, 回复: ${reply}`);

            return {
                status: 'success',
                id: result.lastInsertRowid,
                reply: {
                    id: result.lastInsertRowid,
                    keyword,
                    reply
                }
            };
        } catch (error) {
            logger.error(`添加文字回复失败, 表名: ${tableName}, 错误: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新文字回复
     * @param {string} tableName 表名
     * @param {number} id 回复ID
     * @param {string} keyword 关键词
     * @param {string} reply 回复内容
     */
    async updateReply(tableName, id, keyword, reply) {
        try {
            if (!keyword || keyword.trim() === '') {
                return { status: 'error', message: '关键词不能为空' };
            }

            if (!reply || reply.trim() === '') {
                return { status: 'error', message: '回复内容不能为空' };
            }

            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            const update = this.db.prepare(`UPDATE ${tableName} SET keyword = ?, reply = ? WHERE id = ?`);
            const result = update.run(keyword, reply, id);

            if (result.changes === 0) {
                return { status: 'error', message: '回复不存在' };
            }

            logger.info(`更新文字回复成功，表名: ${tableName}, ID: ${id}, 关键词: ${keyword}, 回复: ${reply}`);
            return { status: 'success', message: '更新成功' };
        } catch (error) {
            logger.error(`更新文字回复失败, 表名: ${tableName}, ID: ${id}, 错误: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除文字回复
     * @param {string} tableName 表名
     * @param {number} id 回复ID
     */
    async deleteReply(tableName, id) {
        try {
            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            if (!exists_flag) {
                return { status: 'error', message: `表"${tableName}"不存在` };
            }

            // 执行删除，保持最简单的删除逻辑
            const deleteReply = this.db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
            const result = deleteReply.run(id);

            if (result.changes === 0) {
                return { status: 'error', message: '回复不存在' };
            }

            logger.info(`删除文字回复成功，表名: ${tableName}, ID: ${id}`);
            return { status: 'success', message: '删除成功' };
        } catch (error) {
            logger.error(`删除文字回复失败, 表名: ${tableName}, ID: ${id}, 错误: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 检查并修复默认回复表
     */
    async checkAndFixDefaultReplyTable() {
        try {
            const tableName = 'reply';
            // 检查表是否存在
            const tableExists = await this.checkTableExists(tableName);
            if (!tableExists) {
                logger.info('默认回复表不存在，创建之');
                await this.createTable(tableName);
                return { code: 0, message: '成功创建默认回复表' };
            }
            return { code: 0, message: '默认回复表已存在' };
        } catch (error) {
            logger.error(`检查默认回复表失败: ${error.message}`);
            return { code: -1, message: `检查默认回复表失败: ${error.message}` };
        }
    }

    /**
     * 导出场控脚本表格数据
     * @param {string} tableName - 表名
     * @param {Object} event - 事件对象，用于发送保存对话框
     * @returns {Object} 操作结果
     */
    async exportScriptTable(tableName, event) {
        try {
            // 获取表格数据
            const scripts = await this.getScripts(tableName);
            if (!scripts || scripts.status !== 'success' || !scripts.scripts || scripts.scripts.length === 0) {
                return { status: 'error', message: '导出失败：没有找到表格数据' };
            }

            // 显示保存对话框
            const saveOptions = {
                title: '保存场控脚本表格',
                defaultPath: path.join(app.getPath('desktop'), `${tableName}_scripts_${new Date().getTime()}`),
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ]
            };

            const { canceled, filePath } = await dialog.showSaveDialog(saveOptions);
            if (canceled || !filePath) {
                return { status: 'error', message: '用户取消导出' };
            }

            const fileExt = path.extname(filePath).toLowerCase();

            if (fileExt === '.xlsx') {
                // 导出为Excel格式
                try {
                    // 需要安装xlsx库: npm install xlsx --save
                    const XLSX = require('xlsx');

                    // 准备Excel数据
                    const wsData = scripts.scripts.map(script => ({
                        ID: script.id,
                        内容: script.content
                    }));

                    // 创建工作簿和工作表
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(wsData);

                    // 添加工作表到工作簿
                    XLSX.utils.book_append_sheet(wb, ws, '场控脚本');

                    // 写入文件
                    XLSX.writeFile(wb, filePath);

                    logger.info(`场控脚本表格成功导出为Excel到: ${filePath}`);
                    return { status: 'success', message: '导出Excel成功', filePath };
                } catch (error) {
                    logger.error(`导出为Excel格式失败: ${error.message}`);
                    return { status: 'error', message: `导出为Excel格式失败: ${error.message}` };
                }
            } else {
                // 导出为JSON格式
                // 准备导出数据
                const exportData = {
                    tableName: tableName,
                    scripts: scripts.scripts,
                    exportTime: new Date().toISOString(),
                    version: '1.0'
                };

                // 保存到文件
                fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
                logger.info(`场控脚本表格成功导出到: ${filePath}`);

                return { status: 'success', message: '导出JSON成功', filePath };
            }
        } catch (error) {
            logger.error(`导出场控脚本表格失败: ${error.message}`);
            return { status: 'error', message: `导出失败: ${error.message}` };
        }
    }

    /**
     * 导出关键词回复表格数据
     * @param {string} tableName - 表名
     * @param {Object} event - 事件对象，用于发送保存对话框
     * @returns {Object} 操作结果
     */
    async exportReplyTable(tableName, event) {
        try {
            // 获取表格数据
            const replies = await this.getReplies(tableName);
            if (!replies || replies.status !== 'success' || !replies.replies || replies.replies.length === 0) {
                return { status: 'error', message: '导出失败：没有找到表格数据' };
            }

            // 显示保存对话框
            const saveOptions = {
                title: '保存关键词回复表格',
                defaultPath: path.join(app.getPath('desktop'), `${tableName}_replies_${new Date().getTime()}`),
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ]
            };

            const { canceled, filePath } = await dialog.showSaveDialog(saveOptions);
            if (canceled || !filePath) {
                return { status: 'error', message: '用户取消导出' };
            }

            const fileExt = path.extname(filePath).toLowerCase();

            if (fileExt === '.xlsx') {
                // 导出为Excel格式
                try {
                    // 需要安装xlsx库: npm install xlsx --save
                    const XLSX = require('xlsx');

                    // 准备Excel数据
                    const wsData = replies.replies.map(reply => ({
                        ID: reply.id,
                        关键词: reply.keyword,
                        回复内容: reply.reply
                    }));

                    // 创建工作簿和工作表
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(wsData);

                    // 添加工作表到工作簿
                    XLSX.utils.book_append_sheet(wb, ws, '关键词回复');

                    // 写入文件
                    XLSX.writeFile(wb, filePath);

                    logger.info(`关键词回复表格成功导出为Excel到: ${filePath}`);
                    return { status: 'success', message: '导出Excel成功', filePath };
                } catch (error) {
                    logger.error(`导出为Excel格式失败: ${error.message}`);
                    return { status: 'error', message: `导出为Excel格式失败: ${error.message}` };
                }
            } else {
                // 导出为JSON格式
                // 准备导出数据
                const exportData = {
                    tableName: tableName,
                    replies: replies.replies,
                    exportTime: new Date().toISOString(),
                    version: '1.0'
                };

                // 保存到文件
                fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
                logger.info(`关键词回复表格成功导出到: ${filePath}`);

                return { status: 'success', message: '导出JSON成功', filePath };
            }
        } catch (error) {
            logger.error(`导出关键词回复表格失败: ${error.message}`);
            return { status: 'error', message: `导出失败: ${error.message}` };
        }
    }

    /**
     * 导入场控脚本表格数据
     * @param {string} tableName - 表名
     * @param {Object} event - 事件对象，用于发送打开对话框
     * @returns {Object} 操作结果
     */
    async importScriptTable(tableName, event) {
        try {
            // 显示打开对话框
            const openOptions = {
                title: '导入场控脚本表格',
                defaultPath: app.getPath('desktop'),
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ],
                properties: ['openFile']
            };

            const { canceled, filePaths } = await dialog.showOpenDialog(openOptions);
            if (canceled || filePaths.length === 0) {
                return { status: 'error', message: '用户取消导入' };
            }

            // 读取文件
            const filePath = filePaths[0];
            const fileExt = path.extname(filePath).toLowerCase();

            let scriptsToImport = [];

            if (fileExt === '.xlsx' || fileExt === '.xls') {
                // 导入Excel文件
                try {
                    const XLSX = require('xlsx');
                    const workbook = XLSX.readFile(filePath);

                    // 获取第一个工作表
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // 将工作表转换为JSON
                    const data = XLSX.utils.sheet_to_json(worksheet);

                    // 提取内容字段（根据Excel的列名）
                    scriptsToImport = data.map(row => ({
                        content: row['内容'] || row['content'] || row['Content'] || '',
                    })).filter(script => script.content.trim() !== '');

                    if (scriptsToImport.length === 0) {
                        return { status: 'error', message: '导入失败：未在Excel中找到有效内容数据' };
                    }
                } catch (error) {
                    logger.error(`解析Excel文件失败: ${error.message}`);
                    return { status: 'error', message: `解析Excel文件失败: ${error.message}` };
                }
            } else {
                // 导入JSON文件
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const importData = JSON.parse(fileContent);

                    // 验证导入数据格式
                    if (!importData.scripts || !Array.isArray(importData.scripts)) {
                        return { status: 'error', message: '导入失败：JSON文件格式不正确' };
                    }

                    scriptsToImport = importData.scripts;
                } catch (error) {
                    logger.error(`解析JSON文件失败: ${error.message}`);
                    return { status: 'error', message: `解析JSON文件失败: ${error.message}` };
                }
            }

            // 检查表是否存在
            const tableExists = await this.checkTableExists(tableName);
            if (!tableExists) {
                // 如果表不存在，创建新表
                const result = await this.createScriptTable('导入的场控组');
                if (result.status === 'success') {
                    tableName = result.tableName;
                } else {
                    return { status: 'error', message: '创建新表失败' };
                }
            }

            // 导入数据
            let importedCount = 0;
            for (const script of scriptsToImport) {
                try {
                    // 确保content属性存在
                    const content = script.content || '';
                    if (content.trim() !== '') {
                        await this.addScript(tableName, content);
                        importedCount++;
                    }
                } catch (err) {
                    logger.error(`导入单条场控脚本失败: ${err.message}`);
                }
            }

            logger.info(`成功导入场控脚本表格数据，共 ${importedCount} 条记录`);
            return {
                status: 'success',
                message: `导入成功，共 ${importedCount} 条记录`,
                importedCount: importedCount
            };
        } catch (error) {
            logger.error(`导入场控脚本表格失败: ${error.message}`);
            return { status: 'error', message: `导入失败: ${error.message}` };
        }
    }

    /**
     * 导入关键词回复表格数据
     * @param {string} tableName - 表名
     * @param {Object} event - 事件对象，用于发送打开对话框
     * @returns {Object} 操作结果
     */
    async importReplyTable(tableName, event) {
        try {
            // 显示打开对话框
            const openOptions = {
                title: '导入关键词回复表格',
                defaultPath: app.getPath('desktop'),
                filters: [
                    { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
                    { name: 'JSON Files', extensions: ['json'] }
                ],
                properties: ['openFile']
            };

            const { canceled, filePaths } = await dialog.showOpenDialog(openOptions);
            if (canceled || filePaths.length === 0) {
                return { status: 'error', message: '用户取消导入' };
            }

            // 读取文件
            const filePath = filePaths[0];
            const fileExt = path.extname(filePath).toLowerCase();

            let repliesToImport = [];

            if (fileExt === '.xlsx' || fileExt === '.xls') {
                // 导入Excel文件
                try {
                    const XLSX = require('xlsx');
                    const workbook = XLSX.readFile(filePath);

                    // 获取第一个工作表
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // 将工作表转换为JSON
                    const data = XLSX.utils.sheet_to_json(worksheet);

                    // 提取关键词和回复内容字段（适配不同的列名）
                    repliesToImport = data.map(row => ({
                        keyword: row['关键词'] || row['keyword'] || row['Keyword'] || '',
                        reply: row['回复内容'] || row['reply'] || row['Reply'] || row['内容'] || row['content'] || '',
                    })).filter(reply =>
                        reply.keyword.trim() !== '' &&
                        reply.reply.trim() !== ''
                    );

                    if (repliesToImport.length === 0) {
                        return { status: 'error', message: '导入失败：未在Excel中找到有效的关键词和回复数据' };
                    }
                } catch (error) {
                    logger.error(`解析Excel文件失败: ${error.message}`);
                    return { status: 'error', message: `解析Excel文件失败: ${error.message}` };
                }
            } else {
                // 导入JSON文件
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    const importData = JSON.parse(fileContent);

                    // 验证导入数据格式
                    if (!importData.replies || !Array.isArray(importData.replies)) {
                        return { status: 'error', message: '导入失败：JSON文件格式不正确' };
                    }

                    repliesToImport = importData.replies;
                } catch (error) {
                    logger.error(`解析JSON文件失败: ${error.message}`);
                    return { status: 'error', message: `解析JSON文件失败: ${error.message}` };
                }
            }

            // 检查表是否存在
            const tableExists = await this.checkTableExists(tableName);
            if (!tableExists) {
                // 如果表不存在，创建新表
                const result = await this.createReplyTable('导入的关键词组');
                if (result.status === 'success') {
                    tableName = result.tableName;
                } else {
                    return { status: 'error', message: '创建新表失败' };
                }
            }

            // 导入数据
            let importedCount = 0;
            for (const reply of repliesToImport) {
                try {
                    // 确保keyword和reply属性存在且不为空
                    if (reply.keyword && reply.keyword.trim() !== '' &&
                        reply.reply && reply.reply.trim() !== '') {
                        await this.addReply(tableName, reply.keyword, reply.reply);
                        importedCount++;
                    }
                } catch (err) {
                    logger.error(`导入单条关键词回复失败: ${err.message}`);
                }
            }

            logger.info(`成功导入关键词回复表格数据，共 ${importedCount} 条记录`);
            return {
                status: 'success',
                message: `导入成功，共 ${importedCount} 条记录`,
                importedCount: importedCount
            };
        } catch (error) {
            logger.error(`导入关键词回复表格失败: ${error.message}`);
            return { status: 'error', message: `导入失败: ${error.message}` };
        }
    }

    /**
     * 检查表是否存在
     * @param {string} tableName 表名
     * @returns {boolean} 表是否存在
     */
    async checkTableExists(tableName) {
        try {
            // 使用EXISTS检查表是否存在
            const tableCheckSql = `
            SELECT EXISTS (
                SELECT 1 FROM sqlite_master 
                WHERE type='table' AND name = ?
            ) as exists_flag`;

            const tableCheck = this.db.prepare(tableCheckSql);
            const { exists_flag } = tableCheck.get(tableName);

            return exists_flag === 1;
        } catch (error) {
            logger.error(`检查表是否存在失败: ${error.message}`);
            return false;
        }
    }
}

ScriptdbService.toString = () => '[class ScriptdbService]';

module.exports = {
    ScriptdbService,
    scriptdbService: new ScriptdbService()
};