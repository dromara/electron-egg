'use strict';

const { logger } = require('ee-core/log');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const axios = require('axios');
const os = require('os');
const crypto = require('crypto');

/**
 * effect
 * @class
 */
class EffectService {

    constructor() {
        // 激活信息存储路径
        this.activationFilePath = path.join(app.getPath('userData'), 'activation.json');
    }

    /**
     * hello
     */
    async hello(args) {
        let obj = {
            status: 'ok',
            params: args
        }
        logger.info('EffectService obj:', obj);

        return obj;
    }

    /**
     * 生成设备指纹
     * @returns {string} 设备唯一标识
     */
    generateDeviceFingerprint() {
        try {
            // 收集系统信息
            const hostname = os.hostname();
            const username = os.userInfo().username;
            const platform = os.platform();
            const cpus = os.cpus().map(cpu => cpu.model).join('');
            const totalMem = os.totalmem().toString();
            const mac = this._getMacAddress();

            // 组合并哈希生成指纹
            const fingerprint = `${hostname}-${username}-${platform}-${cpus}-${totalMem}-${mac}`;
            const hash = crypto.createHash('md5').update(fingerprint).digest('hex');

            // 处理为指定格式
            const formattedFingerprint = this._formatFingerprint(hash);

            logger.info('生成设备指纹:', formattedFingerprint);
            return formattedFingerprint;
        } catch (error) {
            logger.error('生成设备指纹出错:', error);
            // 出错时使用备用方法，但仍然保证同一设备会生成相同指纹
            const backupFingerprint = `${os.hostname()}-${os.platform()}-backup`;
            const backupHash = crypto.createHash('md5').update(backupFingerprint).digest('hex');
            return this._formatFingerprint(backupHash);
        }
    }

    /**
     * 获取MAC地址
     * @private
     * @returns {string} MAC地址
     */
    _getMacAddress() {
        try {
            const networkInterfaces = os.networkInterfaces();
            // 遍历网络接口
            for (const name of Object.keys(networkInterfaces)) {
                const interfaces = networkInterfaces[name];
                for (const iface of interfaces) {
                    // 跳过内部和非IPv4的地址
                    if (!iface.internal && iface.family === 'IPv4') {
                        return iface.mac || '';
                    }
                }
            }
            return '';
        } catch (error) {
            logger.error('获取MAC地址出错:', error);
            return '';
        }
    }

    /**
     * 格式化设备指纹，简单截取哈希值
     * @private
     * @param {string} hash - 原始哈希值
     * @returns {string} 格式化后的指纹
     */
    _formatFingerprint(hash) {
        // 直接截取16位
        return hash.substring(0, 16);
    }

    /**
     * 验证激活码
     * @param {string} activationCode - 用户输入的激活码
     * @returns {Object} 验证结果
     */
    async verifyActivation(activationCode) {
        try {
            // 生成设备指纹
            const deviceFingerprint = this.generateDeviceFingerprint();

            // 检查是否已经激活过
            const existingActivation = this._readActivationFile();
            if (existingActivation && existingActivation.deviceFingerprint === deviceFingerprint) {
                logger.info('使用已保存的激活信息验证');
                return this._verifyWithApi(existingActivation.activationCode, deviceFingerprint);
            }

            // 首次激活或设备变更，调用API验证
            const result = await this._verifyWithApi(activationCode, deviceFingerprint);

            // 如果验证成功，保存激活信息
            if (result.status === 'success') {
                this._saveActivationInfo(activationCode, deviceFingerprint);
            }

            return result;
        } catch (error) {
            logger.error('验证激活码出错:', error);
            return {
                status: 'fail',
                message: error.message || '验证激活码失败'
            };
        }
    }

    /**
     * 调用API验证激活码
     * @private
     * @param {string} activationCode - 激活码
     * @param {string} deviceFingerprint - 设备指纹
     * @returns {Object} 验证结果
     */
    async _verifyWithApi(activationCode, deviceFingerprint) {
        try {
            // 调用激活API
            const response = await axios.post('http://117.72.123.82:8080/system/km/getKm', {
                km: activationCode,
                deviceFingerprint: deviceFingerprint
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            // 判断响应状态
            if (response.status === 200) {
                logger.info('激活成功:', response.data);
                return {
                    status: 'success',
                    message: '激活成功'
                };
            } else {
                logger.error('激活失败:', response.data);
                return {
                    status: 'fail',
                    message: '激活码验证失败'
                };
            }
        } catch (error) {
            logger.error('API调用出错:', error);
            return {
                status: 'fail',
                message: error.response && error.response.data && error.response.data.message || '激活验证服务不可用'
            };
        }
    }

    /**
     * 保存激活信息
     * @private
     * @param {string} activationCode - 激活码
     * @param {string} deviceFingerprint - 设备指纹
     */
    _saveActivationInfo(activationCode, deviceFingerprint) {
        try {
            const activationInfo = {
                activationCode,
                deviceFingerprint,
                activatedAt: new Date().toISOString()
            };

            fs.writeFileSync(this.activationFilePath, JSON.stringify(activationInfo, null, 2), 'utf8');
            logger.info('激活信息已保存');
        } catch (error) {
            logger.error('保存激活信息出错:', error);
        }
    }

    /**
     * 读取激活信息
     * @private
     * @returns {Object|null} 激活信息
     */
    _readActivationFile() {
        try {
            if (fs.existsSync(this.activationFilePath)) {
                const data = fs.readFileSync(this.activationFilePath, 'utf8');
                return JSON.parse(data);
            }
            return null;
        } catch (error) {
            logger.error('读取激活信息出错:', error);
            return null;
        }
    }

    /**
     * 检查是否已激活
     * @returns {Object} 检查结果
     */
    async checkActivation() {
        try {
            // 读取保存的激活信息
            const activationInfo = this._readActivationFile();

            // 如果没有激活信息，返回未激活
            if (!activationInfo) {
                return {
                    status: 'fail',
                    message: '未激活'
                };
            }

            // 生成当前设备指纹
            const currentFingerprint = this.generateDeviceFingerprint();

            // 比较设备指纹是否匹配
            if (activationInfo.deviceFingerprint !== currentFingerprint) {
                logger.warn('设备指纹不匹配');
                return {
                    status: 'fail',
                    message: '设备已变更，需要重新激活'
                };
            }

            // 设备指纹匹配，验证激活码
            return await this._verifyWithApi(activationInfo.activationCode, currentFingerprint);
        } catch (error) {
            logger.error('检查激活状态出错:', error);
            return {
                status: 'fail',
                message: error.message || '检查激活状态失败'
            };
        }
    }
}

EffectService.toString = () => '[class EffectService]';

module.exports = {
    EffectService,
    effectService: new EffectService()
};