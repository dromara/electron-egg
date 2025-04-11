'use strict';

const { livechatService } = require('../service/livechat');
const { logger } = require('ee-core/log');

/**
 * 直播聊天控制器
 * @class
 */
class LiveChatController {

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
}

LiveChatController.toString = () => '[class LiveChatController]';
module.exports = LiveChatController;