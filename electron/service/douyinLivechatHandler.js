/**
 * 抖音直播窗口处理服务
 * 负责抖音窗口内的自动场控和自动回复功能
 */
'use strict';

const { logger } = require('ee-core/log');

/**
 * 抖音直播窗口处理服务
 * @class
 */
class DouyinLivechatHandler {
    constructor() {
        this.replyItems = []; // 关键词和回复的配置
        this.isAutoReplyEnabled = false; // 自动回复是否启用
        this.replySettings = {
            minReplyInterval: 0, // 最小回复间隔
            maxReplyInterval: 0, // 最大回复间隔
            randomSpace: false, // 是否添加随机空格
            randomEmoji: false, // 是否添加随机表情
            delayEnabled: false // 是否启用发言频率延迟
        };
    }

    /**
     * 设置自动回复配置
     * @param {Array} replyItems - 关键词和回复配置项
     * @param {boolean} enabled - 是否启用自动回复
     * @param {Object} settings - 回复设置
     */
    setAutoReplyConfig(replyItems, enabled = true, settings = {}) {
        this.replyItems = replyItems || [];
        this.isAutoReplyEnabled = enabled;

        // 更新设置
        if (settings) {
            this.replySettings = {
                ...this.replySettings,
                ...settings
            };
        }

        const delayInfo = this.replySettings.delayEnabled ?
            `频率: ${this.replySettings.minReplyInterval}-${this.replySettings.maxReplyInterval}ms` :
            '无延迟发言';
        logger.info(`设置抖音窗口自动回复配置：${this.replyItems.length}条规则，启用状态：${enabled}，${delayInfo}`);
    }

    /**
     * 发送消息到抖音直播间
     * @param {BrowserWindow} douyinWindow - 抖音窗口实例
     * @param {string} message - 要发送的消息内容
     * @returns {Promise<boolean>} - 发送结果
     */
    async sendMessage(douyinWindow, message) {
        if (!douyinWindow || douyinWindow.isDestroyed()) {
            logger.error('抖音窗口不存在或已销毁，无法发送消息');
            return false;
        }

        try {
            // 调用发送消息脚本
            const result = await douyinWindow.webContents.executeJavaScript(`
                (function() {
                    if (window.douyinMessageHandler && typeof window.douyinMessageHandler.sendReply === 'function') {
                        return window.douyinMessageHandler.sendReply(${JSON.stringify(message)});
                    } else {
                        // 如果消息处理器不存在，使用默认实现
                        try {
                            // 查找输入框 (contenteditable div)
                            const inputBox = document.querySelector('.zone-container.editor-kit-container');
                            if (!inputBox) {
                                console.error('未找到输入框');
                                return false;
                            }
                            
                            // 聚焦输入框
                            inputBox.focus();
                            
                            // 清空输入框内容
                            inputBox.innerHTML = '';
                            
                            // 输入消息内容
                            document.execCommand('insertText', false, ${JSON.stringify(message)});
                            
                            // 保持聚焦状态，确保回车键能够被处理
                            inputBox.focus();
                            
                            // 直接模拟回车键发送消息
                            setTimeout(() => {
                                const enterEvent = new KeyboardEvent('keydown', {
                                    key: 'Enter',
                                    code: 'Enter',
                                    keyCode: 13,
                                    which: 13,
                                    bubbles: true,
                                    cancelable: true
                                });
                                
                                // 确保输入框仍然处于聚焦状态
                                inputBox.focus();
                                
                                // 触发回车键事件
                                inputBox.dispatchEvent(enterEvent);
                            }, 300);
                            
                            return true;
                        } catch (e) {
                            console.error('发送消息失败:', e);
                            return false;
                        }
                    }
                })();
            `);

            if (result) {
                logger.info(`已发送消息到抖音直播间: ${message}`);
                return true;
            } else {
                logger.error('发送消息到抖音直播间失败');
                return false;
            }
        } catch (error) {
            logger.error(`发送消息到抖音直播间出错: ${error.message}`);
            return false;
        }
    }

    /**
     * 初始化抖音窗口的消息监听器
     * @param {BrowserWindow} douyinWindow - 抖音窗口实例
     * @returns {Promise<boolean>} - 初始化结果
     */
    async initMessageListener(douyinWindow) {
        if (!douyinWindow || douyinWindow.isDestroyed()) {
            logger.error('抖音窗口不存在或已销毁，无法初始化消息监听器');
            return false;
        }

        try {
            // 注入消息处理脚本
            const result = await douyinWindow.webContents.executeJavaScript(this.getMessageListenerScript());
            logger.info('已为抖音窗口初始化消息监听器');
            return true;
        } catch (error) {
            logger.error(`初始化抖音窗口消息监听器失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取消息监听器脚本
     * @returns {string} - 消息监听器脚本
     */
    getMessageListenerScript() {
        return `
            // 监听来自主进程的消息
            if (!window.douyinMessageHandler) {
                const { ipcRenderer } = require('electron');
                
                // 创建消息处理函数对象
                window.douyinMessageHandler = {
                    // 存储关键词回复配置
                    replyItems: [],
                    isAutoReplyEnabled: false,
                    pendingMessages: [], // 待处理的消息队列
                    isProcessing: false, // 是否正在处理消息
                    canReplyNow: true,   // 当前是否可以回复
                    settings: {
                        minReplyInterval: 0, // 最小回复间隔
                        maxReplyInterval: 0, // 最大回复间隔
                        randomSpace: false,     // 是否添加随机空格
                        randomEmoji: false,      // 是否添加随机表情
                        delayEnabled: false     // 是否启用发言频率延迟
                    },
                    emojis: [], // 表情列表，从外部传入，不再使用硬编码表情
                    
                    // 设置配置
                    setConfig: function(config) {
                        if (config) {
                            this.replyItems = config.replyItems || [];
                            this.isAutoReplyEnabled = config.enabled || false;
                            
                            // 更新设置
                            if (config.settings) {
                                this.settings = {
                                    ...this.settings,
                                    ...config.settings
                                };
                            }
                            
                            // 更新表情列表
                            if (config.emojis && Array.isArray(config.emojis)) {
                                this.emojis = config.emojis;
                            }
                            
                            // 只发送关键信息，不在控制台输出
                            const messageType = this.isAutoReplyEnabled ? 'text_reply' : 'system';
                            const delayInfo = this.settings.delayEnabled ? 
                                \`频率: \${this.settings.minReplyInterval / 1000}-\${this.settings.maxReplyInterval / 1000}秒\` : 
                                '无延迟发言';
                            ipcRenderer.send('livechat-message', {
                                type: messageType,
                                message: \`自动回复已\${this.isAutoReplyEnabled ? '启用' : '禁用'}，\${this.replyItems.length}条规则，\${delayInfo}\`
                            });
                        }
                    },
                    
                    // 提取消息主体（冒号后面的部分）
                    extractMessageContent: function(message) {
                        // 检查消息格式，提取冒号后面的部分
                        if (!message) return '';
                        
                        const colonIndex = message.lastIndexOf(':');
                        if (colonIndex !== -1 && colonIndex < message.length - 1) {
                            return message.substring(colonIndex + 1).trim();
                        }
                        
                        return message.trim(); // 如果没有冒号，返回整个消息
                    },
                    
                    // 处理收到的消息
                    processMessage: function(data) {
                        // 只处理chat类型的消息
                        if (!data || data.type !== 'chat' || !this.isAutoReplyEnabled) {
                            return;
                        }
                        
                        // 将消息添加到队列
                        this.pendingMessages.push(data);
                        
                        // 如果没有正在处理消息，启动处理
                        if (!this.isProcessing) {
                            this.processMessageQueue();
                        }
                    },
                    
                    // 处理消息队列
                    processMessageQueue: async function() {
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
                            if (message && (this.canReplyNow || !this.settings.delayEnabled)) {
                                // 提取消息主体
                                const messageContent = this.extractMessageContent(message);
                                
                                // 标记当前不能回复，防止重复回复
                                this.canReplyNow = false;
                                
                                // 使用消息主体进行关键词匹配
                                const matched = await this.checkKeywordsParallel(messageContent);
                                
                                // 如果匹配了关键词，等待用户设置的延迟后再处理下一条消息
                                if (matched) {
                                    // 等待用户设置的时间
                                    const waitTime = this.settings.delayEnabled ? this.getRandomWaitTime() : 500;
                                    
                                    // 设置定时器在延迟后再处理下一条
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
                    },
                    
                    // 获取随机等待时间
                    getRandomWaitTime: function() {
                        const min = this.settings.minReplyInterval || 0;
                        const max = this.settings.maxReplyInterval || 0;
                        if (min === max) return max;
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    },
                    
                    // 处理消息内容（添加随机空格和表情）
                    processMessageContent: function(message) {
                        let result = message;
                        
                        // 添加随机空格
                        if (this.settings.randomSpace) {
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
                        if (this.settings.randomEmoji && this.emojis.length > 0) {
                            // 30%概率在消息末尾添加表情
                            if (Math.random() < 0.3) {
                                const randomEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
                                result += randomEmoji;
                            }
                        }
                        
                        return result;
                    },
                    
                    // 并行检测关键词
                    checkKeywordsParallel: async function(message) {
                        if (!this.replyItems || this.replyItems.length === 0) {
                            return false;
                        }
                        
                        try {
                            // 为所有关键词规则创建检测任务
                            const checkTasks = this.replyItems.map(item => {
                                return {
                                    item: item,
                                    keywords: item.keyword ? item.keyword.split(/[,，]/) : [],
                                    matched: false,
                                    matchedKeyword: null
                                };
                            });
                            
                            // 并行检测所有规则中的关键词
                            const checkPromises = checkTasks.map(task => {
                                return new Promise(resolve => {
                                    // 检查消息是否包含任一关键词
                                    const matchedKeyword = task.keywords.find(keyword => 
                                        message.toLowerCase().includes(keyword.trim().toLowerCase())
                                    );
                                    
                                    if (matchedKeyword) {
                                        task.matched = true;
                                        task.matchedKeyword = matchedKeyword;
                                    }
                                    
                                    resolve(task);
                                });
                            });
                            
                            // 等待所有检测完成
                            const results = await Promise.all(checkPromises);
                            
                            // 找到第一个匹配的规则
                            const matchedTask = results.find(task => task.matched);
                            
                            if (matchedTask) {
                                // 处理回复内容（添加随机空格和表情）
                                const processedReply = this.processMessageContent(matchedTask.item.reply);
                                
                                // 发送回复
                                this.sendReply(processedReply);
                                
                                // 发送触发信息到主窗口，不在控制台输出
                                ipcRenderer.send('livechat-message', {
                                    type: 'text_reply',
                                    message: \`关键词"\${matchedTask.matchedKeyword.trim()}"触发回复: \${processedReply}\`
                                });
                                
                                return true;
                            }
                            
                            return false;
                        } catch (error) {
                            console.error('检测关键词出错:', error);
                            return false;
                        }
                    },
                    
                    // 发送回复消息
                    sendReply: function(message) {
                        try {
                            // 查找输入框
                            const inputBox = document.querySelector('.zone-container.editor-kit-container');
                            if (!inputBox) {
                                console.error('未找到输入框');
                                return false;
                            }
                            
                            // 先清空输入框内容
                            inputBox.innerHTML = '';
                            
                            // 聚焦输入框
                            inputBox.focus();
                            
                            // 输入消息内容
                            document.execCommand('insertText', false, message);
                            
                            // 查找按钮元素
                            const btn = document.querySelector('svg.webcast-chatroom___send-btn');

                            if (btn) {
                              // 确保按钮未被禁用
                              btn.classList.remove('disable');
                              btn.removeAttribute('disabled');
                              
                              // 创建并触发更真实的点击事件
                              const clickEvent = new MouseEvent('click', {
                                bubbles: true,    // 允许事件冒泡
                                cancelable: true, // 允许取消默认行为
                                view: window,
                                composed: true    // 允许跨越 shadow DOM 边界
                              });

                              // 最终触发点击事件
                              btn.dispatchEvent(clickEvent);
                              
                              // 发送后再次清空输入框，确保不会残留文字
                              setTimeout(() => {
                                inputBox.innerHTML = '';
                              }, 100);
                              
                              return true;
                            } else {
                              console.error('未找到发送按钮');
                              return false;
                            }
                        } catch (error) {
                            console.error('发送回复消息失败:', error);
                            return false;
                        }
                    }
                };
                
                // 监听主进程发来的消息
                ipcRenderer.on('douyin-livechat-message', (event, data) => {
                    window.douyinMessageHandler.processMessage(data);
                });
                
                // 监听配置更新消息
                ipcRenderer.on('douyin-config-update', (event, config) => {
                    window.douyinMessageHandler.setConfig(config);
                });
                
                console.log('已设置抖音窗口消息处理器');
                
                // 返回初始化成功
                true;
            } else {
                // 处理器已存在
                console.log('抖音窗口消息处理器已存在');
                true;
            }
        `;
    }

    /**
     * 更新抖音窗口的自动回复配置
     * @param {BrowserWindow} douyinWindow - 抖音窗口实例
     * @param {Array} replyItems - 关键词和回复配置项
     * @param {boolean} enabled - 是否启用自动回复
     * @param {Object} settings - 回复设置
     * @param {Array} emojis - 表情列表
     * @returns {Promise<boolean>} - 更新结果
     */
    async updateConfig(douyinWindow, replyItems, enabled = true, settings = null, emojis = null) {
        if (!douyinWindow || douyinWindow.isDestroyed()) {
            logger.error('抖音窗口不存在或已销毁，无法更新配置');
            return false;
        }

        // 更新本地配置
        this.setAutoReplyConfig(replyItems, enabled, settings);

        try {
            // 向抖音窗口发送配置更新消息
            douyinWindow.webContents.send('douyin-config-update', {
                replyItems: this.replyItems,
                enabled: this.isAutoReplyEnabled,
                settings: this.replySettings,
                emojis: emojis
            });
            logger.info('已向抖音窗口发送配置更新');
            return true;
        } catch (error) {
            logger.error(`更新抖音窗口配置失败: ${error.message}`);
            return false;
        }
    }
}

// 创建服务实例并导出
const douyinLivechatHandler = new DouyinLivechatHandler();
douyinLivechatHandler.toString = () => '[DouyinLivechatHandler]';

module.exports = {
    douyinLivechatHandler,
    DouyinLivechatHandler
};