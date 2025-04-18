/**
 * 自动场控和自动回复服务
 */
'use strict';

const { chromium } = require('playwright');
const { logger } = require('ee-core/log');

/**
 * 自动场控和自动回复服务
 * @class
 */
class LivechatAutoControlService {
    constructor() {
        this.browser = null;
        this.page = null;
        this.context = null;
        this.isConnected = false;
        this.isAutoControlEnabled = false;
        this.isAutoReplyEnabled = false;
        this.controlTimer = null;
        this.replyTimer = null;
        this.currentIndex = 0; // 用于顺序发言
        this.controlSettings = {
            frequency: { min: 30, max: 60 }, // 发言频率（秒）
            continuousSpeech: { start: 15, end: 15 }, // 连续发言时长（分钟）
            restTime: { start: 0, end: 0 }, // 休息时间（分钟）
            random: true, // 随机发言
            sequential: false, // 顺序发言
            randomSpace: false, // 随机空格
            randomEmoji: false // 随机表情
        };
        this.autoControlStartTime = null; // 自动场控开始时间
        this.autoControlDuration = 0; // 自动场控持续时间（分钟）
        this.controlScripts = []; // 场控话术列表

        // 表情代码表
        this.emojis = ['[赞]'];

        // 自动回复相关
        this.replySettings = {
            frequency: { min: 2, max: 5 }, // 回复频率（秒）
            randomSpace: false, // 随机空格
            randomEmoji: true // 随机表情
        };
        this.replyTable = ''; // 当前选中的回复表
        this.replyItems = []; // 回复条目列表
        this.lastReplyTime = null; // 上次回复时间
        this.replyMessageHandler = null; // 消息处理函数
    }

    /**
     * 获取连接状态
     * @returns {Object} - 连接状态对象
     */
    getConnectionStatus() {
        try {
            let roomId = '';
            // 从页面URL中提取直播间ID
            if (this.page && !this.page.isClosed()) {
                try {
                    const url = this.page.url();
                    // 提取 URL 中最后一段作为房间ID
                    const parts = url.split('/');
                    roomId = parts[parts.length - 1];
                } catch (err) {
                    logger.error(`获取房间ID出错: ${err.message}`);
                }
            }

            return {
                status: 'success',
                connected: this.isConnected,
                roomId: roomId
            };
        } catch (error) {
            logger.error(`获取连接状态出错: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * 连接到直播间
     * @param {string} roomId - 直播间ID
     * @returns {Promise<boolean>} - 连接结果
     */
    async connect(roomId) {
        try {
            if (this.isConnected) {
                await this.disconnect();
            }

            // 创建用户数据目录，用于保存登录状态和cookies
            const path = require('path');
            const fs = require('fs');
            const userDataDir = path.join(__dirname, '..', 'browser-data');

            // 确保目录存在
            if (!fs.existsSync(userDataDir)) {
                fs.mkdirSync(userDataDir, { recursive: true });
                logger.info(`创建浏览器数据目录: ${userDataDir}`);
            }

            // 启动持久化浏览器 - 保留cookies和登录状态
            logger.info('启动持久化浏览器...');
            this.context = await chromium.launchPersistentContext(userDataDir, {
                headless: false, // 设置为false以便看到浏览器窗口
                args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
            });

            // 获取或创建页面
            if (this.context.pages().length > 0) {
                this.page = this.context.pages()[0];
            } else {
                this.page = await this.context.newPage();
            }

            // 阻止视频和图片等资源加载以降低资源占用
            await this.context.route('**/*.{png,jpg,jpeg,webp,svg,mp4,webm}', route => {
                if (route.request().url().includes('video') || route.request().resourceType() === 'media') {
                    route.abort();
                } else {
                    route.continue();
                }
            });

            // 设置视口大小
            await this.page.setViewportSize({ width: 1280, height: 720 });

            // 修改userAgent以防止被检测
            await this.page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
            });

            // 禁用视频自动播放
            await this.page.addInitScript(() => {
                // 覆盖HTMLMediaElement的原生方法来阻止视频播放
                Object.defineProperty(HTMLMediaElement.prototype, 'play', {
                    value: async function() { return Promise.resolve(); }
                });
                // 设置 autoplay 为 false
                document.addEventListener('DOMContentLoaded', () => {
                    const videos = document.querySelectorAll('video');
                    videos.forEach(video => {
                        video.autoplay = false;
                        video.pause();
                        video.muted = true;
                        video.style.display = 'none';
                    });
                }, true);
            });

            // 访问直播间
            const liveUrl = `https://live.douyin.com/${roomId}`;
            await this.page.goto(liveUrl, { timeout: 60000 });

            // 设置查找标志
            let inputBoxFound = false;

            // 同时异步查找播放按钮和输入框
            logger.info('同时查找播放按钮和输入框...');
            const textareaSelector = 'textarea.webcast-chatroom___textarea';

            // 创建查找输入框的Promise
            const findInputBox = (async() => {
                try {
                    await this.page.waitForSelector(textareaSelector, { timeout: 30000 });
                    logger.info('成功找到评论输入框');
                    inputBoxFound = true;
                    return true;
                } catch (e) {
                    logger.error(`等待评论输入框超时: ${e.message}`);
                    return false;
                }
            })();

            // 创建查找播放按钮的Promise
            const findPlayButton = (async() => {
                try {
                    // 设置标志，控制是否继续查找和点击播放按钮
                    let shouldContinue = true;

                    // 检查输入框是否已找到
                    const checkInputBox = () => {
                        if (inputBoxFound) {
                            logger.info('输入框已找到，停止查找播放按钮');
                            shouldContinue = false;
                        }
                        return inputBoxFound;
                    };

                    // 最多尝试5次，或者直到找到输入框
                    for (let i = 0; i < 5 && shouldContinue; i++) {
                        // 每次循环前检查输入框是否已找到
                        if (checkInputBox()) break;

                        logger.info(`尝试查找播放按钮 (${i+1}/5)...`);
                        // 尝试查找播放按钮
                        const playButton = await this.page.$(`.xgplayer-icon`);

                        // 再次检查输入框是否已找到
                        if (checkInputBox()) break;

                        if (playButton) {
                            logger.info('找到播放按钮，尝试点击...');
                            // 设置较短的超时时间，避免长时间等待
                            try {
                                await Promise.race([
                                    playButton.click(),
                                    new Promise((_, reject) =>
                                        setTimeout(() => reject(new Error('点击超时，可能已找到输入框')), 3000)
                                    )
                                ]);
                                logger.info('已点击播放按钮');
                            } catch (error) {
                                logger.warn(`点击操作中断: ${error.message}`);
                            }
                        } else {
                            logger.info('未找到播放按钮');
                        }

                        // 等待一段时间后再尝试
                        await this.page.waitForTimeout(1000);

                        // 再次检查输入框是否已找到
                        if (checkInputBox()) break;
                    }
                } catch (e) {
                    logger.warn(`查找播放按钮过程中出错: ${e.message}`);
                }
            })();

            // 等待两个Promise都完成
            await Promise.all([findInputBox, findPlayButton]);

            // 如果没找到输入框，返回失败
            if (!inputBoxFound) {
                logger.error('未能找到评论输入框，连接失败');
                await this.disconnect();
                return false;
            }

            // 检查是否成功进入直播间
            const title = await this.page.title();
            logger.info(`直播间标题: ${title}`);

            if (title.includes('抖音直播') || title.includes('正在直播')) {
                this.isConnected = true;
                logger.info(`成功连接到直播间 ID: ${roomId}`);

                // 设置保活定时器，防止会话超时
                this.keepAliveTimer = setInterval(async() => {
                    try {
                        if (this.page && !this.page.isClosed()) {
                            // 定期执行一些操作，保持页面活跃
                            await this.page.evaluate(() => {
                                // 滚动页面或点击页面某处
                                window.scrollBy(0, 1);
                                window.scrollBy(0, -1);

                                // 移除可能的视频元素，减少资源占用
                                const videos = document.querySelectorAll('video');
                                videos.forEach(video => {
                                    video.pause();
                                    video.muted = true;
                                    video.style.display = 'none';
                                });
                            });
                            logger.debug('执行页面保活操作');
                        }
                    } catch (err) {
                        logger.error(`保活操作出错: ${err.message}`);
                    }
                }, 60000); // 每分钟执行一次保活

                return true;
            } else {
                logger.error(`连接到直播间失败，直播间可能不存在或已下播`);
                await this.disconnect();
                return false;
            }
        } catch (error) {
            logger.error(`连接直播间出错: ${error.message}`);
            await this.disconnect();
            return false;
        }
    }

    /**
     * 断开连接
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            // 停止自动场控和自动回复
            await this.stopAutoControl();
            await this.stopAutoReply();

            // 清除保活定时器
            if (this.keepAliveTimer) {
                clearInterval(this.keepAliveTimer);
                this.keepAliveTimer = null;
            }

            // 关闭页面
            if (this.page) {
                try {
                    await this.page.close();
                } catch (e) {
                    logger.error(`关闭页面出错: ${e.message}`);
                }
                this.page = null;
            }

            // 关闭上下文（持久化浏览器上下文）
            if (this.context) {
                try {
                    await this.context.close();
                } catch (e) {
                    logger.error(`关闭浏览器上下文出错: ${e.message}`);
                }
                this.context = null;
            }

            this.isConnected = false;
            logger.info('已断开直播间连接');
        } catch (error) {
            logger.error(`断开连接出错: ${error.message}`);
            this.isConnected = false;
        }
    }

    /**
     * 发送消息
     * @param {string} message - 要发送的消息内容
     * @returns {Promise<boolean>} - 发送结果
     */
    async sendMessage(message) {
        if (!this.isConnected || !this.page) {
            logger.error('未连接到直播间，无法发送消息');
            return false;
        }

        try {
            // 查找输入框
            const textareaSelector = 'textarea.webcast-chatroom___textarea';
            await this.page.waitForSelector(textareaSelector, { timeout: 5000 });

            // 点击输入框获取焦点
            await this.page.click(textareaSelector);

            // 等待一小段时间确保焦点已获取
            await this.page.waitForTimeout(500);

            // 清空输入框
            await this.page.evaluate((selector) => {
                document.querySelector(selector).value = '';
            }, textareaSelector);

            // 直接使用键盘输入消息
            await this.page.keyboard.type(message);

            // 等待一小段时间后按回车发送
            await this.page.waitForTimeout(300);
            await this.page.keyboard.press('Enter');

            logger.info(`已发送消息: ${message}`);

            // 记录到控制台
            try {
                // 导入electron模块
                const { BrowserWindow } = require('electron');
                // 获取主窗口实例
                const mainWindow = BrowserWindow.getAllWindows()[0];

                if (mainWindow) {
                    // 发送消息给渲染进程
                    mainWindow.webContents.send('livechat-message', {
                        type: 'text_control',
                        message: `已发送: ${message}`
                    });
                }
            } catch (err) {
                logger.error(`发送消息通知到控制台失败: ${err.message}`);
            }

            return true;
        } catch (error) {
            logger.error(`发送消息出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理消息内容（添加随机空格和表情）
     * @param {string} message - 原始消息
     * @returns {string} - 处理后的消息
     */
    processMessage(message) {
        let result = message;

        // 添加随机空格
        if (this.controlSettings.randomSpace) {
            const chars = result.split('');
            let processed = '';

            for (let i = 0; i < chars.length; i++) {
                processed += chars[i];

                // 30%概率在字符后添加空格（避免在最后一个字符后添加）
                if (i < chars.length - 1 && Math.random() < 0.3) {
                    processed += ' ';
                }
            }

            result = processed;
        }

        // 添加随机表情
        if (this.controlSettings.randomEmoji && this.emojis.length > 0) {
            // 30%概率在消息末尾添加表情
            if (Math.random() < 0.3) {
                const randomEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
                result += randomEmoji;
            }
        }

        return result;
    }

    /**
     * 获取随机消息
     * @returns {string|null} - 随机选取的消息
     */
    getRandomMessage() {
        if (!this.controlScripts || this.controlScripts.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.controlScripts.length);
        return this.controlScripts[randomIndex].content;
    }

    /**
     * 获取顺序消息
     * @returns {string|null} - 顺序选取的消息
     */
    getSequentialMessage() {
        if (!this.controlScripts || this.controlScripts.length === 0) {
            return null;
        }

        const message = this.controlScripts[this.currentIndex].content;
        this.currentIndex = (this.currentIndex + 1) % this.controlScripts.length;
        return message;
    }

    /**
     * 获取随机等待时间
     * @returns {number} - 随机等待时间（毫秒）
     */
    getRandomWaitTime() {
        const { min, max } = this.controlSettings.frequency;
        const seconds = min + Math.floor(Math.random() * (max - min + 1));
        return seconds * 1000; // 转换为毫秒
    }

    /**
     * 执行自动场控发言
     * @returns {Promise<void>}
     */
    async executeAutoControl() {
        if (!this.isAutoControlEnabled || !this.isConnected) {
            return;
        }

        try {
            // 检查是否超过了连续发言时间
            const now = new Date();
            const elapsedMinutes = (now - this.autoControlStartTime) / (1000 * 60);

            if (elapsedMinutes >= this.autoControlDuration) {
                logger.info(`已达到设定的连续发言时长 ${this.autoControlDuration} 分钟，停止自动场控`);
                await this.stopAutoControl();

                // 如果设置了休息时间，则在休息后重新启动
                const { start, end } = this.controlSettings.restTime;
                if (start > 0 || end > 0) {
                    const restMinutes = start + Math.floor(Math.random() * (end - start + 1));
                    logger.info(`将在 ${restMinutes} 分钟后重新启动自动场控`);

                    setTimeout(() => {
                        this.startAutoControl(this.controlScripts, this.controlSettings);
                    }, restMinutes * 60 * 1000);
                }

                return;
            }

            // 获取要发送的消息
            let message;
            if (this.controlSettings.random) {
                message = this.getRandomMessage();
            } else if (this.controlSettings.sequential) {
                message = this.getSequentialMessage();
            }

            if (message) {
                // 处理消息（添加随机空格、表情等）
                const processedMessage = this.processMessage(message);

                // 发送消息（sendMessage方法内部会处理控制台通知）
                await this.sendMessage(processedMessage);
            }

            // 获取随机等待时间
            const waitTime = this.getRandomWaitTime();

            // 设置下一次发言的定时器
            this.controlTimer = setTimeout(() => {
                this.executeAutoControl();
            }, waitTime);

            logger.info(`下一条消息将在 ${waitTime / 1000} 秒后发送`);
        } catch (error) {
            logger.error(`执行自动场控出错: ${error.message}`);

            // 如果出错，尝试在短时间后重试
            this.controlTimer = setTimeout(() => {
                this.executeAutoControl();
            }, 5000);
        }
    }

    /**
     * 启动自动场控
     * @param {Array} scripts - 场控话术列表
     * @param {Object} settings - 控制设置
     * @returns {Promise<boolean>} - 启动结果
     */
    async startAutoControl(scripts, settings) {
        if (!this.isConnected) {
            logger.error('未连接到直播间，无法启动自动场控');
            return false;
        }

        try {
            // 停止当前正在运行的自动场控（如果有）
            await this.stopAutoControl();

            // 保存场控话术和设置
            this.controlScripts = scripts || [];
            this.controlSettings = settings || this.controlSettings;

            // 校验数据
            if (!this.controlScripts || this.controlScripts.length === 0) {
                logger.error('没有可用的场控话术');
                return false;
            }

            // 设置连续发言时长
            const { start, end } = this.controlSettings.continuousSpeech;
            this.autoControlDuration = start + Math.floor(Math.random() * (end - start + 1));

            // 设置开始时间
            this.autoControlStartTime = new Date();

            // 启用自动场控
            this.isAutoControlEnabled = true;

            // 重置顺序发言索引
            this.currentIndex = 0;

            // 执行第一次场控发言
            setTimeout(() => {
                this.executeAutoControl();
            }, 1000);

            logger.info(`已启动自动场控，连续发言时长: ${this.autoControlDuration} 分钟`);
            return true;
        } catch (error) {
            logger.error(`启动自动场控出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 停止自动场控
     * @returns {Promise<boolean>} - 停止结果
     */
    async stopAutoControl() {
        try {
            // 清除定时器
            if (this.controlTimer) {
                clearTimeout(this.controlTimer);
                this.controlTimer = null;
            }

            this.isAutoControlEnabled = false;
            this.autoControlStartTime = null;
            this.autoControlDuration = 0;

            logger.info('已停止自动场控');
            return true;
        } catch (error) {
            logger.error(`停止自动场控出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 启动自动回复
     * @param {string} tableName - 回复表名称
     * @param {Array} replyItems - 回复条目列表
     * @param {Object} settings - 回复设置
     * @returns {Promise<boolean>} - 启动结果
     */
    async startAutoReply(tableName, replyItems, settings) {
        try {
            // 检查连接状态
            if (!this.isConnected) {
                logger.error('未连接到直播间');
                return false;
            }

            // 先停止当前的自动回复
            await this.stopAutoReply();

            // 序列化并验证数据
            this.replyTable = String(tableName || '');
            this.replyItems = Array.isArray(replyItems) ? replyItems.map(item => ({
                keyword: String(item.keyword || ''),
                reply: String(item.reply || ''),
                enabled: Boolean(item.enabled)
            })) : [];

            // 序列化设置
            const safeSettings = settings || {};
            this.replySettings = {
                randomSpace: Boolean(safeSettings.randomSpace),
                randomEmoji: Boolean(safeSettings.randomEmoji),
                replyDelay: Number(safeSettings.replyDelay) || 0
            };

            // 校验数据
            if (!this.replyTable || !this.replyItems || this.replyItems.length === 0) {
                logger.error('没有可用的回复条目');
                return false;
            }

            // 再次检查连接状态
            if (!this.isConnected || !this.page) {
                logger.error('直播间连接已断开');
                return false;
            }

            // 启用自动回复
            this.isAutoReplyEnabled = true;
            this.lastReplyTime = new Date();

            // 设置消息处理函数
            this.replyMessageHandler = this.handleMessage.bind(this);

            // 监听消息事件
            const { BrowserWindow } = require('electron');
            const mainWindow = BrowserWindow.getAllWindows()[0];
            if (mainWindow) {
                mainWindow.webContents.on('livechat-message', this.replyMessageHandler);
                logger.info('已注册消息处理函数');
            } else {
                logger.error('未找到主窗口，无法注册消息处理函数');
                return false;
            }

            logger.info(`已启动自动回复，使用表: ${this.replyTable}，共 ${this.replyItems.length} 条回复规则`);
            return true;
        } catch (error) {
            logger.error(`启动自动回复出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 停止自动回复
     * @returns {Promise<boolean>} - 停止结果
     */
    async stopAutoReply() {
        try {
            // 移除消息处理函数
            if (this.replyMessageHandler) {
                const { BrowserWindow } = require('electron');
                const mainWindow = BrowserWindow.getAllWindows()[0];
                if (mainWindow) {
                    mainWindow.webContents.removeListener('livechat-message', this.replyMessageHandler);
                    logger.info('已移除消息处理函数');
                }
                this.replyMessageHandler = null;
            }

            this.isAutoReplyEnabled = false;
            this.lastReplyTime = null;

            logger.info('已停止自动回复');
            return true;
        } catch (error) {
            logger.error(`停止自动回复出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理接收到的消息
     * @param {Object} event - 事件对象
     * @param {Object} data - 消息数据
     */
    async handleMessage(event, data) {
        // 如果自动回复未启用，直接返回
        if (!this.isAutoReplyEnabled) {
            return;
        }

        // 只处理弹幕消息
        if (data.type !== 'danmaku') {
            return;
        }

        try {
            const message = data.message;
            if (!message || typeof message !== 'string') {
                return;
            }

            logger.info(`收到弹幕消息: ${message}`);

            // 检查是否匹配任何关键词
            for (const item of this.replyItems) {
                if (!item.keyword || !item.reply || !item.enabled) {
                    continue;
                }

                // 分割关键词（支持中英文逗号）
                const keywords = item.keyword.split(/[,，]/).map(k => k.trim()).filter(k => k);

                // 检查是否匹配任何关键词
                const matched = keywords.some(keyword => message.includes(keyword));

                if (matched) {
                    logger.info(`匹配到关键词: ${item.keyword}，准备回复: ${item.reply}`);

                    // 处理回复内容（添加随机空格、表情等）
                    const processedReply = this.processMessage(item.reply);

                    // 发送回复
                    await this.sendMessage(processedReply);

                    // 更新最后回复时间
                    this.lastReplyTime = new Date();

                    // 记录到控制台
                    try {
                        const { BrowserWindow } = require('electron');
                        const mainWindow = BrowserWindow.getAllWindows()[0];

                        if (mainWindow) {
                            mainWindow.webContents.send('livechat-message', {
                                type: 'text_reply',
                                message: `已回复: "${message}" -> "${processedReply}"`
                            });
                        }
                    } catch (err) {
                        logger.error(`发送回复通知到控制台失败: ${err.message}`);
                    }

                    // 匹配到一个关键词后就返回，避免重复回复
                    return;
                }
            }
        } catch (error) {
            logger.error(`处理消息出错: ${error.message}`);
        }
    }
}

// 创建服务实例并导出
const livechatAutoControlService = new LivechatAutoControlService();
livechatAutoControlService.toString = () => '[LivechatAutoControlService]';

// 导出服务实例和类
module.exports = {
    livechatAutoControlService,
    LivechatAutoControlService
};