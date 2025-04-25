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

            // 立即开始第一次播放，然后安排后续播放
            setTimeout(() => {
                this.playAudio();
            }, 1000);

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
        const delay = Math.floor((minInterval + Math.random() * (maxInterval - minInterval)) * 1000);

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
    playSingleAudio(filePath, options = {}) {
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

            logger.info(`准备通过Python API播放音频文件: ${filePath}`);

            // 这里将来会调用Python API来播放音频
            // 临时使用子进程播放音频以保持功能可用
            try {
                const { spawn, exec } = require('child_process');
                const os = require('os');
                const platform = os.platform();

                if (platform === 'win32') {
                    // Windows平台使用ffplay在后台播放，无界面
                    // 检查ffplay是否存在
                    const ffplayPath = path.join(app.getAppPath(), '..', 'extraResources', 'py', 'ffmpeg', 'ffplay.exe');

                    if (fs.existsSync(ffplayPath)) {
                        // 使用ffplay无界面播放
                        const args = [
                            '-nodisp', // 无显示
                            '-autoexit', // 播放完自动退出
                            '-i', filePath, // 输入文件
                            '-volume', Math.floor(volume * 100).toString(), // 音量
                        ];

                        logger.info(`使用ffplay播放: ${ffplayPath} ${args.join(' ')}`);

                        // 使用spawn并传递detached: true和stdio: 'ignore'来实现后台运行
                        const process = spawn(ffplayPath, args, {
                            detached: true, // 进程从父进程中分离
                            stdio: 'ignore', // 忽略所有输入输出
                            windowsHide: true // 在Windows上隐藏窗口
                        });

                        // 添加到活跃进程列表
                        this.activeProcesses.push(process);

                        // 当进程结束时从列表中移除
                        process.on('exit', () => {
                            const index = this.activeProcesses.indexOf(process);
                            if (index !== -1) {
                                this.activeProcesses.splice(index, 1);
                            }
                        });

                        // 让子进程独立于父进程运行
                        process.unref();
                    } else {
                        // 备选方案：使用PowerShell但隐藏窗口
                        const volume_param = Math.floor(volume * 100);
                        const escapedPath = filePath.replace(/'/g, "''").replace(/"/g, '\\"');

                        const cmd = `(New-Object -ComObject WMPlayer.OCX).openPlayer('${escapedPath}')`;

                        // 使用-WindowStyle Hidden参数隐藏PowerShell窗口
                        const command = `powershell -WindowStyle Hidden -Command "${cmd}"`;

                        logger.info(`使用PowerShell播放: ${command}`);

                        // 使用exec执行命令
                        const process = exec(command, { windowsHide: true });

                        // 添加到活跃进程列表
                        this.activeProcesses.push(process);

                        // 当进程结束时从列表中移除
                        process.on('exit', () => {
                            const index = this.activeProcesses.indexOf(process);
                            if (index !== -1) {
                                this.activeProcesses.splice(index, 1);
                            }
                        });
                    }
                } else if (platform === 'darwin') {
                    // macOS使用afplay
                    const args = [filePath, '-v', volume.toString()];
                    const process = spawn('afplay', args, {
                        detached: true,
                        stdio: 'ignore'
                    });

                    // 添加到活跃进程列表
                    this.activeProcesses.push(process);

                    // 当进程结束时从列表中移除
                    process.on('exit', () => {
                        const index = this.activeProcesses.indexOf(process);
                        if (index !== -1) {
                            this.activeProcesses.splice(index, 1);
                        }
                    });

                    process.unref();
                } else if (platform === 'linux') {
                    // Linux使用aplay
                    const args = [filePath];
                    const process = spawn('aplay', args, {
                        detached: true,
                        stdio: 'ignore'
                    });

                    // 添加到活跃进程列表
                    this.activeProcesses.push(process);

                    // 当进程结束时从列表中移除
                    process.on('exit', () => {
                        const index = this.activeProcesses.indexOf(process);
                        if (index !== -1) {
                            this.activeProcesses.splice(index, 1);
                        }
                    });

                    process.unref();
                }

                // 通知渲染进程
                const win = getMainWindow();
                if (win && !win.isDestroyed()) {
                    win.webContents.send('livechat-message', {
                        type: 'voice_assistant',
                        message: `正在播放: ${path.basename(filePath)}`
                    });
                }

                return true;
            } catch (err) {
                logger.error(`执行播放命令出错: ${err.message}`);
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

            // 在Windows上可能需要额外清理
            if (process.platform === 'win32') {
                try {
                    const { exec } = require('child_process');
                    // 终止可能的ffplay进程
                    exec('taskkill /F /IM ffplay.exe', { windowsHide: true });
                } catch (e) {
                    // 忽略错误，可能没有运行的ffplay进程
                }
            }
        } catch (error) {
            logger.error(`清理播放进程失败: ${error.message}`);
        }
    }
}

// 创建单例
const voiceAssistantService = new VoiceAssistantService();

// 导出服务实例
module.exports = {
    voiceAssistantService
};