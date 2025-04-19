'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { logger } = require('ee-core/log');
const { getBaseDir } = require('ee-core/ps');
const { cross } = require('ee-core/cross');
const { getExtraResourcesDir } = require('ee-core/ps');

/**
 * 直播配置监控服务
 * @class
 */
class LiveMonitorService {
    constructor() {
        // 初始化文件路径 
        try {
            this.pythonServiceName = 'DouyinLiveRecorder';
            this.baseDir = getBaseDir();

            // 确保baseDir有效
            if (!this.baseDir) {
                logger.warn('baseDir未定义，将使用当前目录');
                this.baseDir = process.cwd();
            }

            // 确保app.getAppPath()可用
            const appPath = app.getAppPath() || '';

            // URL_config.ini 文件可能在多个位置，我们尝试查找正确位置
            const possiblePaths = [
                path.join(this.baseDir, 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini'),
                path.join(this.baseDir, '..', 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini')
            ];

            // 只有当appPath有效时才添加第三个路径
            if (appPath) {
                possiblePaths.push(path.join(appPath, 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini'));
            }

            this.configFilePath = '';
            for (const possiblePath of possiblePaths) {
                try {
                    if (fs.existsSync(possiblePath)) {
                        this.configFilePath = possiblePath;
                        logger.info(`找到配置文件路径: ${this.configFilePath}`);
                        break;
                    }
                } catch (e) {
                    logger.warn(`检查路径失败: ${possiblePath}, 错误: ${e.message}`);
                }
            }

            if (!this.configFilePath) {
                logger.error('无法找到URL_config.ini文件，将使用默认路径');
                // 使用第一个路径作为默认值，即使它可能不存在
                this.configFilePath = possiblePaths[0] || path.join(process.cwd(), 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini');

                // 尝试创建配置文件所在的目录
                try {
                    const dirPath = path.dirname(this.configFilePath);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                        logger.info(`已创建配置目录: ${dirPath}`);
                    }

                    // 创建空的配置文件
                    if (!fs.existsSync(this.configFilePath)) {
                        this.writeFileAtomically(this.configFilePath, '', this.fileEncoding);
                        logger.info(`已创建空的配置文件: ${this.configFilePath}`);
                    }
                } catch (e) {
                    logger.error(`创建配置文件失败: ${e.message}`);
                }
            }

            this.watchers = {};
            this.lastFileContent = '';
            this.watcherRunning = false;
            this.fileEncoding = 'utf-8';
            this.lastEvent = null;
            this.latestData = null; // 用于存储最新解析的配置数据
            this.isFileLocked = false; // 文件锁定状态
            this.maxRetries = 5; // 最大重试次数
            this.retryInterval = 100; // 重试间隔(毫秒)
        } catch (error) {
            logger.error(`初始化LiveMonitorService失败: ${error.message}`);
            // 设置一个默认路径
            this.configFilePath = path.join(process.cwd(), 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini');
        }
    }

    /**
     * 原子写入文件
     * 先写入临时文件，然后重命名替换原始文件
     * @param {String} filePath - 文件路径
     * @param {String} content - 文件内容
     * @param {String} encoding - 编码
     * @param {Number} currentRetry - 当前重试次数
     */
    async writeFileAtomically(filePath, content, encoding, currentRetry = 0) {
        // 如果文件被锁定，等待后重试
        if (this.isFileLocked) {
            if (currentRetry >= this.maxRetries) {
                throw new Error(`文件 ${filePath} 被锁定，重试 ${currentRetry} 次后仍无法写入`);
            }

            logger.warn(`文件 ${filePath} 被锁定，等待后重试 (${currentRetry + 1}/${this.maxRetries})`);

            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, this.retryInterval));
            return this.writeFileAtomically(filePath, content, encoding, currentRetry + 1);
        }

        try {
            // 设置文件锁定状态
            this.isFileLocked = true;

            // 创建临时文件路径
            const tempFilePath = `${filePath}.tmp`;

            // 写入临时文件
            fs.writeFileSync(tempFilePath, content, encoding);

            // 重命名临时文件替换原始文件 (原子操作)
            fs.renameSync(tempFilePath, filePath);

            logger.info(`成功原子写入文件: ${filePath}`);
        } catch (error) {
            // 如果是因为文件被占用而失败，重试
            if (error.code === 'EBUSY' || error.code === 'EACCES' || error.code === 'EPERM') {
                if (currentRetry < this.maxRetries) {
                    logger.warn(`文件 ${filePath} 被占用，等待后重试 (${currentRetry + 1}/${this.maxRetries})`);

                    // 释放文件锁定
                    this.isFileLocked = false;

                    // 等待一段时间后重试
                    await new Promise(resolve => setTimeout(resolve, this.retryInterval));
                    return this.writeFileAtomically(filePath, content, encoding, currentRetry + 1);
                }
            }

            // 重试失败或其他错误，抛出异常
            logger.error(`原子写入文件失败: ${error.message}`);
            throw error;
        } finally {
            // 无论成功还是失败，都释放文件锁定
            this.isFileLocked = false;
        }
    }

    /**
     * 安全读取文件
     * 包含重试机制，如果文件被占用则等待后重试
     * @param {String} filePath - 文件路径
     * @param {String} encoding - 编码
     * @param {Number} currentRetry - 当前重试次数
     * @returns {String} 文件内容
     */
    async safeReadFile(filePath, encoding, currentRetry = 0) {
        try {
            return fs.readFileSync(filePath, encoding);
        } catch (error) {
            // 如果是因为文件被占用而失败，重试
            if ((error.code === 'EBUSY' || error.code === 'EACCES' || error.code === 'EPERM') && currentRetry < this.maxRetries) {
                logger.warn(`读取文件 ${filePath} 失败，等待后重试 (${currentRetry + 1}/${this.maxRetries})`);

                // 等待一段时间后重试
                await new Promise(resolve => setTimeout(resolve, this.retryInterval));
                return this.safeReadFile(filePath, encoding, currentRetry + 1);
            }

            // 重试失败或其他错误，抛出异常
            throw error;
        }
    }

    /**
     * 启动文件监控
     * @param {Object} event - IPC事件对象，用于向渲染进程发送消息
     * @returns {Object} 启动结果
     */
    startWatching(event) {
        // 前端ipc频道 channel
        const channel = 'controller/live_monitor/configUpdate';

        if (this.watcherRunning) {
            logger.info('URL配置文件监控已经在运行中');
            return { status: 'running', message: 'URL配置文件监控已经在运行中' };
        }

        try {
            // 再次检查确保配置文件路径有效
            if (!this.configFilePath) {
                logger.error('配置文件路径未定义');
                return { status: 'error', message: '配置文件路径未定义' };
            }

            // 检查配置文件是否存在
            if (!fs.existsSync(this.configFilePath)) {
                logger.error(`配置文件不存在: ${this.configFilePath}`);

                // 尝试创建配置文件和目录
                try {
                    const dirPath = path.dirname(this.configFilePath);
                    if (!fs.existsSync(dirPath)) {
                        fs.mkdirSync(dirPath, { recursive: true });
                        logger.info(`已创建配置目录: ${dirPath}`);
                    }

                    // 创建空的配置文件
                    fs.writeFileSync(this.configFilePath, '', this.fileEncoding);
                    logger.info(`已创建空的配置文件: ${this.configFilePath}`);
                } catch (e) {
                    logger.error(`创建配置文件失败: ${e.message}`);
                    return { status: 'error', message: `创建配置文件失败: ${e.message}` };
                }
            }

            logger.info(`开始监控文件: ${this.configFilePath}`);

            // 保存event对象，以便后续使用
            if (event) {
                this.lastEvent = event;
            }

            // 先读取一次文件内容并解析
            this.lastFileContent = fs.readFileSync(this.configFilePath, this.fileEncoding);
            const initialData = this.parseConfigData(this.lastFileContent);

            // 检查event对象是否有reply方法，有则发送初始数据
            if (event && typeof event.reply === 'function') {
                event.reply(channel, initialData);
                logger.info(`已通过event.reply发送配置更新初始数据，共 ${initialData.streams.length} 条直播信息`);
            } else if (event && typeof event.sender === 'object' && typeof event.sender.send === 'function') {
                // 如果有sender.send方法，使用它来发送消息
                event.sender.send(channel, initialData);
                logger.info(`已通过event.sender.send发送配置更新初始数据，共 ${initialData.streams.length} 条直播信息`);
            } else {
                // 在预加载阶段可能没有event对象，仅记录日志，不发送消息
                logger.info(`预加载阶段启动，读取到 ${initialData.streams.length} 条直播信息`);
            }

            // 设置文件监听
            this.watchers[this.configFilePath] = fs.watch(this.configFilePath, (eventType) => {
                if (eventType === 'change') {
                    try {
                        // 文件变化时，读取并解析文件内容
                        logger.info(`检测到文件变化: ${this.configFilePath}`);
                        const content = fs.readFileSync(this.configFilePath, this.fileEncoding);
                        if (content !== this.lastFileContent) {
                            this.lastFileContent = content;
                            const data = this.parseConfigData(content);

                            // 保存最新解析的数据，以便新的窗口连接时使用
                            this.latestData = data;

                            // 检查是否有上次保存的event对象，如果有则使用它发送消息
                            const currentEvent = event || this.lastEvent;

                            // 尝试多种方式发送消息到渲染进程
                            if (currentEvent && typeof currentEvent.reply === 'function') {
                                currentEvent.reply(channel, data);
                                logger.info(`已通过event.reply发送配置更新消息，共 ${data.streams.length} 条直播信息`);
                            } else if (currentEvent && typeof currentEvent.sender === 'object' && typeof currentEvent.sender.send === 'function') {
                                currentEvent.sender.send(channel, data);
                                logger.info(`已通过event.sender.send发送配置更新消息，共 ${data.streams.length} 条直播信息`);
                            } else {
                                logger.info(`监测到配置更新，读取到 ${data.streams.length} 条直播信息，但没有可用的event对象`);
                            }
                        }
                    } catch (error) {
                        logger.error(`读取文件失败: ${error.message}`);
                        const currentEvent = event || this.lastEvent;
                        // 同样需要检查event对象
                        if (currentEvent && typeof currentEvent.reply === 'function') {
                            currentEvent.reply(channel, {
                                type: 'error',
                                message: `读取文件失败: ${error.message}`,
                                timestamp: new Date().toISOString()
                            });
                        } else if (currentEvent && typeof currentEvent.sender === 'object' && typeof currentEvent.sender.send === 'function') {
                            currentEvent.sender.send(channel, {
                                type: 'error',
                                message: `读取文件失败: ${error.message}`,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            });

            this.watcherRunning = true;
            logger.info('URL配置文件监控已启动');
            return { status: 'success', message: 'URL配置文件监控已启动' };
        } catch (error) {
            logger.error(`启动监控失败: ${error.message}`);
            return { status: 'error', message: `启动监控失败: ${error.message}` };
        }
    }

    /**
     * 停止文件监控
     * @returns {Object} 停止结果
     */
    stopWatching() {
        try {
            if (this.watchers[this.configFilePath]) {
                this.watchers[this.configFilePath].close();
                delete this.watchers[this.configFilePath];
                this.watcherRunning = false;
                logger.info('URL配置文件监控已停止');
                return { status: 'success', message: 'URL配置文件监控已停止' };
            }
            return { status: 'not_running', message: '没有正在运行的监控' };
        } catch (error) {
            logger.error(`停止监控失败: ${error.message}`);
            return { status: 'error', message: `停止监控失败: ${error.message}` };
        }
    }

    /**
     * 解析配置文件内容
     * @param {String} content - 文件内容
     * @returns {Object} 解析后的数据
     */
    parseConfigData(content) {
        try {
            const lines = content.split('\n');
            const liveStreams = [];
            let currentSection = '';

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if (!line) continue; // 跳过空行

                let isDisabled = false;
                // 检查行是否被注释
                if (line.startsWith('#')) {
                    isDisabled = true;
                    line = line.substring(1).trim(); // 移除#号
                }

                // 跳过其他注释行
                if (line.startsWith('//')) continue;

                // 检查是否是节名称（例如"抖音:"）
                if (line.endsWith(':')) {
                    currentSection = line.slice(0, -1); // 去掉冒号
                    continue;
                }

                // 解析配置行: 画质,直播链接,主播: 主播名
                const match = line.match(/^(.*?),(https?:\/\/.*?)(?:,主播:\s*(.*))?$/);
                if (match) {
                    const quality = match[1].trim();
                    const url = match[2].trim();
                    let streamerName = match[3] ? match[3].trim() : '未知主播';

                    if (streamerName === undefined || streamerName === '') {
                        streamerName = `${currentSection}主播`;
                    }

                    liveStreams.push({
                        quality: quality,
                        url: url,
                        streamerName: streamerName,
                        isDisabled: isDisabled
                    });
                }
            }

            // 创建消息数据
            return {
                type: 'live_config_update',
                streams: liveStreams,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error(`解析配置文件失败: ${error.message}`);
            return {
                type: 'error',
                message: `解析配置文件失败: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 添加直播链接
     * @param {Object} args - 包含画质和URL的参数对象
     * @param {Object} event - IPC事件对象
     * @returns {Object} 添加结果
     */
    async addLiveUrl(args, event) {
        try {
            // 检查参数
            if (!args || !args.quality || !args.url) {
                logger.error('缺少必要的参数: 画质和URL');
                return { status: 'error', message: '缺少必要的参数: 画质和URL' };
            }

            // 检查配置文件是否存在
            if (!fs.existsSync(this.configFilePath)) {
                // 尝试创建配置文件所在的目录
                const dirPath = path.dirname(this.configFilePath);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                // 创建一个空的配置文件
                await this.writeFileAtomically(this.configFilePath, '', this.fileEncoding);
                logger.info(`已创建新的配置文件: ${this.configFilePath}`);
            }

            // 格式化需要添加的行
            const quality = args.quality.trim();
            const url = args.url.trim();
            const newLine = `${quality},${url}`;

            // 读取现有内容
            let content = '';
            try {
                content = await this.safeReadFile(this.configFilePath, this.fileEncoding);
            } catch (err) {
                logger.error(`读取配置文件失败: ${err.message}`);
                // 如果读取失败，使用空字符串
                content = '';
            }

            // 检查是否需要换行
            if (content && !content.endsWith('\n')) {
                content += '\n';
            }

            // 添加新行
            content += newLine + '\n';

            // 原子写入文件
            await this.writeFileAtomically(this.configFilePath, content, this.fileEncoding);
            logger.info(`已添加新的直播链接: ${newLine}`);

            // 通知前端配置已更新
            if (event) {
                this.lastEvent = event;
                // 发送成功消息
                await this.getLatestConfig(event);
            }

            return {
                status: 'success',
                message: `已添加新的直播链接，画质: ${quality}`
            };
        } catch (error) {
            logger.error(`添加直播链接失败: ${error.message}`);
            return {
                status: 'error',
                message: `添加直播链接失败: ${error.message}`
            };
        }
    }

    /**
     * 手动获取最新配置
     * @param {Object} event - IPC事件对象
     * @returns {Object} 获取结果
     */
    getLatestConfig(event) {
        try {
            if (!fs.existsSync(this.configFilePath)) {
                logger.error(`配置文件不存在: ${this.configFilePath}`);
                return { status: 'error', message: `配置文件不存在: ${this.configFilePath}` };
            }

            const content = fs.readFileSync(this.configFilePath, this.fileEncoding);
            const data = this.parseConfigData(content);

            // 保存最新数据
            this.latestData = data;

            // 保存event对象，以便后续使用
            if (event) {
                this.lastEvent = event;
            }

            // 发送数据到前端，支持多种发送方式
            const channel = 'controller/live_monitor/configUpdate';

            // 使用当前event或保存的lastEvent
            const currentEvent = event || this.lastEvent;

            if (currentEvent && typeof currentEvent.reply === 'function') {
                currentEvent.reply(channel, data);
                logger.info(`已通过event.reply发送配置更新消息，共 ${data.streams.length} 条直播信息`);
                return { status: 'success', message: '已获取最新配置并发送' };
            } else if (currentEvent && typeof currentEvent.sender === 'object' && typeof currentEvent.sender.send === 'function') {
                currentEvent.sender.send(channel, data);
                logger.info(`已通过event.sender.send发送配置更新消息，共 ${data.streams.length} 条直播信息`);
                return { status: 'success', message: '已获取最新配置并发送' };
            } else {
                logger.info(`已获取最新配置, 共 ${data.streams.length} 条直播信息，但无法发送（没有可用的event对象）`);
                return {
                    status: 'success',
                    message: '已获取最新配置',
                    data: data // 返回数据以便直接使用
                };
            }
        } catch (error) {
            logger.error(`获取配置失败: ${error.message}`);
            return { status: 'error', message: `获取配置失败: ${error.message}` };
        }
    }

    /**
     * 更新直播链接的画质
     * @param {Object} args - 包含行号、旧URL、旧画质、新画质和URL的参数对象
     * @param {Object} event - IPC事件对象
     * @returns {Object} 更新结果
     */
    async updateQuality(args, event) {
        try {
            // 检查参数
            if (!args || args.lineIndex === undefined || !args.newQuality) {
                logger.error('缺少必要的参数: 行号和新画质');
                return { status: 'error', message: '缺少必要的参数: 行号和新画质' };
            }

            // 检查配置文件是否存在
            if (!fs.existsSync(this.configFilePath)) {
                logger.error(`配置文件不存在: ${this.configFilePath}`);
                return { status: 'error', message: `配置文件不存在: ${this.configFilePath}` };
            }

            // 记录关键参数用于调试
            logger.info(`尝试更新行画质，表格行号: ${args.lineIndex}, 新画质: "${args.newQuality}"`);

            // 安全读取配置文件内容
            let content = await this.safeReadFile(this.configFilePath, this.fileEncoding);
            const allLines = content.split('\n');

            // 分析ini文件结构
            // 获取有效的直播链接行
            const validLines = [];
            for (let i = 0; i < allLines.length; i++) {
                const line = allLines[i].trim();
                if (line.match(/^.*?,https?:\/\/.*$/)) {
                    validLines.push({ line: line, index: i });
                }
            }

            // 检查行号是否有效
            if (args.lineIndex < 0 || args.lineIndex >= validLines.length) {
                logger.error(`表格行号无效: ${args.lineIndex}, 有效范围: 0-${validLines.length - 1}`);
                return { status: 'error', message: '表格行号超出范围' };
            }

            // 获取ini文件中对应的行索引
            const targetLineInfo = validLines[args.lineIndex];
            const targetLineIndex = targetLineInfo.index;
            logger.info(`表格行号 ${args.lineIndex} 对应ini文件中的第 ${targetLineIndex + 1} 行`);

            // 获取要修改的行内容
            const targetLine = allLines[targetLineIndex].trim();
            logger.info(`要修改的行: "${targetLine}"`);

            // 格式化需要的参数
            const newQualityStr = args.newQuality.trim();

            // 分析目标行，提取URL部分
            const parts = targetLine.split(',');
            if (parts.length >= 2) {
                // 不管旧画质是什么，直接替换第一部分为新画质
                const url = parts.slice(1).join(','); // 获取URL部分，保留可能有逗号的URL
                const newLine = `${newQualityStr},${url}`;
                allLines[targetLineIndex] = newLine;
                logger.info(`更新后的行: "${newLine}"`);
            } else {
                logger.error(`行内容格式不正确，无法解析: "${targetLine}"`);
                return { status: 'error', message: '行内容格式不正确，无法更新' };
            }

            // 写回文件
            content = allLines.join('\n');
            await this.writeFileAtomically(this.configFilePath, content, this.fileEncoding);
            logger.info(`已更新ini配置中的第 ${targetLineIndex + 1} 行画质为: ${newQualityStr}`);

            // 通知前端配置已更新
            if (event) {
                this.lastEvent = event;
                await this.getLatestConfig(event);
            }

            return {
                status: 'success',
                message: `已更新直播链接画质为: ${newQualityStr}`
            };
        } catch (error) {
            logger.error(`更新直播链接画质失败: ${error.message}`);
            return {
                status: 'error',
                message: `更新直播链接画质失败: ${error.message}`
            };
        }
    }

    /**
     * 删除直播链接
     * @param {Object} args - 包含行号、URL和画质的参数对象
     * @param {Object} event - IPC事件对象
     * @returns {Object} 删除结果
     */
    async removeStream(args, event) {
        try {
            // 检查参数
            if (!args || args.lineIndex === undefined) {
                logger.error('缺少必要的参数: 行号');
                return { status: 'error', message: '缺少必要的参数: 行号' };
            }

            // 检查配置文件是否存在
            if (!fs.existsSync(this.configFilePath)) {
                logger.error(`配置文件不存在: ${this.configFilePath}`);
                return { status: 'error', message: `配置文件不存在: ${this.configFilePath}` };
            }

            // 记录关键参数用于调试
            logger.info(`尝试删除行，表格行号: ${args.lineIndex}, URL: "${args.url}", 画质: "${args.quality}"`);

            // 安全读取配置文件内容
            let content = await this.safeReadFile(this.configFilePath, this.fileEncoding);
            const allLines = content.split('\n');

            // 分析ini文件结构
            // 找到第一个有效的直播链接行
            let firstValidLineIndex = -1;
            for (let i = 0; i < allLines.length; i++) {
                const line = allLines[i].trim();
                // 匹配直播链接格式: 画质,URL
                if (line.match(/^.*?,https?:\/\/.*$/)) {
                    firstValidLineIndex = i;
                    break;
                }
            }

            if (firstValidLineIndex === -1) {
                logger.error('配置文件中没有找到有效的直播链接行');
                return { status: 'error', message: '配置文件中没有找到有效的直播链接行' };
            }

            // 计算ini文件中对应的实际行索引
            // 获取有效的直播链接行
            const validLines = [];
            for (let i = 0; i < allLines.length; i++) {
                const line = allLines[i].trim();
                if (line.match(/^.*?,https?:\/\/.*$/)) {
                    validLines.push({ line: line, index: i });
                }
            }

            // 检查行号是否有效
            if (args.lineIndex < 0 || args.lineIndex >= validLines.length) {
                logger.error(`表格行号无效: ${args.lineIndex}, 有效范围: 0-${validLines.length - 1}`);
                return { status: 'error', message: '表格行号超出范围' };
            }

            // 获取ini文件中对应的行索引
            const targetLineInfo = validLines[args.lineIndex];
            const targetLineIndex = targetLineInfo.index;
            logger.info(`表格行号 ${args.lineIndex} 对应ini文件中的第 ${targetLineIndex + 1} 行`);

            // 记录要删除的行
            const lineToRemove = allLines[targetLineIndex];
            logger.info(`要删除的行: "${lineToRemove}"`);

            // 创建新的行列表，跳过要删除的行
            let newLines = [];
            for (let i = 0; i < allLines.length; i++) {
                if (i !== targetLineIndex) {
                    newLines.push(allLines[i]);
                }
            }

            // 写回文件
            content = newLines.join('\n');
            await this.writeFileAtomically(this.configFilePath, content, this.fileEncoding);
            logger.info(`已删除ini配置中的第 ${targetLineIndex + 1} 行: "${lineToRemove}"`);

            // 通知前端配置已更新
            if (event) {
                this.lastEvent = event;
                await this.getLatestConfig(event);
            }

            return {
                status: 'success',
                message: `已删除直播链接，行号: ${targetLineIndex + 1}`
            };
        } catch (error) {
            logger.error(`删除直播链接失败: ${error.message}`);
            return {
                status: 'error',
                message: `删除直播链接失败: ${error.message}`
            };
        }
    }

    /**
     * 切换直播链接的监控状态
     * @param {Object} args - 包含行号、URL和画质的参数对象
     * @param {Object} event - IPC事件对象
     * @returns {Object} 操作结果
     */
    async toggleStreamMonitoring(args, event) {
        try {
            // 检查参数
            if (!args || args.lineIndex === undefined) {
                logger.error('缺少必要的参数: 行号');
                return { status: 'error', message: '缺少必要的参数: 行号' };
            }

            // 检查配置文件是否存在
            if (!fs.existsSync(this.configFilePath)) {
                logger.error(`配置文件不存在: ${this.configFilePath}`);
                return { status: 'error', message: `配置文件不存在: ${this.configFilePath}` };
            }

            // 记录关键参数用于调试
            logger.info(`尝试${args.disable ? '停止' : '恢复'}监控，表格行号: ${args.lineIndex}`);

            // 安全读取配置文件内容
            let content = await this.safeReadFile(this.configFilePath, this.fileEncoding);
            const allLines = content.split('\n');

            // 分析ini文件结构，获取有效的直播链接行（包括被注释的行）
            const validLines = [];
            for (let i = 0; i < allLines.length; i++) {
                const line = allLines[i].trim();

                // 检查是否是注释的直播链接行
                if (line.startsWith('#') && line.substring(1).trim().match(/^.*?,https?:\/\/.*$/)) {
                    validLines.push({ line: line, index: i, isDisabled: true });
                    continue;
                }

                // 检查是否是普通的直播链接行
                if (line.match(/^.*?,https?:\/\/.*$/)) {
                    validLines.push({ line: line, index: i, isDisabled: false });
                }
            }

            // 检查行号是否有效
            if (args.lineIndex < 0 || args.lineIndex >= validLines.length) {
                logger.error(`表格行号无效: ${args.lineIndex}, 有效范围: 0-${validLines.length - 1}`);
                return { status: 'error', message: '表格行号超出范围' };
            }

            // 获取ini文件中对应的行索引
            const targetLineInfo = validLines[args.lineIndex];
            const targetLineIndex = targetLineInfo.index;
            const targetLine = allLines[targetLineIndex];
            const isCurrentlyDisabled = targetLine.trim().startsWith('#');

            logger.info(`表格行号 ${args.lineIndex} 对应ini文件中的第 ${targetLineIndex + 1} 行`);
            logger.info(`当前行: "${targetLine}", 当前${isCurrentlyDisabled ? '已停止' : '正在'}监控`);

            // 根据操作要求修改行
            if (args.disable && !isCurrentlyDisabled) {
                // 添加注释符号
                allLines[targetLineIndex] = `#${targetLine}`;
                logger.info(`已停止监控: "${allLines[targetLineIndex]}"`);
            } else if (!args.disable && isCurrentlyDisabled) {
                // 移除注释符号
                allLines[targetLineIndex] = targetLine.substring(targetLine.indexOf('#') + 1);
                logger.info(`已恢复监控: "${allLines[targetLineIndex]}"`);
            } else {
                logger.info(`状态已经是${args.disable ? '停止' : '监控'}中，无需修改`);
            }

            // 写回文件
            content = allLines.join('\n');
            await this.writeFileAtomically(this.configFilePath, content, this.fileEncoding);
            logger.info(`已${args.disable ? '停止' : '恢复'}监控ini配置中的第 ${targetLineIndex + 1} 行`);

            // 通知前端配置已更新
            if (event) {
                this.lastEvent = event;
                await this.getLatestConfig(event);
            }

            return {
                status: 'success',
                message: `已${args.disable ? '停止' : '恢复'}监控`
            };
        } catch (error) {
            logger.error(`切换监控状态失败: ${error.message}`);
            return {
                status: 'error',
                message: `切换监控状态失败: ${error.message}`
            };
        }
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
                name: 'DouyinLiveRecorder',
                cmd: path.join(getExtraResourcesDir(), 'py', 'DouyinLiveRecorder'),
                directory: path.join(getExtraResourcesDir(), 'py'),
                args: ['--port=7075'],
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
}

LiveMonitorService.toString = () => '[class LiveMonitorService]';

module.exports = {
    LiveMonitorService,
    liveMonitorService: new LiveMonitorService()
};