'use strict';

const { logger } = require('ee-core/log');
const { cross } = require('ee-core/cross');
const path = require('path');
const { getExtraResourcesDir } = require('ee-core/ps');

/**
 * LiveChat服务
 * @class
 */
class PythonServer {

    constructor() {
        this.pythonServiceName = 'DouyinLiveRecorder';
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


}

PythonServer.toString = () => '[class PythonServer]';
module.exports = {
    PythonServer,
    pythonServer: new PythonServer()
};