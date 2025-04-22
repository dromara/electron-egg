'use strict';

const { liveMonitorService } = require('../service/livesave');
const { logger } = require('ee-core/log');
const { cross } = require('ee-core/cross');
const path = require('path');
const { shell } = require('electron');
const { getExtraResourcesDir } = require('ee-core/ps');
/**
 * 直播监控控制器
 * @class
 */
class LiveMonitorController {

    async startMonitoring(args, event) {
        logger.info('启动URL_config.ini文件监控');

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        const result = liveMonitorService.startWatching(event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 停止监控
     */
    async stopMonitoring(args, event) {
        logger.info('停止URL_config.ini文件监控');
        const result = liveMonitorService.stopWatching();

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 手动获取最新配置
     */
    async getLatestConfig(args, event) {
        logger.info('手动获取URL_config.ini最新配置');

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        // 确保args参数存在
        args = args || {};

        const result = liveMonitorService.getLatestConfig(event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 添加直播链接
     */
    async addLiveUrl(args, event) {
        logger.info(`添加新的直播链接: ${JSON.stringify(args)}`);

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        const result = await liveMonitorService.addLiveUrl(args, event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 接收配置更新消息
     */
    async configUpdate(args, event) {
        // 此方法仅作为标记，实际处理由service层直接通过event.reply完成
        logger.info('接收到配置更新消息');
        return {
            success: true,
            status: 'success',
            message: '接收到配置更新消息'
        };
    }

    /**
     * 更新直播链接的画质
     */
    async updateQuality(args, event) {
        logger.info(`更新直播链接画质: ${JSON.stringify(args)}`);

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        const result = await liveMonitorService.updateQuality(args, event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 删除直播链接
     */
    async removeStream(args, event) {
        logger.info(`删除直播链接: ${JSON.stringify(args)}`);

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        const result = await liveMonitorService.removeStream(args, event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 切换直播链接的监控状态
     */
    async toggleStreamMonitoring(args, event) {
        logger.info(`切换直播链接监控状态: ${JSON.stringify(args)}`);

        // 记录event对象的类型和方法，帮助调试
        if (event) {
            logger.info(`Event 对象信息: reply=${typeof event.reply}, sender=${typeof event.sender}`);
            if (event.sender) {
                logger.info(`Event.sender 对象信息: send=${typeof event.sender.send}`);
            }
        } else {
            logger.warn('收到的event对象为空');
        }

        const result = await liveMonitorService.toggleStreamMonitoring(args, event);

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message
        };
    }

    /**
     * 启动录制器
     */
    async startRecorder(args, event) {
        try {
            logger.info('正在启动录制器');
            const result = await liveMonitorService.startRecorder();
            return {
                success: true,
                status: 'success',
                message: '录制器启动成功',
                data: result
            };
        } catch (error) {
            logger.error('启动录制器失败', error);
            return {
                success: false,
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * 停止录制器
     */
    async stopRecorder(args, event) {
        try {
            logger.info('正在停止录制器');
            cross.killByName('DouyinLiveRecorder');
            return {
                success: true,
                status: 'success',
                message: '录制器已停止'
            };
        } catch (error) {
            logger.error('停止录制器失败', error);
            return {
                success: false,
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * 打开下载目录
     */
    async openDownloadsFolder(args, event) {
        try {
            logger.info('打开录制文件目录');
            // 构建下载目录路径
            const downloadsPath = path.join(getExtraResourcesDir(), 'py', 'downloads');
            logger.info(`打开目录: ${downloadsPath}`);
            // 打开目录
            await shell.openPath(downloadsPath);
            return {
                success: true,
                status: 'success',
                message: '已打开录制文件目录'
            };
        } catch (error) {
            logger.error('打开录制文件目录失败', error);
            return {
                success: false,
                status: 'error',
                message: error.message
            };
        }
    }
}

LiveMonitorController.toString = () => '[class LiveMonitorController]';
module.exports = LiveMonitorController;