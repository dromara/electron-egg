/**
 * 自动场控和自动回复控制器
 */
'use strict';

const { logger } = require('ee-core/log');
const { livechatAutoControlService } = require('../service/livechatAutoControl');

/**
 * 自动场控和自动回复控制器
 * @class
 */
class LivechatAutoControlController {
    constructor() {
        this.livechatAutoControlService = livechatAutoControlService;
    }

    /**
     * 连接到直播间
     */
    async connectToLiveRoom(args) {
        const { roomId } = args;

        if (!roomId) {
            return this.fail('缺少必要参数: roomId');
        }

        try {
            logger.info(`尝试连接到直播间 ID: ${roomId}`);
            const result = await this.livechatAutoControlService.connect(roomId);

            if (result) {
                // 确保服务的连接状态已更新
                this.livechatAutoControlService.isConnected = true;

                // 返回成功结果并包含当前状态
                return this.success('成功连接到直播间', {
                    isConnected: this.livechatAutoControlService.isConnected,
                    isAutoControlEnabled: this.livechatAutoControlService.isAutoControlEnabled,
                    isAutoReplyEnabled: this.livechatAutoControlService.isAutoReplyEnabled
                });
            } else {
                return this.fail('连接直播间失败');
            }
        } catch (error) {
            logger.error(`连接直播间出错: ${error.message}`);
            return this.fail(`连接失败: ${error.message}`);
        }
    }

    /**
     * 断开直播间连接
     */
    async disconnectFromLiveRoom(args) {
        try {
            await this.livechatAutoControlService.disconnect();
            return this.success('已断开直播间连接');
        } catch (error) {
            logger.error(`断开直播间连接出错: ${error.message}`);
            return this.fail(`断开连接失败: ${error.message}`);
        }
    }

    /**
     * 启动自动场控
     */
    async startAutoControl(args) {
        const { scripts, settings } = args;

        if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
            return this.fail('缺少必要参数: scripts');
        }

        try {
            logger.info('尝试启动自动场控');
            const result = await this.livechatAutoControlService.startAutoControl(scripts, settings);

            if (result) {
                return this.success('自动场控已启动');
            } else {
                return this.fail('启动自动场控失败');
            }
        } catch (error) {
            logger.error(`启动自动场控出错: ${error.message}`);
            return this.fail(`启动失败: ${error.message}`);
        }
    }

    /**
     * 停止自动场控
     */
    async stopAutoControl() {
        try {
            const result = await this.livechatAutoControlService.stopAutoControl();

            if (result) {
                return this.success('自动场控已停止');
            } else {
                return this.fail('停止自动场控失败');
            }
        } catch (error) {
            logger.error(`停止自动场控出错: ${error.message}`);
            return this.fail(`停止失败: ${error.message}`);
        }
    }

    /**
     * 发送单条消息
     */
    async sendMessage(args) {
        const { message } = args;

        if (!message) {
            return this.fail('缺少必要参数: message');
        }

        try {
            const result = await this.livechatAutoControlService.sendMessage(message);

            if (result) {
                return this.success('消息发送成功');
            } else {
                return this.fail('消息发送失败');
            }
        } catch (error) {
            logger.error(`发送消息出错: ${error.message}`);
            return this.fail(`发送失败: ${error.message}`);
        }
    }

    /**
     * 获取连接状态
     */
    async getConnectionStatus() {
        try {
            const status = this.livechatAutoControlService.getConnectionStatus();
            if (status.status === 'success') {
                return this.success('获取状态成功', {
                    connected: status.connected,
                    roomId: status.roomId
                });
            } else {
                return this.fail(status.message);
            }
        } catch (error) {
            logger.error(`获取状态出错: ${error.message}`);
            return this.fail(`获取状态失败: ${error.message}`);
        }
    }

    /**
     * 启动自动回复
     */
    async startAutoReply(args) {
        const { tableName, replyItems, settings } = args;

        if (!tableName) {
            return this.fail('缺少必要参数: tableName');
        }

        if (!replyItems || !Array.isArray(replyItems) || replyItems.length === 0) {
            return this.fail('缺少必要参数: replyItems');
        }

        try {
            logger.info('启动自动回复，参数:', {
                tableName,
                replyItemsCount: replyItems.length,
                settings
            });

            // 确保服务已连接
            if (!this.livechatAutoControlService.isConnected) {
                logger.error('未连接到直播间，无法启动自动回复');
                return this.fail('未连接到直播间');
            }

            // 调用服务层方法，注意参数顺序
            const result = await this.livechatAutoControlService.startAutoReply(
                tableName,
                replyItems,
                settings
            );

            if (result) {
                logger.info('自动回复启动成功');
                return this.success('自动回复已启动');
            } else {
                logger.error('启动自动回复失败');
                return this.fail('启动自动回复失败');
            }
        } catch (error) {
            logger.error(`启动自动回复出错: ${error.message}`, error);
            return this.fail(`启动失败: ${error.message}`);
        }
    }

    /**
     * 停止自动回复
     */
    async stopAutoReply() {
        try {
            const result = await this.livechatAutoControlService.stopAutoReply();

            if (result) {
                return this.success('自动回复已停止');
            } else {
                return this.fail('停止自动回复失败');
            }
        } catch (error) {
            logger.error(`停止自动回复出错: ${error.message}`);
            return this.fail(`停止失败: ${error.message}`);
        }
    }

    /**
     * 获取表情列表
     */
    async getEmojis() {
        try {
            const emojis = this.livechatAutoControlService.getEmojis();
            return this.success('获取表情列表成功', emojis);
        } catch (error) {
            logger.error(`获取表情列表出错: ${error.message}`);
            return this.fail(`获取表情列表失败: ${error.message}`);
        }
    }

    /**
     * 保存表情列表
     */
    async saveEmojis(args) {
        const { emojis } = args;

        if (!emojis || !Array.isArray(emojis)) {
            return this.fail('缺少必要参数: emojis');
        }

        try {
            const result = this.livechatAutoControlService.saveEmojis(emojis);
            if (result) {
                return this.success('保存表情列表成功');
            } else {
                return this.fail('保存表情列表失败');
            }
        } catch (error) {
            logger.error(`保存表情列表出错: ${error.message}`);
            return this.fail(`保存失败: ${error.message}`);
        }
    }

    /**
     * 获取自动场控状态
     */
    async getAutoControlStatus() {
        try {
            const result = this.livechatAutoControlService.getAutoControlStatus();
            logger.info(`控制器获取到自动场控状态: ${JSON.stringify(result)}`);
            return result; // 直接返回服务层结果
        } catch (e) {
            logger.error(`获取自动场控状态失败: ${e.message}`);
            return this.fail(e.message);
        }
    }

    /**
     * 获取自动回复状态
     */
    async getAutoReplyStatus() {
        try {
            const result = this.livechatAutoControlService.getAutoReplyStatus();
            logger.info(`控制器获取到自动回复状态: ${JSON.stringify(result)}`);
            return result; // 直接返回服务层结果
        } catch (e) {
            logger.error(`获取自动回复状态失败: ${e.message}`);
            return this.fail(e.message);
        }
    }

    /**
     * 响应成功结果
     * @param {string} message - 成功消息
     * @param {any} data - 返回数据
     * @returns {Object} - 响应结果
     */
    success(message, data = null) {
        return {
            status: 'success',
            message,
            data
        };
    }

    /**
     * 响应失败结果
     * @param {string} message - 失败消息
     * @param {any} data - 返回数据
     * @returns {Object} - 响应结果
     */
    fail(message, data = null) {
        return {
            status: 'fail',
            message,
            data
        };
    }
}

LivechatAutoControlController.toString = () => '[class LivechatAutoControlController]';
module.exports = LivechatAutoControlController;