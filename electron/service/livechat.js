'use strict';

const { logger } = require('ee-core/log');
const axios = require('axios');
const { cross } = require('ee-core/cross');
const { getMainWindow } = require('ee-core/electron');
const http = require('http');
const https = require('https');
const path = require('path');
const { getExtraResourcesDir } = require('ee-core/ps');

/**
 * LiveChat服务
 * @class
 */
class LiveChatService {

    constructor() {
        this.pythonServiceName = 'DouyinLiveWebFetcher';
        this.activeRequests = {};
        this.reconnectCounts = {};
        // 添加监控状态跟踪
        this.monitoringRooms = new Set();

        // 配置HTTP和HTTPS agent以支持keepAlive
        this.httpAgent = new http.Agent({
            keepAlive: true,
            keepAliveMsecs: 3000, // 保持连接活跃时间
            maxSockets: 10, // 最大socket数
            timeout: 60000 // 超时时间60秒
        });

        this.httpsAgent = new https.Agent({
            keepAlive: true,
            keepAliveMsecs: 3000,
            maxSockets: 10,
            timeout: 60000
        });
    }

    /**
     * 创建Python服务
     * 使用API模式创建Python服务
     */
    async createPythonServer() {
        try {
            // 使用API模式创建服务
            const serviceName = this.pythonServiceName;
            const opt = {
                name: 'DouyinLiveWebFetcher',
                cmd: path.join(getExtraResourcesDir(), 'py', 'DouyinLiveWebFetcher'),
                directory: path.join(getExtraResourcesDir(), 'py'),
                args: ['--port=7074'],
                windowsExtname: true,
                appExit: true,
            }
            const entity = await cross.run(serviceName, opt);
            logger.info('Python服务名称:', entity.name);
            logger.info('Python服务配置:', entity.config);
            logger.info('Python服务URL:', entity.getUrl());
            return entity;
        } catch (error) {
            logger.error(`创建Python服务失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 获取Python服务的基础URL
     */
    getPythonBaseUrl() {
        const serverUrl = cross.getUrl(this.pythonServiceName);
        if (!serverUrl) {
            logger.error(`无法获取Python服务地址，服务名: ${this.pythonServiceName}`);
        }
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
                // 记录监控状态
                this.monitoringRooms.add(liveId);
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
                // 移除监控状态
                this.monitoringRooms.delete(liveId);
            }
            return result;
        } catch (error) {
            logger.error(`停止监控直播间失败: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * 获取直播间监控状态
     * @param {string} liveId - 直播间ID
     * @returns {boolean} - 是否正在监控
     */
    isMonitoring(liveId) {
        return this.monitoringRooms.has(liveId);
    }

    /**
     * 获取所有正在监控的直播间
     * @returns {Array} - 所有正在监控的直播间列表
     */
    getAllMonitoringRooms() {
        const rooms = [];
        for (const liveId of this.monitoringRooms) {
            rooms.push({
                live_id: liveId,
                is_monitoring: true
            });
        }
        return rooms;
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
                },
                timeout: 60000, // 增加超时时间为60秒
                agent: isHttps ? this.httpsAgent : this.httpAgent // 使用配置好的Agent
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

            // 设置请求超时处理
            req.on('timeout', () => {
                logger.error('SSE请求超时');
                req.destroy();
                this.sendMessageToRenderer('error', 'SSE请求超时，尝试重新连接');
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
        // 获取或初始化该直播间的重连次数
        if (!this.reconnectCounts) {
            this.reconnectCounts = {};
        }

        if (!this.reconnectCounts[liveId]) {
            this.reconnectCounts[liveId] = 0;
        }

        // 增加重连次数
        this.reconnectCounts[liveId]++;

        // 计算重连延迟时间，重连次数越多，延迟越长，但最长不超过30秒
        const delay = Math.min(5000 * Math.pow(1.5, Math.min(this.reconnectCounts[liveId], 5)), 30000);

        logger.info(`SSE将在${delay/1000}秒后尝试第${this.reconnectCounts[liveId]}次重连: ${liveId}`);

        setTimeout(() => {
            if (this.activeRequests[liveId]) {
                logger.info(`重新连接SSE: ${liveId}`);
                this.connectSSE(liveId);
            } else {
                // 如果不再需要重连，重置计数
                delete this.reconnectCounts[liveId];
            }
        }, delay);
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

            // 重置重连计数
            if (this.reconnectCounts && this.reconnectCounts[liveId]) {
                delete this.reconnectCounts[liveId];
            }
        }
    }
}

LiveChatService.toString = () => '[class LiveChatService]';
module.exports = {
    LiveChatService,
    livechatService: new LiveChatService()
};