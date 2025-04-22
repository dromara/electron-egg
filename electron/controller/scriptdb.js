'use strict';

const { scriptdbService } = require('../service/scriptdb');
const { logger } = require('ee-core/log');

/**
 * 数据库控制器
 * @class
 */
class ScriptdbController {
    constructor() {
        // 初始化脚本数据库
        scriptdbService.init();
    }

    /**
     * 获取所有控场话术表
     */
    async getScriptTables(args, event) {
        logger.info('获取所有控场话术表');
        const result = await scriptdbService.getScriptTables();
        return result;
    }

    /**
     * 获取指定表的所有脚本
     */
    async getScripts(args, event) {
        const { tableName } = args;
        logger.info(`获取控场话术, 表名: ${tableName}`);
        const result = await scriptdbService.getScripts(tableName);
        return result;
    }

    /**
     * 添加控场话术
     */
    async addScript(args, event) {
        const { tableName, content } = args;
        logger.info(`添加控场话术, 表名: ${tableName}, 内容: ${content}`);
        const result = await scriptdbService.addScript(tableName, content);
        return result;
    }

    /**
     * 更新控场话术
     */
    async updateScript(args, event) {
        const { tableName, id, content } = args;
        logger.info(`更新控场话术, 表名: ${tableName}, ID: ${id}`);
        const result = await scriptdbService.updateScript(tableName, id, content);
        return result;
    }

    /**
     * 删除控场话术
     */
    async deleteScript(args, event) {
        const { tableName, id } = args;
        logger.info(`删除控场话术, 表名: ${tableName}, ID: ${id}`);
        const result = await scriptdbService.deleteScript(tableName, id);
        return result;
    }

    /**
     * 创建新的控场话术表
     */
    async createScriptTable(args, event) {
        const { displayName } = args;
        logger.info(`创建控场话术表, 显示名称: ${displayName}`);
        const result = await scriptdbService.createScriptTable(displayName);
        return result;
    }

    /**
     * 更新控场话术表名
     */
    async updateScriptTable(args, event) {
        const { tableName, newDisplayName } = args;
        logger.info(`更新控场话术表名, 表名: ${tableName}, 新名称: ${newDisplayName}`);
        const result = await scriptdbService.updateScriptTable(tableName, newDisplayName);
        return result;
    }

    /**
     * 删除控场话术表
     */
    async deleteScriptTable(args, event) {
        const { tableName } = args;
        logger.info(`删除控场话术表, 表名: ${tableName}`);
        const result = await scriptdbService.deleteScriptTable(tableName);
        return result;
    }

    /**
     * 检查并修复默认表
     */
    async checkAndFixDefaultTable(args, event) {
        logger.info('检查并修复默认控场话术表');
        const result = await scriptdbService.checkAndFixDefaultTable();
        return result;
    }

    /**
     * 获取所有文字回复表
     */
    async getReplyTables(args, event) {
        logger.info('获取所有文字回复表');
        const result = await scriptdbService.getReplyTables();
        return result;
    }

    /**
     * 获取指定表的所有回复
     */
    async getReplies(args, event) {
        const { tableName } = args;
        logger.info(`获取文字回复, 表名: ${tableName}`);
        const result = await scriptdbService.getReplies(tableName);
        return result;
    }

    /**
     * 添加文字回复
     */
    async addReply(args, event) {
        const { tableName, keyword, reply } = args;
        logger.info(`添加文字回复, 表名: ${tableName}, 关键词: ${keyword}`);
        const result = await scriptdbService.addReply(tableName, keyword, reply);
        return result;
    }

    /**
     * 更新文字回复
     */
    async updateReply(args, event) {
        const { tableName, id, keyword, reply } = args;
        logger.info(`更新文字回复, 表名: ${tableName}, ID: ${id}`);
        const result = await scriptdbService.updateReply(tableName, id, keyword, reply);
        return result;
    }

    /**
     * 删除文字回复
     */
    async deleteReply(args, event) {
        const { tableName, id } = args;
        logger.info(`删除文字回复, 表名: ${tableName}, ID: ${id}`);
        const result = await scriptdbService.deleteReply(tableName, id);
        return result;
    }

    /**
     * 创建新的文字回复表
     */
    async createReplyTable(args, event) {
        const { displayName } = args;
        logger.info(`创建文字回复表, 显示名称: ${displayName}`);
        const result = await scriptdbService.createReplyTable(displayName);
        return result;
    }

    /**
     * 更新文字回复表名
     */
    async updateReplyTable(args, event) {
        const { tableName, newDisplayName } = args;
        logger.info(`更新文字回复表名, 表名: ${tableName}, 新名称: ${newDisplayName}`);
        const result = await scriptdbService.updateReplyTable(tableName, newDisplayName);
        return result;
    }

    /**
     * 删除文字回复表
     */
    async deleteReplyTable(args, event) {
        const { tableName } = args;
        logger.info(`删除文字回复表, 表名: ${tableName}`);
        const result = await scriptdbService.deleteReplyTable(tableName);
        return result;
    }

    /**
     * 检查并修复默认回复表
     */
    async checkAndFixDefaultReplyTable(args, event) {
        logger.info('检查并修复默认文字回复表');
        const result = await scriptdbService.checkAndFixDefaultReplyTable();
        logger.info('[checkAndFixDefaultReplyTable] 修复默认回复表:', result);
        return result;
    }

    /**
     * 导出场控脚本表格
     */
    async exportScriptTable(args, event) {
        const tableName = args.tableName;
        logger.info('[exportScriptTable] 导出场控脚本表格:', tableName);
        const result = await scriptdbService.exportScriptTable(tableName, event);
        return result;
    }

    /**
     * 导入场控脚本表格
     */
    async importScriptTable(args, event) {
        const tableName = args.tableName;
        logger.info('[importScriptTable] 导入场控脚本表格:', tableName);
        const result = await scriptdbService.importScriptTable(tableName, event);
        return result;
    }

    /**
     * 导出关键词回复表格
     */
    async exportReplyTable(args, event) {
        const tableName = args.tableName;
        logger.info('[exportReplyTable] 导出关键词回复表格:', tableName);
        const result = await scriptdbService.exportReplyTable(tableName, event);
        return result;
    }

    /**
     * 导入关键词回复表格
     */
    async importReplyTable(args, event) {
        const tableName = args.tableName;
        logger.info('[importReplyTable] 导入关键词回复表格:', tableName);
        const result = await scriptdbService.importReplyTable(tableName, event);
        return result;
    }
}

ScriptdbController.toString = () => '[class ScriptdbController]';
module.exports = ScriptdbController;