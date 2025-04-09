'use strict';

const { liveMonitorService } = require('../service/live_monitor');
const { logger } = require('ee-core/log');

/**
 * 直播监控控制器
 * @class
 */
class LiveMonitorController {

  async test () {
    return 'hello electron-egg';
  }
  /**
   * 启动监控
   */   
  async startMonitoring(args, event) {
    logger.info('启动URL_config.ini文件监控');
    const result = liveMonitorService.startWatching(event);
    
    return {
      success: result,
      message: result ? '监控已启动' : '监控启动失败'
    };
  }

  /**
   * 停止监控
   */
  async stopMonitoring(args, event) {
    logger.info('停止URL_config.ini文件监控');
    const result = liveMonitorService.stopWatching();
    
    return {
      success: result,
      message: result ? '监控已停止' : '监控停止失败或未启动'
    };
  }

  /**
   * 手动获取最新配置
   */
  async getLatestConfig(args, event) {
    logger.info('手动获取URL_config.ini最新配置');
    const result = liveMonitorService.getLatestConfig(event);
    
    return {
      success: result,
      message: result ? '配置获取成功' : '配置获取失败'
    };
  }

  /**
   * 接收配置更新消息
   */
  async configUpdate(args, event) {
    // 此方法仅作为标记，实际处理由service层直接通过event.reply完成
    logger.info('接收到配置更新消息');
    return { success: true };
  }
}

LiveMonitorController.toString = () => '[class LiveMonitorController]';
module.exports = LiveMonitorController; 