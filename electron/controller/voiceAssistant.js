/**
 * 语音助手控制器
 */
'use strict';

const { logger } = require('ee-core/log');
const { voiceAssistantService } = require('../service/voiceAssistant');

/**
 * 语音助手控制器
 * @class
 */
class VoiceAssistantController {
    constructor() {
        this.voiceAssistantService = voiceAssistantService;
    }

    /**
     * 获取音频组列表
     */
    async getAudioGroups() {
        try {
            const groups = await this.voiceAssistantService.getAudioGroups();
            return this.success('获取音频组列表成功', groups);
        } catch (error) {
            logger.error(`获取音频组列表失败: ${error.message}`);
            return this.fail(`获取音频组列表失败: ${error.message}`);
        }
    }

    /**
     * 获取音频文件列表
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     */
    async getAudioFiles(args) {
        try {
            const { groupName } = args;
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            const files = await this.voiceAssistantService.getAudioFiles(groupName);
            return this.success('获取音频文件列表成功', files);
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return this.fail(`获取音频文件列表失败: ${error.message}`);
        }
    }

    /**
     * 启动语音助手
     * @param {Object} args - 参数
     * @param {string} args.groupName - 音频组名称
     * @param {Object} args.settings - 语音助手设置
     */
    async startVoiceAssistant(args) {
        try {
            const { groupName, settings } = args || {};
            if (!groupName) {
                return this.fail('缺少必要参数: groupName');
            }

            logger.info(`尝试启动语音助手，使用音频组: ${groupName}`);

            // 处理设置对象，确保数据类型正确
            let validSettings = null;
            if (settings) {
                validSettings = {
                    volume: typeof settings.volume === 'number' ? settings.volume : 80,
                    playbackRate: typeof settings.playbackRate === 'number' ? settings.playbackRate : 1.0,
                    minInterval: typeof settings.minInterval === 'number' ? settings.minInterval : 5,
                    maxInterval: typeof settings.maxInterval === 'number' ? settings.maxInterval : 10,
                    playMode: typeof settings.playMode === 'string' ? settings.playMode : 'random'
                };
                logger.info(`语音助手设置: ${JSON.stringify(validSettings)}`);
            }

            const result = await this.voiceAssistantService.start(groupName, validSettings);
            if (result) {
                return this.success('启动语音助手成功');
            } else {
                return this.fail('启动语音助手失败');
            }
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            return this.fail(`启动语音助手失败: ${error.message}`);
        }
    }

    /**
     * 停止语音助手
     */
    async stopVoiceAssistant() {
        try {
            const result = await this.voiceAssistantService.stop();
            if (result) {
                return this.success('停止语音助手成功');
            } else {
                return this.fail('停止语音助手失败');
            }
        } catch (error) {
            logger.error(`停止语音助手失败: ${error.message}`);
            return this.fail(`停止语音助手失败: ${error.message}`);
        }
    }

    /**
     * 获取语音助手状态
     */
    async getVoiceAssistantStatus() {
        try {
            const status = this.voiceAssistantService.getStatus();
            return this.success('获取语音助手状态成功', status);
        } catch (error) {
            logger.error(`获取语音助手状态失败: ${error.message}`);
            return this.fail(`获取语音助手状态失败: ${error.message}`);
        }
    }

    /**
     * 播放单个音频文件
     * @param {Object} args - 参数
     * @param {string} args.filePath - 文件路径
     * @param {number} args.volume - 音量 (0-1)
     * @param {number} args.playbackRate - 播放速率
     * @returns {Object} - 操作结果
     */
    playAudioFile(args) {
        try {
            const { filePath, volume, playbackRate } = args;
            if (!filePath) {
                return this.fail('缺少文件路径参数');
            }

            const fs = require('fs');
            if (!fs.existsSync(filePath)) {
                return this.fail(`文件不存在: ${filePath}`);
            }

            // 获取voiceAssistantService实例
            const { voiceAssistantService } = require('../service/voiceAssistant');

            // 调用服务层播放音频
            const result = voiceAssistantService.playSingleAudio(filePath, {
                volume: volume || 0.8,
                playbackRate: playbackRate || 1.0
            });

            if (result) {
                return this.success('开始播放音频');
            } else {
                return this.fail('播放音频失败');
            }
        } catch (error) {
            logger.error(`播放音频文件出错: ${error.message}`);
            return this.fail(`播放音频文件出错: ${error.message}`);
        }
    }

    /**
     * 成功响应
     * @param {string} message - 消息
     * @param {*} data - 数据
     * @returns {Object} - 响应对象
     */
    success(message, data = null) {
        return {
            status: 'success',
            message,
            data
        };
    }

    /**
     * 失败响应
     * @param {string} message - 消息
     * @returns {Object} - 响应对象
     */
    fail(message) {
        return {
            status: 'error',
            message
        };
    }
}

VoiceAssistantController.toString = () => '[class VoiceAssistantController]';
module.exports = VoiceAssistantController;