'use strict';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { logger } = require('ee-core/log');
const { getBaseDir } = require('ee-core/ps');

/**
 * 直播配置监控服务
 * @class
 */
class LiveMonitorService {
  constructor() {
    // 初始化文件路径
    this.baseDir = getBaseDir();
    
    // URL_config.ini 文件可能在多个位置，我们尝试查找正确位置
    const possiblePaths = [
      path.join(this.baseDir, 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini'),
      path.join(this.baseDir, '..', 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini'),
      path.join(app.getAppPath(), 'python', 'DouyinLiveRecorder', 'config', 'URL_config.ini')
    ];
    
    this.configFilePath = '';
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        this.configFilePath = possiblePath;
        logger.info(`找到配置文件路径: ${this.configFilePath}`);
        break;
      }
    }
    
    if (!this.configFilePath) {
      logger.error('无法找到URL_config.ini文件，将使用默认路径');
      this.configFilePath = possiblePaths[0];
    }
    
    this.watchers = {};
    this.lastFileContent = '';
    this.watcherRunning = false;
    this.fileEncoding = 'utf-8';
  }

  /**
   * 启动文件监控
   * @param {Object} event - IPC事件对象，用于向渲染进程发送消息
   * @returns {Boolean} 启动结果
   */
  startWatching(event) {
    if (this.watcherRunning) {
      logger.info('URL配置文件监控已经在运行中');
      return true;
    }

    try {
      // 确保文件存在
      if (!fs.existsSync(this.configFilePath)) {
        logger.error(`配置文件不存在: ${this.configFilePath}`);
        return false;
      }

      logger.info(`开始监控文件: ${this.configFilePath}`);

      // 先读取一次文件内容
      this.lastFileContent = fs.readFileSync(this.configFilePath, this.fileEncoding);
      this.parseAndSendData(this.lastFileContent, event);

      // 设置文件监听
      this.watchers[this.configFilePath] = fs.watch(this.configFilePath, (eventType) => {
        if (eventType === 'change') {
          try {
            // 文件变化时，读取并解析文件内容
            logger.info(`检测到文件变化: ${this.configFilePath}`);
            const content = fs.readFileSync(this.configFilePath, this.fileEncoding);
            if (content !== this.lastFileContent) {
              this.lastFileContent = content;
              this.parseAndSendData(content, event);
            }
          } catch (error) {
            logger.error(`读取文件失败: ${error.message}`);
          }
        }
      });

      this.watcherRunning = true;
      logger.info('URL配置文件监控已启动');
      return true;
    } catch (error) {
      logger.error(`启动监控失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 停止文件监控
   * @returns {Boolean} 停止结果
   */
  stopWatching() {
    try {
      if (this.watchers[this.configFilePath]) {
        this.watchers[this.configFilePath].close();
        delete this.watchers[this.configFilePath];
        this.watcherRunning = false;
        logger.info('URL配置文件监控已停止');
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`停止监控失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 解析配置文件内容并发送数据
   * @param {String} content - 文件内容
   * @param {Object} event - IPC事件对象
   */
  parseAndSendData(content, event) {
    try {
      const lines = content.split('\n');
      const liveStreams = [];
      let currentSection = '';

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#')) continue; // 跳过空行和注释行
        
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
            streamerName: streamerName
          });
        }
      }

      // 创建消息数据
      const data = {
        type: 'live_config_update',
        streams: liveStreams,
        timestamp: new Date().toISOString()
      };

      // 判断event是否存在，避免在初始化时没有event对象导致错误
      if (event && typeof event.reply === 'function') {
        // 发送消息到渲染进程
        const channel = 'controller/live_monitor/configUpdate';
        event.reply(channel, data);
        logger.info(`已发送配置更新消息，共 ${liveStreams.length} 条直播信息`);
      } else {
        logger.warn('未传入有效的event对象，无法发送配置更新消息');
      }
    } catch (error) {
      logger.error(`解析配置文件失败: ${error.message}`);
    }
  }

  /**
   * 手动获取最新配置
   * @param {Object} event - IPC事件对象
   * @returns {Boolean} 获取结果
   */
  getLatestConfig(event) {
    try {
      if (!fs.existsSync(this.configFilePath)) {
        logger.error(`配置文件不存在: ${this.configFilePath}`);
        return false;
      }

      const content = fs.readFileSync(this.configFilePath, this.fileEncoding);
      this.parseAndSendData(content, event);
      return true;
    } catch (error) {
      logger.error(`获取配置失败: ${error.message}`);
      return false;
    }
  }
}

LiveMonitorService.toString = () => '[class LiveMonitorService]';

module.exports = {
  LiveMonitorService,
  liveMonitorService: new LiveMonitorService()
}; 