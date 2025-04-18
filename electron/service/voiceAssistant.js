/**
 * 语音助手服务
 */
'use strict';

const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { logger } = require('ee-core/log');
const { getMainWindow } = require('ee-core/electron');
const { getDataDir } = require('ee-core/ps');

// 将fs操作转换为Promise版本
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

/**
 * 语音助手服务
 * @class
 */
class VoiceAssistantService {
    constructor() {
        this.isEnabled = false;
        this.audioFolder = path.join(getDataDir(), 'audio');
        this.audioGroups = [];
        this.currentAudioGroup = '';
        this.audioFiles = [];
        this.playTimer = null;
        this.currentIndex = 0;
        this.settings = {
            volume: 80,
            playbackRate: 1.0,
            minInterval: 5,
            maxInterval: 10,
            playMode: 'random'
        };
        this.lastPlayTime = 0;

        // 确保音频文件夹存在
        this.ensureAudioFolderExists();
    }

    /**
     * 确保音频文件夹存在
     */
    ensureAudioFolderExists() {
        try {
            if (!fs.existsSync(this.audioFolder)) {
                fs.mkdirSync(this.audioFolder, { recursive: true });
                logger.info(`创建音频文件夹: ${this.audioFolder}`);

                // 创建一个示例音频组
                const exampleGroup = '示例音频';
                const groupPath = path.join(this.audioFolder, exampleGroup);
                if (!fs.existsSync(groupPath)) {
                    fs.mkdirSync(groupPath, { recursive: true });
                    logger.info(`创建示例音频组文件夹: ${groupPath}`);
                }
            }
        } catch (error) {
            logger.error(`创建音频文件夹失败: ${error.message}`);
        }
    }

    /**
     * 获取音频组列表
     * @returns {Promise<Array>} - 音频组列表
     */
    async getAudioGroups() {
        try {
            const entries = await readdir(this.audioFolder, { withFileTypes: true });
            const folders = entries
                .filter(entry => entry.isDirectory())
                .map(dir => dir.name);

            this.audioGroups = folders;
            logger.info(`获取到音频组列表: ${folders.join(', ')}`);
            return folders;
        } catch (error) {
            logger.error(`获取音频组列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取音频组中的音频文件
     * @param {string} groupName - 音频组名称
     * @returns {Promise<Array>} - 音频文件列表
     */
    async getAudioFiles(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return [];
            }

            const entries = await readdir(groupPath);
            const audioFiles = [];

            for (const entry of entries) {
                const filePath = path.join(groupPath, entry);
                const stats = await stat(filePath);

                if (stats.isFile() && this.isAudioFile(entry)) {
                    audioFiles.push({
                        name: entry,
                        path: filePath,
                        size: stats.size,
                        modifiedTime: stats.mtime
                    });
                }
            }

            logger.info(`获取到音频组 "${groupName}" 中的音频文件: ${audioFiles.length} 个`);
            return audioFiles;
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 判断文件是否为音频文件
     * @param {string} filename - 文件名
     * @returns {boolean} - 是否为音频文件
     */
    isAudioFile(filename) {
        const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
        const ext = path.extname(filename).toLowerCase();
        return audioExtensions.includes(ext);
    }

    /**
     * 开始语音助手
     * @param {string} groupName - 音频组名称
     * @param {Object} settings - 语音助手设置
     * @returns {Promise<boolean>} - 是否成功开始
     */
    async start(groupName, settings) {
        try {
            // 停止当前可能正在运行的语音助手
            this.stop();

            if (!groupName) {
                logger.error('未提供音频组名称');
                return false;
            }

            // 加载音频文件
            const audioFiles = await this.getAudioFiles(groupName);
            if (audioFiles.length === 0) {
                logger.error(`音频组 "${groupName}" 中没有可播放的音频文件`);
                return false;
            }

            // 保存设置
            this.currentAudioGroup = groupName;
            this.audioFiles = audioFiles;
            this.settings = {...this.settings, ...settings };
            this.isEnabled = true;
            this.currentIndex = 0;
            this.lastPlayTime = Date.now();

            // 开始播放
            this.scheduleNextPlay();

            logger.info(`已启动语音助手，使用音频组: ${groupName}，共 ${audioFiles.length} 个音频文件`);
            return true;
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 停止语音助手
     * @returns {Promise<boolean>} - 是否成功停止
     */
    async stop() {
        try {
            if (this.playTimer) {
                clearTimeout(this.playTimer);
                this.playTimer = null;
            }

            this.isEnabled = false;
            logger.info('已停止语音助手');
            return true;
        } catch (error) {
            logger.error(`停止语音助手失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 安排下一次播放
     */
    scheduleNextPlay() {
        if (!this.isEnabled || this.audioFiles.length === 0) {
            return;
        }

        // 计算下一次播放的延迟时间
        const { minInterval, maxInterval } = this.settings;
        const delay = (minInterval + Math.random() * (maxInterval - minInterval)) * 1000;

        this.playTimer = setTimeout(() => {
            this.playAudio();
        }, delay);

        logger.info(`安排下一次播放，延迟: ${delay / 1000} 秒`);
    }

    /**
     * 播放音频
     */
    playAudio() {
        if (!this.isEnabled || this.audioFiles.length === 0) {
            return;
        }

        // 根据播放模式选择音频文件
        let audioFile;
        if (this.settings.playMode === 'random') {
            const randomIndex = Math.floor(Math.random() * this.audioFiles.length);
            audioFile = this.audioFiles[randomIndex];
        } else {
            audioFile = this.audioFiles[this.currentIndex];
            this.currentIndex = (this.currentIndex + 1) % this.audioFiles.length;
        }

        // 发送播放请求到渲染进程
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
            win.webContents.send('play-audio', {
                filePath: audioFile.path,
                volume: this.settings.volume / 100,
                playbackRate: this.settings.playbackRate
            });

            // 记录日志
            win.webContents.send('livechat-message', {
                type: 'voice_assistant',
                message: `正在播放: ${audioFile.name}`
            });

            logger.info(`正在播放音频: ${audioFile.name}`);
        }

        // 更新最后播放时间
        this.lastPlayTime = Date.now();

        // 安排下一次播放
        this.scheduleNextPlay();
    }

    /**
     * 获取当前状态
     * @returns {Object} - 当前状态
     */
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            currentGroup: this.currentAudioGroup,
            fileCount: this.audioFiles.length,
            settings: this.settings,
            lastPlayTime: this.lastPlayTime
        };
    }

    /**
     * 播放单个音频文件
     * @param {string} filePath - 文件路径
     * @param {Object} options - 播放选项
     * @param {number} options.volume - 音量 (0-1)
     * @param {number} options.playbackRate - 播放速率
     * @returns {boolean} - 是否成功开始播放
     */
    playSingleAudio(filePath, options = {}) {
        try {
            const { volume = 0.8, playbackRate = 1.0 } = options;

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                logger.error(`音频文件不存在: ${filePath}`);
                return false;
            }

            // 检查文件是否为音频文件
            if (!this.isAudioFile(filePath)) {
                logger.error(`文件不是支持的音频格式: ${filePath}`);
                return false;
            }

            // 获取主窗口
            const win = getMainWindow();
            if (!win || win.isDestroyed()) {
                logger.error('无法获取主窗口');
                return false;
            }

            // 将文件转换为URL格式
            const fileUrl = path.resolve(filePath);

            // 使用node-cmd或shell来播放音频，这样可以避免浏览器安全限制
            try {
                const { exec } = require('child_process');
                const fs = require('fs');
                const os = require('os');
                const isWindows = os.platform() === 'win32';
                const isMac = os.platform() === 'darwin';
                const isLinux = os.platform() === 'linux';

                let command = '';

                if (isWindows) {
                    // Windows使用媒体播放器命令行
                    command = `start "" "${fileUrl}"`;
                } else if (isMac) {
                    // macOS使用afplay
                    command = `afplay "${fileUrl}"`;
                } else if (isLinux) {
                    // Linux使用aplay
                    command = `aplay "${fileUrl}"`;
                }

                if (command) {
                    logger.info(`执行播放命令: ${command}`);
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            logger.error(`播放音频出错: ${error.message}`);
                            return;
                        }
                        logger.info('播放音频成功');
                    });

                    // 通知渲染进程
                    win.webContents.send('livechat-message', {
                        type: 'voice_assistant',
                        message: `正在播放: ${path.basename(filePath)}`
                    });

                    return true;
                } else {
                    logger.error('不支持的操作系统');
                    return false;
                }
            } catch (err) {
                logger.error(`执行播放命令出错: ${err.message}`);
                return false;
            }
        } catch (error) {
            logger.error(`播放单个音频文件出错: ${error.message}`);
            return false;
        }
    }
}

// 创建服务实例并导出
const voiceAssistantService = new VoiceAssistantService();
voiceAssistantService.toString = () => '[VoiceAssistantService]';

module.exports = {
    voiceAssistantService,
    VoiceAssistantService
};