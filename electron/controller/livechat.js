'use strict';

const { livechatService } = require('../service/livechat');
const { scriptdbService } = require('../service/scriptdb');
const { logger } = require('ee-core/log');

/**
 * 直播聊天控制器
 * @class
 */
class LiveChatController {

    constructor() {
        // 初始化脚本数据库
        scriptdbService.init();
    }

    /**
     * 获取直播间状态
     * @param {object} args - 参数
     * @param {string} args.liveId - 直播间ID
     */
    async getRoomStatus(args) {
        try {
            const { liveId } = args;
            if (!liveId) {
                return { status: 'error', message: '缺少直播间ID参数' };
            }
            const result = await livechatService.getRoomStatus(liveId);
            return result;
        } catch (error) {
            logger.error('获取直播间状态失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 开始监控直播间
     * @param {object} args - 参数
     * @param {string} args.liveId - 直播间ID
     */
    async startMonitoring(args) {
        try {
            const { liveId } = args;
            if (!liveId) {
                return { status: 'error', message: '缺少直播间ID参数' };
            }
            const result = await livechatService.startMonitoring(liveId);
            return result;
        } catch (error) {
            logger.error('开始监控直播间失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 停止监控直播间
     * @param {object} args - 参数
     * @param {string} args.liveId - 直播间ID
     */
    async stopMonitoring(args) {
        try {
            const { liveId } = args;
            if (!liveId) {
                return { status: 'error', message: '缺少直播间ID参数' };
            }
            const result = await livechatService.stopMonitoring(liveId);
            return result;
        } catch (error) {
            logger.error('停止监控直播间失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取直播间事件流URL
     * @param {object} args - 参数
     * @param {string} args.liveId - 直播间ID
     */
    getEventsUrl(args) {
        try {
            const { liveId } = args;
            if (!liveId) {
                return { status: 'error', message: '缺少直播间ID参数' };
            }
            const eventsUrl = livechatService.getEventsUrl(liveId);
            return { status: 'success', url: eventsUrl };
        } catch (error) {
            logger.error('获取事件流URL失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取直播间监控状态
     * @param {object} args - 参数
     * @param {string} args.liveId - 直播间ID
     */
    getMonitoringStatus(args) {
        try {
            const { liveId } = args;

            // 如果没有指定liveId，则返回所有正在监控的直播间
            if (!liveId) {
                const monitoringRooms = livechatService.getAllMonitoringRooms();
                return {
                    status: 'success',
                    rooms: monitoringRooms
                };
            }

            // 否则返回指定直播间的监控状态
            const isMonitoring = livechatService.isMonitoring(liveId);
            return {
                status: 'success',
                isMonitoring: isMonitoring
            };
        } catch (error) {
            logger.error('获取监控状态失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取所有控场话术表
     */
    async getScriptTables() {
        try {
            const result = await scriptdbService.getScriptTables();
            return result;
        } catch (error) {
            logger.error('获取控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 获取指定表的所有脚本
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     */
    async getScripts(args) {
        try {
            const { tableName } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            const result = await scriptdbService.getScripts(tableName);
            return result;
        } catch (error) {
            logger.error('获取控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 添加控场话术
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     * @param {string} args.content - 内容
     */
    async addScript(args) {
        try {
            const { tableName, content } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            if (!content) {
                return { status: 'error', message: '缺少内容参数' };
            }
            const result = await scriptdbService.addScript(tableName, content);
            return result;
        } catch (error) {
            logger.error('添加控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新控场话术
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     * @param {number} args.id - 话术ID
     * @param {string} args.content - 内容
     */
    async updateScript(args) {
        try {
            const { tableName, id, content } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            if (!id) {
                return { status: 'error', message: '缺少ID参数' };
            }
            if (!content) {
                return { status: 'error', message: '缺少内容参数' };
            }
            const result = await scriptdbService.updateScript(tableName, id, content);
            return result;
        } catch (error) {
            logger.error('更新控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除控场话术
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     * @param {number} args.id - 话术ID
     */
    async deleteScript(args) {
        try {
            const { tableName, id } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            if (!id && id !== 0) {
                return { status: 'error', message: '缺少ID参数' };
            }

            // 直接调用服务层删除方法
            const result = await scriptdbService.deleteScript(tableName, id);
            return result;
        } catch (error) {
            logger.error('删除控场话术失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 创建控场话术表
     * @param {object} args - 参数
     * @param {string} args.displayName - 显示名称
     */
    async createScriptTable(args) {
        try {
            const { displayName } = args;
            if (!displayName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            const result = await scriptdbService.createScriptTable(displayName);
            return result;
        } catch (error) {
            logger.error('创建控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 更新控场话术表名
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     * @param {string} args.newDisplayName - 新显示名称
     */
    async updateScriptTable(args) {
        try {
            const { tableName, newDisplayName } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            if (!newDisplayName) {
                return { status: 'error', message: '缺少新表名参数' };
            }
            const result = await scriptdbService.updateScriptTable(tableName, newDisplayName);
            return result;
        } catch (error) {
            logger.error('更新控场话术表名失败', error);
            return { status: 'error', message: error.message };
        }
    }

    /**
     * 删除控场话术表
     * @param {object} args - 参数
     * @param {string} args.tableName - 表名
     */
    async deleteScriptTable(args) {
        try {
            const { tableName } = args;
            if (!tableName) {
                return { status: 'error', message: '缺少表名参数' };
            }
            const result = await scriptdbService.deleteScriptTable(tableName);
            return result;
        } catch (error) {
            logger.error('删除控场话术表失败', error);
            return { status: 'error', message: error.message };
        }
    }
}

LiveChatController.toString = () => '[class LiveChatController]';
module.exports = LiveChatController;