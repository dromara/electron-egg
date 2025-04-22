/**
 * 自动场控和自动回复服务
 */
'use strict';

const { logger } = require('ee-core/log');
const { BrowserWindow, ipcMain } = require('electron');
const { getMainWindow } = require('ee-core/electron');
const { scriptdbService } = require('./scriptdb');
const { livechatService } = require('./livechat');
const { douyinLivechatHandler } = require('./douyinLivechatHandler');

/**
 * 自动场控和自动回复服务
 * @class
 */
class LivechatAutoControlService {
    constructor() {
        this.douyinWindow = null;
        this.isConnected = false;
        this.isAutoControlEnabled = false;
        this.isAutoReplyEnabled = false;
        this.controlTimer = null;
        this.keepAliveTimer = null;
        this.currentIndex = 0; // 用于顺序发言
        this.controlSettings = {
            frequency: { min: 30, max: 60 }, // 发言频率（秒）
            continuousSpeechEnabled: false, // 连续发言功能开关
            continuousSpeechDuration: 15, // 连续发言时长（分钟）
            restTime: 5, // 休息时间（分钟）
            random: true, // 随机发言
            sequential: false, // 顺序发言
            randomSpace: false, // 随机空格
            randomEmoji: false // 随机表情
        };
        this.autoControlStartTime = null; // 自动场控开始时间
        this.autoControlDuration = 0; // 自动场控持续时间（分钟）
        this.controlScripts = []; // 场控话术列表

        // 自动回复相关
        this.replyItems = []; // 关键词和回复的配置
        this.replySettings = {}; // 自动回复的设置
        this.messageBus = null; // 用于接收弹幕消息的事件总线

        this.pendingMessages = []; // 新增的消息队列
        this.isProcessing = false; // 新增的处理状态
        this.canReplyNow = true; // 新增的回复状态
    }

    /**
     * 查找抖音窗口
     * @returns {BrowserWindow|null} - 抖音窗口实例
     */
    findDouyinWindow() {
        // 获取所有窗口
        const allWindows = BrowserWindow.getAllWindows();

        // 查找名称为 'window-douyin' 的窗口
        for (const win of allWindows) {
            if (win && win.webContents && win.webContents.getTitle().includes('抖音')) {
                return win;
            }
        }

        return null;
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

            // 查找抖音窗口
            this.douyinWindow = this.findDouyinWindow();

            if (!this.douyinWindow) {
                logger.error('未找到抖音窗口，请先点击"登录抖音"按钮');
                return false;
            }

            // 访问直播间
            const liveUrl = `https://live.douyin.com/${roomId}`;
            await this.douyinWindow.webContents.loadURL(liveUrl);

            // 等待页面加载
            await new Promise(resolve => setTimeout(resolve, 5000));

            // 检查页面标题，确认是否是直播间
            const title = await this.douyinWindow.webContents.executeJavaScript('document.title');
            logger.info(`直播间标题: ${title}`);

            if (title.includes('抖音直播') || title.includes('正在直播')) {
                // 检查输入框是否存在
                const inputSelector = '.zone-container.editor-kit-container';
                const hasInputBox = await this.douyinWindow.webContents.executeJavaScript(`
                    document.querySelector('${inputSelector}') != null
                `);

                if (!hasInputBox) {
                    logger.error('未找到评论输入框，连接失败');
                    return false;
                }

                this.isConnected = true;
                logger.info(`成功连接到直播间 ID: ${roomId}`);

                // 将抖音窗口引用设置到livechat服务
                livechatService.setDouyinWindow(this.douyinWindow);

                // 初始化抖音窗口的消息处理器
                await douyinLivechatHandler.initMessageListener(this.douyinWindow);

                // 设置保活定时器，防止会话超时
                this.keepAliveTimer = setInterval(async() => {
                    try {
                        if (this.douyinWindow && !this.douyinWindow.isDestroyed()) {
                            // 定期执行一些操作，保持页面活跃
                            await this.douyinWindow.webContents.executeJavaScript(`
                                window.scrollBy(0, 1);
                                window.scrollBy(0, -1);
                                
                                // 移除可能的视频元素，减少资源占用
                                let videoElements = document.querySelectorAll('video');
                                videoElements.forEach(video => {
                                    video.pause();
                                    video.muted = true;
                                    video.style.display = 'none';
                                });
                            `);
                            logger.debug('执行页面保活操作');
                        }
                    } catch (err) {
                        logger.error(`保活操作出错: ${err.message}`);
                    }
                }, 60000); // 每分钟执行一次保活

                // 设置消息监听，用于自动回复
                this.setupMessageListener();

                return true;
            } else {
                logger.error(`连接到直播间失败，直播间可能不存在或已下播`);
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

            // 移除消息监听
            this.removeMessageListener();

            // 清除livechat服务中的抖音窗口引用
            livechatService.clearDouyinWindow();

            // 不关闭窗口，只更新连接状态
            this.isConnected = false;
            logger.info('已断开直播间连接，浏览器窗口保持打开');
        } catch (error) {
            logger.error(`断开连接出错: ${error.message}`);
            this.isConnected = false;
        }
    }

    /**
     * 设置消息监听，用于监听弹幕消息
     */
    setupMessageListener() {
        try {
            // 直接监听从livechat.js发送的livechat-message事件
            // 创建消息处理函数
            this.messageBus = (event, data) => {
                // 只处理chat类型的消息
                if (data && data.type === 'chat') {
                    if (this.isAutoReplyEnabled) {
                        this.processAutoReply(data.message);
                    }
                }
            };

            // 注册监听器，直接监听livechat-message事件
            ipcMain.on('livechat-message', this.messageBus);
            logger.info('已设置弹幕消息监听，准备自动回复');
        } catch (error) {
            logger.error(`设置消息监听出错: ${error.message}`);
        }
    }

    /**
     * 移除消息监听
     */
    removeMessageListener() {
        try {
            if (this.messageBus) {
                // 移除监听器
                ipcMain.removeListener('livechat-message', this.messageBus);
                this.messageBus = null;
            }

            logger.info('已移除弹幕消息监听');
        } catch (error) {
            logger.error(`移除消息监听出错: ${error.message}`);
        }
    }

    /**
     * 发送消息
     * @param {string} message - 要发送的消息内容
     * @returns {Promise<boolean>} - 发送结果
     */
    async sendMessage(message) {
        if (!this.isConnected || !this.douyinWindow || this.douyinWindow.isDestroyed()) {
            logger.error('未连接到直播间或窗口已关闭，无法发送消息');
            return false;
        }

        try {
            // 使用douyinLivechatHandler发送消息
            const result = await douyinLivechatHandler.sendMessage(this.douyinWindow, message);

            if (result) {
                logger.info(`已发送消息: ${message}`);

                // 记录到控制台
                const mainWindow = getMainWindow();
                if (mainWindow && !mainWindow.isDestroyed()) {
                    // 发送消息给渲染进程
                    mainWindow.webContents.send('livechat-message', {
                        type: 'text_reply',
                        message: `已发送: ${message}`
                    });
                }
            }

            return result;
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
        if (this.controlSettings.randomEmoji) {
            const emojis = this.getEmojis();
            // 30%概率在消息末尾添加表情
            if (emojis.length > 0 && Math.random() < 0.3) {
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
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
        // 每次都从区间随机生成一个新的时间值
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

        if (!this.douyinWindow || this.douyinWindow.isDestroyed()) {
            logger.error('抖音窗口已关闭，停止自动场控');
            await this.stopAutoControl();
            return;
        }

        try {
            // 只有当连续发言功能开启时才检查发言时长
            if (this.controlSettings.continuousSpeechEnabled) {
                // 检查是否超过了连续发言时间
                const now = new Date();
                const elapsedMinutes = (now - this.autoControlStartTime) / (1000 * 60);

                if (elapsedMinutes >= this.autoControlDuration) {
                    logger.info(`已达到设定的连续发言时长 ${this.autoControlDuration} 分钟，停止自动场控`);
                    await this.stopAutoControl();

                    // 如果设置了休息时间，则在休息后重新启动
                    const restTime = this.controlSettings.restTime;
                    if (restTime > 0) {
                        logger.info(`将在 ${restTime} 分钟后重新启动自动场控`);

                        setTimeout(() => {
                            this.startAutoControl(this.controlScripts, this.controlSettings);
                        }, restTime * 60 * 1000);
                    }

                    return;
                }
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

            // 获取随机等待时间 - 每次发言后都重新计算
            const waitTime = this.getRandomWaitTime();

            // 向主窗口发送倒计时信息
            this.sendCountdownToMainWindow(waitTime / 1000);

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
            // 检查抖音窗口是否存在
            this.douyinWindow = this.findDouyinWindow();

            if (!this.douyinWindow) {
                logger.error('未找到抖音窗口，请先点击"登录抖音"按钮');
                return false;
            }

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

                // 设置连续发言时长 - 使用单一固定值而不是从区间随机生成
                if (this.controlSettings.continuousSpeechEnabled) {
                    this.autoControlDuration = this.controlSettings.continuousSpeechDuration;
                } else {
                    // 如果连续发言功能未启用，设置一个很大的值，实际上不会达到
                    this.autoControlDuration = 24 * 60; // 24小时
                }

                // 设置开始时间
                this.autoControlStartTime = new Date();

                // 启用自动场控
                this.isAutoControlEnabled = true;
                logger.info('自动场控状态已设置为启用');

                // 重置顺序发言索引
                this.currentIndex = 0;

                // 执行第一次场控发言
                setTimeout(() => {
                    this.executeAutoControl();
                }, 1000);

                logger.info(`已启动自动场控${this.controlSettings.continuousSpeechEnabled ? 
                `，连续发言时长: ${this.autoControlDuration} 分钟，休息时间: ${this.controlSettings.restTime} 分钟` : 
                '，持续发言模式'}`);
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

            logger.info('已停止自动场控，状态已设置为停用');
            return true;
        } catch (error) {
            logger.error(`停止自动场控出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 处理自动回复，检查弹幕消息中是否包含关键词
     * @param {string} message - 弹幕消息内容
     */
    processAutoReply(message) {
        if (!this.isAutoReplyEnabled || !this.isConnected) {
            return;
        }

        try {
            // 自动回复由抖音窗口内的处理器完成，这里只记录日志
            logger.debug(`收到聊天消息，转发至抖音窗口处理`);
        } catch (error) {
            logger.error(`处理自动回复出错: ${error.message}`);
        }
    }

    /**
     * 启动自动回复
     * @param {string} tableName - 回复表名称
     * @param {Array} replyItems - 关键词和回复列表
     * @param {Object} settings - 回复设置
     * @returns {Promise<boolean>} - 启动结果
     */
    async startAutoReply(tableName, replyItems, settings = {}) {
        // 检查抖音窗口是否存在
        this.douyinWindow = this.findDouyinWindow();

        if (!this.douyinWindow) {
            logger.error('未找到抖音窗口，请先点击"登录抖音"按钮');
            return false;
        }

        if (!this.isConnected) {
            logger.error('未连接到直播间，无法启动自动回复');
            return false;
        }

        try {
            // 停止当前正在运行的自动回复（如果有）
            await this.stopAutoReply();

            // 保存回复配置
            this.replyItems = replyItems || [];
            this.replySettings = settings || {};

            // 校验数据
            if (!this.replyItems || this.replyItems.length === 0) {
                logger.error('没有可用的回复配置');
                return false;
            }

            // 启用自动回复
            this.isAutoReplyEnabled = true;
            logger.info('自动回复状态已设置为启用');

            // 准备设置参数
            const replySettings = {
                minReplyInterval: settings.minReplyInterval !== undefined ? settings.minReplyInterval : 2000, // 默认最小间隔2秒
                maxReplyInterval: settings.maxReplyInterval !== undefined ? settings.maxReplyInterval : 5000, // 默认最大间隔5秒
                randomSpace: this.controlSettings.randomSpace || false, // 随机空格设置
                randomEmoji: this.controlSettings.randomEmoji || false,  // 随机表情设置
                delayEnabled: settings.delayEnabled !== undefined ? settings.delayEnabled : true // 默认启用延迟
            };

            // 获取表情列表
            const emojis = this.getEmojis();

            // 更新抖音窗口中的自动回复配置
            await douyinLivechatHandler.updateConfig(
                this.douyinWindow, 
                this.replyItems, 
                this.isAutoReplyEnabled,
                replySettings,
                emojis
            );

            logger.info(`已启动自动回复，共 ${this.replyItems.length} 条规则，${replySettings.delayEnabled ? `发言频率: ${replySettings.minReplyInterval}-${replySettings.maxReplyInterval}毫秒` : '无发言延迟'}，随机空格: ${replySettings.randomSpace}，随机表情: ${replySettings.randomEmoji}`);
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
            this.isAutoReplyEnabled = false;
            this.replyItems = [];

            // 更新抖音窗口中的自动回复配置（如果窗口存在）
            const douyinWindow = this.findDouyinWindow();
            if (douyinWindow && !douyinWindow.isDestroyed()) {
                await douyinLivechatHandler.updateConfig(douyinWindow, [], false);
            }

            logger.info('已停止自动回复，状态已设置为停用');
            return true;
        } catch (error) {
            logger.error(`停止自动回复出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取自动场控状态
     * @returns {Object} - 自动场控状态信息
     */
    getAutoControlStatus() {
        // 显式记录状态以便调试
        logger.info(`获取自动场控状态：当前状态 ${this.isAutoControlEnabled ? '已启用' : '未启用'}`);
        
        return {
            status: 'success',
            data: {
                enabled: this.isAutoControlEnabled
            }
        };
    }

    /**
     * 获取自动回复状态
     * @returns {Object} - 自动回复状态信息
     */
    getAutoReplyStatus() {
        // 显式记录状态以便调试
        logger.info(`获取自动回复状态：当前状态 ${this.isAutoReplyEnabled ? '已启用' : '未启用'}`);
        
        return {
            status: 'success',
            data: {
                enabled: this.isAutoReplyEnabled
            }
        };
    }

    /**
     * 获取连接状态
     * @returns {Object} - 连接状态信息
     */
    getConnectionStatus() {
        // 检查抖音窗口是否存在
        this.douyinWindow = this.findDouyinWindow();

        const connected = this.isConnected && this.douyinWindow && !this.douyinWindow.isDestroyed();
        let roomId = '';

        if (connected && this.douyinWindow) {
            try {
                const url = this.douyinWindow.webContents.getURL();
                const urlParts = url.split('/');
                roomId = urlParts[urlParts.length - 1];
            } catch (err) {
                logger.error(`获取房间ID出错: ${err.message}`);
            }
        }

        return {
            status: 'success',
            connected: connected,
            roomId: roomId,
            hasDouyinWindow: !!this.douyinWindow
        };
    }
    
    /**
     * 获取表情列表
     * @returns {Array} - 表情列表
     */
    getEmojis() {
        try {
            // 检查emojis表是否存在，不存在则创建
            this._ensureEmojisTable();
            
            // 使用SQL查询获取所有表情
            const sql = "SELECT emoji FROM emojis";
            const rows = scriptdbService.db.prepare(sql).all();
            
            // 将查询结果转换为表情数组
            return rows.map(row => row.emoji);
        } catch (error) {
            logger.error(`获取表情列表出错: ${error.message}`);
            // 出错时返回空数组
            return [];
        }
    }

    /**
     * 保存表情列表
     * @param {Array} emojis - 表情列表
     * @returns {boolean} - 保存结果
     */
    saveEmojis(emojis) {
        try {
            if (!Array.isArray(emojis)) {
                throw new Error('表情列表必须是数组');
            }
            
            // 确保表存在
            this._ensureEmojisTable();
            
            // 开始事务
            scriptdbService.db.prepare('BEGIN').run();
            
            try {
                // 清空现有表情
                scriptdbService.db.prepare('DELETE FROM emojis').run();
                
                // 插入新表情
                const insertStmt = scriptdbService.db.prepare('INSERT INTO emojis (emoji) VALUES (?)');
                
                for (const emoji of emojis) {
                    insertStmt.run(emoji);
                }
                
                // 提交事务
                scriptdbService.db.prepare('COMMIT').run();
                
                logger.info(`成功保存${emojis.length}个表情`);
                return true;
            } catch (err) {
                // 回滚事务
                scriptdbService.db.prepare('ROLLBACK').run();
                throw err;
            }
        } catch (error) {
            logger.error(`保存表情列表失败: ${error.message}`);
            return false;
        }
    }
    
    /**
     * 确保emojis表存在
     * @private
     */
    _ensureEmojisTable() {
        try {
            // 检查表是否存在
            const tableExists = scriptdbService.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='emojis'").get();
            
            if (!tableExists) {
                // 创建表
                const createTableSql = `
                    CREATE TABLE emojis (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        emoji TEXT NOT NULL
                    )
                `;
                scriptdbService.db.exec(createTableSql);
                logger.info('创建emojis表成功');
            }
        } catch (error) {
            logger.error(`确保emojis表存在时出错: ${error.message}`);
            throw error;
        }
    }

    // 新增的处理消息队列的函数
    async processMessageQueue() {
        if (this.pendingMessages.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        // 获取下一条消息
        const data = this.pendingMessages.shift();
        
        try {
            const message = data.message;
            
            // 修改判断逻辑，如果delayEnabled为false，则可以立即回复
            if (message && (this.canReplyNow || !this.replySettings.delayEnabled)) {
                // 提取消息主体
                const messageContent = this.extractMessageContent(message);
                
                // 标记当前不能回复，防止重复回复
                this.canReplyNow = false;
                
                // 使用消息主体进行关键词匹配
                const matched = await this.checkKeywordsParallel(messageContent);
                
                // 如果匹配了关键词，等待用户设置的延迟后再处理下一条消息
                if (matched) {
                    // 等待用户设置的时间
                    const waitTime = this.replySettings.delayEnabled ? this.getRandomWaitTime() : 500;
                    
                    setTimeout(() => {
                        this.canReplyNow = true;
                        // 继续处理队列中的下一条消息
                        this.processMessageQueue();
                    }, waitTime);
                    
                    // 提前返回，不继续处理
                    return;
                } else {
                    // 没有匹配，立即可以回复下一条
                    this.canReplyNow = true;
                }
            }
        } catch (error) {
            console.error('处理消息出错:', error);
            this.canReplyNow = true; // 出错时也恢复可回复状态
        }
        
        // 继续处理队列中的下一条消息
        setTimeout(() => this.processMessageQueue(), 10);
    }

    // 新增的方法来向主窗口发送倒计时信息
    sendCountdownToMainWindow(seconds) {
        const mainWindow = getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('livechat-countdown', { seconds });
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