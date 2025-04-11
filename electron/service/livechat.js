'use strict';

const { logger } = require('ee-core/log');
const axios = require('axios');
const { cross } = require('ee-core/cross');
const { getMainWindow } = require('ee-core/electron');
const http = require('http');
const https = require('https');

/**
 * LiveChat服务
 * @class
 */
class LiveChatService {
    constructor() {
        // 开发模式下不使用cross模块
        this.isDev = process.env.NODE_ENV !== 'production';
        this.pythonServerName = 'douyinlive';
        this.devServerUrl = 'http://127.0.0.1:7074';
        this.activeRequests = {};
    }

    /**
     * 获取Python服务的基础URL
     */
    getPythonBaseUrl() {
        // 在开发模式下直接返回硬编码URL
        if (this.isDev) {
            logger.info('使用开发模式URL:', this.devServerUrl);
            return this.devServerUrl;
        }

        // 生产模式下使用cross模块获取URL
        const serverUrl = cross.getUrl(this.pythonServerName);
        return serverUrl;
    }

    /**
     * 请求API
     * @param {string} method - 请求方法 GET/POST/DELETE等
     * @param {string} path - API路径
     * @param {object} data - 请求数据
     * @param {number} timeout - 超时时间(毫秒)
     */
    async requestApi(method, path, data = {}, timeout = 30000) {
        try {
            const baseUrl = this.getPythonBaseUrl();
            if (!baseUrl) {
                throw new Error('Python服务未启动或无法获取Python服务地址');
            }

            const url = `${baseUrl}${path}`;
            logger.info(`正在请求API: ${method} ${url}`, data);

            // 区分GET和其他请求方法的参数传递方式
            const options = {
                method: method,
                url: url,
                timeout: timeout,
                proxy: false,
            };

            // GET请求使用params，其他请求使用data
            if (method.toUpperCase() === 'GET') {
                options.params = data;
            } else {
                options.data = data;
            }

            logger.info('请求选项:', JSON.stringify(options));
            const response = await axios(options);
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error(`请求失败，状态码: ${response.status}`);
            }
        } catch (error) {
            logger.error(`API请求错误: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * 获取直播间状态
     * @param {string} liveId - 直播间ID
     */
    async getRoomStatus(liveId) {
        return await this.requestApi('GET', `/api/v1/rooms/${liveId}`);
    }

    /**
     * 开始监控直播间
     * @param {string} liveId - 直播间ID
     */
    async startMonitoring(liveId) {
        try {
            const result = await this.requestApi('POST', `/api/v1/rooms/${liveId}/monitor`);
            // 如果成功，开始接收SSE事件
            if (result.status === 'success') {
                this.connectSSE(liveId);
            }
            return result;
        } catch (error) {
            logger.error(`开始监控直播间失败: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * 停止监控直播间
     * @param {string} liveId - 直播间ID
     */
    async stopMonitoring(liveId) {
        try {
            const result = await this.requestApi('DELETE', `/api/v1/rooms/${liveId}/monitor`);
            // 如果成功，关闭SSE连接
            if (result.status === 'success') {
                this.disconnectSSE(liveId);
            }
            return result;
        } catch (error) {
            logger.error(`停止监控直播间失败: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * 获取直播间事件流URL
     * @param {string} liveId - 直播间ID
     */
    getEventsUrl(liveId) {
        const baseUrl = this.getPythonBaseUrl();
        if (!baseUrl) {
            throw new Error('Python服务未启动或无法获取Python服务地址');
        }
        return `${baseUrl}/api/v1/rooms/${liveId}/events`;
    }

    /**
     * 连接到SSE事件流，并将消息转发到渲染进程
     * @param {string} liveId - 直播间ID
     */
    connectSSE(liveId) {
        // 如果已经有连接，先断开
        this.disconnectSSE(liveId);

        try {
            const eventsUrl = this.getEventsUrl(liveId);
            logger.info(`连接到SSE事件流: ${eventsUrl}`);

            // 解析URL以获取主机名和路径
            const urlObj = new URL(eventsUrl);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;

            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: `${urlObj.pathname}${urlObj.search}`,
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache'
                }
            };

            // 创建HTTP请求
            const req = client.request(options, (res) => {
                // 存储已收到的数据块
                let eventData = '';
                let eventName = '';

                // 设置编码以处理文本数据
                res.setEncoding('utf8');

                // 处理数据块
                res.on('data', (chunk) => {
                    // 解析SSE数据
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        // 如果是空行，表示事件结束，发送数据
                        if (line.trim() === '') {
                            if (eventData && eventName) {
                                this.sendMessageToRenderer(eventName, eventData);
                                eventData = '';
                                eventName = '';
                            }
                            continue;
                        }

                        // 解析事件行
                        if (line.startsWith('event:')) {
                            eventName = line.substring(6).trim();
                        }
                        // 解析数据行
                        else if (line.startsWith('data:')) {
                            eventData = line.substring(5).trim();
                        }
                    }
                });

                // 处理错误
                res.on('error', (err) => {
                    logger.error(`SSE连接错误: ${err.message}`, err);
                    this.sendMessageToRenderer('error', `SSE连接错误: ${err.message}`);
                    this.reconnectSSE(liveId);
                });

                // 连接关闭时尝试重新连接
                res.on('close', () => {
                    logger.info(`SSE连接关闭，尝试重新连接...`);
                    this.reconnectSSE(liveId);
                });
            });

            // 处理请求错误
            req.on('error', (err) => {
                logger.error(`SSE请求错误: ${err.message}`, err);
                this.sendMessageToRenderer('error', `SSE请求错误: ${err.message}`);
                this.reconnectSSE(liveId);
            });

            // 结束请求
            req.end();

            // 保存请求对象以便后续关闭
            this.activeRequests[liveId] = req;

            return true;
        } catch (error) {
            logger.error(`建立SSE连接失败: ${error.message}`, error);
            this.sendMessageToRenderer('error', `建立SSE连接失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 尝试重新连接SSE
     * @param {string} liveId - 直播间ID
     */
    reconnectSSE(liveId) {
        setTimeout(() => {
            if (this.activeRequests[liveId]) {
                logger.info(`重新连接SSE: ${liveId}`);
                this.connectSSE(liveId);
            }
        }, 5000); // 5秒后重试
    }

    /**
     * 发送消息到渲染进程
     * @param {string} type - 消息类型
     * @param {string} message - 消息内容
     */
    sendMessageToRenderer(type, message) {
        const win = getMainWindow();
        if (win && !win.isDestroyed()) {
            win.webContents.send('livechat-message', {
                type: type,
                message: message
            });
            logger.info(`发送消息到渲染进程: ${type}`, message);
        } else {
            logger.error('未找到主窗口或窗口已销毁，无法发送消息');
        }
    }

    /**
     * 断开SSE连接
     * @param {string} liveId - 直播间ID
     */
    disconnectSSE(liveId) {
        if (this.activeRequests[liveId]) {
            logger.info(`断开SSE连接: ${liveId}`);
            this.activeRequests[liveId].destroy();
            delete this.activeRequests[liveId];
        }
    }
}

LiveChatService.toString = () => '[class LiveChatService]';
module.exports = {
    LiveChatService,
    livechatService: new LiveChatService()
};