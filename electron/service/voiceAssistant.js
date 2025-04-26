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
const { getDataDir, getExtraResourcesDir } = require('ee-core/ps');
const { spawn } = require('child_process');

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
        this.audioFolder = path.join(getExtraResourcesDir(), 'audio');
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
            playMode: 'random',
            deviceId: '' // 存储选中的设备ID
        };
        this.lastPlayTime = 0;
        // 记录所有活跃的播放进程
        this.activeProcesses = [];

        // 确保音频文件夹存在
        this.ensureAudioFolderExists();

        // 在应用退出时清理
        app.on('will-quit', () => {
            this.cleanupAllProcesses();
        });
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
     * 获取音频组中的子文件夹
     * @param {string} groupName - 音频组名称
     * @returns {Promise<Array>} - 子文件夹列表，包含名称和音频文件数量
     */
    async getSubFolders(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return [];
            }

            const entries = await readdir(groupPath, { withFileTypes: true });
            const subFolders = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const folderPath = path.join(groupPath, entry.name);
                    // 获取该子文件夹中的音频文件数量
                    const audioFiles = await this.getAudioFilesInFolder(folderPath);

                    subFolders.push({
                        name: entry.name,
                        path: folderPath,
                        audioCount: audioFiles.length
                    });
                }
            }

            logger.info(`获取到音频组 "${groupName}" 中的子文件夹: ${subFolders.length} 个`);
            return subFolders;
        } catch (error) {
            logger.error(`获取子文件夹列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 获取指定文件夹中的音频文件
     * @param {string} folderPath - 文件夹路径
     * @returns {Promise<Array>} - 音频文件列表
     */
    async getAudioFilesInFolder(folderPath) {
        try {
            if (!fs.existsSync(folderPath)) {
                logger.error(`文件夹不存在: ${folderPath}`);
                return [];
            }

            const entries = await readdir(folderPath);
            const audioFiles = [];

            for (const entry of entries) {
                const filePath = path.join(folderPath, entry);
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

            return audioFiles;
        } catch (error) {
            logger.error(`获取音频文件列表失败: ${error.message}`);
            return [];
        }
    }

    /**
     * 开始语音助手（修改版）
     * @param {string} groupName - 音频组名称
     * @param {Object} settings - 语音助手设置
     * @returns {Promise<boolean>} - 是否成功开始
     */
    async startNewPlayMode(groupName, settings) {
        try {
            // 停止当前可能正在运行的语音助手
            this.stop();

            if (!groupName) {
                logger.error('未提供音频组名称');
                return false;
            }

            // 加载子文件夹列表
            const subFolders = await this.getSubFolders(groupName);
            if (subFolders.length === 0) {
                logger.error(`音频组 "${groupName}" 中没有子文件夹`);
                return false;
            }

            // 初始化每个子文件夹中的音频文件
            for (const folder of subFolders) {
                folder.audioFiles = await this.getAudioFilesInFolder(folder.path);
            }

            // 保存设置
            this.currentAudioGroup = groupName;
            this.subFolders = subFolders;
            this.settings = {...this.settings, ...settings };
            this.isEnabled = true;
            this.currentFolderIndex = 0;

            // 立即开始第一次播放
            this.playAudioFromSubFolder();

            return true;
        } catch (error) {
            logger.error(`启动语音助手失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 从子文件夹中播放音频
     */
    playAudioFromSubFolder() {
        if (!this.isEnabled || !this.subFolders || this.subFolders.length === 0) {
            return;
        }

        // 获取当前应该播放的子文件夹
        const currentFolder = this.subFolders[this.currentFolderIndex];
        logger.info(`准备从子文件夹播放: ${currentFolder.name}`);

        // 检查该文件夹中是否有音频文件
        if (!currentFolder.audioFiles || currentFolder.audioFiles.length === 0) {
            logger.warn(`子文件夹 ${currentFolder.name} 中没有音频文件，跳到下一个文件夹`);
            this.currentFolderIndex = (this.currentFolderIndex + 1) % this.subFolders.length;
            this.scheduleNextPlay();
            return;
        }

        // 在当前子文件夹中随机选择一个音频文件
        const randomIndex = Math.floor(Math.random() * currentFolder.audioFiles.length);
        const audioFile = currentFolder.audioFiles[randomIndex];
        logger.info(`从子文件夹 ${currentFolder.name} 中随机选择音频: ${audioFile.name}`);

        // 发送播放信息到渲染进程
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
            win.webContents.send('livechat-message', {
                type: 'voice_assistant',
                message: `正在播放: ${currentFolder.name}/${audioFile.name}`
            });
        }

        // 使用测试播放逻辑播放音频
        this.playSingleAudio(audioFile.path, {
            volume: this.settings.volume / 100,
            playbackRate: this.settings.playbackRate,
            deviceId: this.settings.deviceId
        });

        // 更新到下一个子文件夹
        this.currentFolderIndex = (this.currentFolderIndex + 1) % this.subFolders.length;

        // 安排下一次播放
        this.scheduleNextPlay();
    }

    /**
     * 使用Python API播放音频
     * @param {string} filePath - 音频文件路径
     */
    async playAudioWithPythonAPI(filePath) {
        try {
            const axios = require('axios');
            const cross = require('ee-core/cross');
            const baseUrl = cross.getCrossUrl('AudioPlayer');

            if (!baseUrl) {
                logger.error('无法获取Python服务地址');
                return false;
            }

            const response = await axios.post(`${baseUrl}/api/play`, {
                file_path: filePath,
                device_id: this.settings.deviceId,
                playback_speed: this.settings.playbackRate
            });

            if (response.data && response.data.code === 0) {
                logger.info(`通过Python API播放音频成功: ${filePath}`);
                return true;
            } else {
                logger.error(`通过Python API播放音频失败: ${response.data?.message || '未知错误'}`);
                return false;
            }
        } catch (error) {
            logger.error(`通过Python API播放音频出错: ${error.message}`);
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
        if (!this.isEnabled || this.subFolders.length === 0) {
            return;
        }

        // 计算下一次播放的延迟时间
        const { minInterval, maxInterval } = this.settings;
        const delay = Math.floor((minInterval + Math.random() * (maxInterval - minInterval)) * 1000);

        // 发送等待消息到渲染进程
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
            win.webContents.send('livechat-message', {
                type: 'voice_assistant',
                message: `等待 ${Math.round(delay/1000)} 秒后播放下一个音频...`
            });
        }

        logger.info(`安排下一次播放，延迟: ${delay / 1000} 秒`);

        this.playTimer = setTimeout(() => {
            this.playAudioFromSubFolder();
        }, delay);
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

        // 使用playSingleAudio来播放文件
        this.playSingleAudio(audioFile.path, {
            volume: this.settings.volume / 100,
            playbackRate: this.settings.playbackRate,
            deviceId: this.settings.deviceId
        });

        // 发送播放信息到渲染进程
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
            const filename = path.basename(audioFile.path);
            win.webContents.send('livechat-message', {
                type: 'voice_assistant',
                message: `正在播放: ${filename}`
            });
        }

        // 安排下一次播放
        this.scheduleNextPlay();

        // 更新最后播放时间
        this.lastPlayTime = Date.now();
    }

    /**
     * 获取服务状态
     * @returns {Object} - 服务状态
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
     * 更新音频输出设备
     * @param {string} deviceId - 设备ID
     * @returns {boolean} - 是否成功更新
     */
    updateAudioDevice(deviceId) {
        try {
            this.settings.deviceId = deviceId;
            logger.info(`已更新音频输出设备: ${deviceId}`);
            return true;
        } catch (error) {
            logger.error(`更新音频设备失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 播放单个音频文件
     * @param {string} filePath - 文件路径
     * @param {Object} options - 播放选项
     * @param {number} options.volume - 音量 (0-1)
     * @param {number} options.playbackRate - 播放速率
     * @param {string} options.deviceId - 设备ID
     * @returns {boolean} - 是否成功开始播放
     */
    async playSingleAudio(filePath, options = {}) {
        try {
            const { volume = 0.8, playbackRate = 1.0, deviceId = '' } = options;

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

            logger.info(`准备播放音频文件: ${filePath}`);

            // 使用 Python API 播放音频
            const axios = require('axios');
            const { pythonServer } = require('./PythonServer');
            const baseUrl = pythonServer.getPythonBaseUrl2();

            if (!baseUrl) {
                logger.error('无法获取Python服务地址');
                return false;
            }

            const response = await axios.post(`${baseUrl}/api/play`, {
                file_path: filePath,
                device_id: deviceId,
                playback_speed: playbackRate,
                volume: volume
            });

            if (response.data && response.data.code === 0) {
                logger.info(`通过Python API播放音频成功: ${filePath}`);
                return true;
            } else {
                logger.error(`通过Python API播放音频失败: ${response.data?.message || '未知错误'}`);
                return false;
            }
        } catch (error) {
            logger.error(`播放单个音频文件出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 清理所有活跃的播放进程
     */
    cleanupAllProcesses() {
        try {
            logger.info(`清理 ${this.activeProcesses.length} 个音频播放进程`);

            for (const process of this.activeProcesses) {
                try {
                    if (!process.killed) {
                        process.kill();
                    }
                } catch (error) {
                    logger.error(`终止进程失败: ${error.message}`);
                }
            }

            // 重置数组
            this.activeProcesses = [];
        } catch (error) {
            logger.error(`清理播放进程失败: ${error.message}`);
        }
    }

    /**
     * 打开音频组文件夹
     * @param {string} groupName - 音频组名称
     * @returns {Promise<boolean>} - 是否成功打开
     */
    async openAudioGroupFolder(groupName) {
        try {
            const groupPath = path.join(this.audioFolder, groupName);

            // 检查文件夹是否存在
            if (!fs.existsSync(groupPath)) {
                logger.error(`音频组文件夹不存在: ${groupPath}`);
                return false;
            }

            // 使用系统默认程序打开文件夹
            const { shell } = require('electron');
            await shell.openPath(groupPath);

            logger.info(`已打开音频组文件夹: ${groupPath}`);
            return true;
        } catch (error) {
            logger.error(`打开音频组文件夹失败: ${error.message}`);
            return false;
        }
    }
}

// 创建单例
const voiceAssistantService = new VoiceAssistantService();

// 导出服务实例
module.exports = {
    voiceAssistantService
};