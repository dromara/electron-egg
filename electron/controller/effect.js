'use strict';

const { dialog } = require('electron');
const { getMainWindow } = require('ee-core/electron');
const { effectService } = require('../service/effect');

/**
 * effect - demo
 * @class
 */
class EffectController {

    constructor() {
        this.service = effectService;
    }

    /**
     * select file
     */
    selectFile() {
        const filePaths = dialog.showOpenDialogSync({
            properties: ['openFile']
        });

        if (!filePaths) {
            return null
        }

        return filePaths[0];
    }

    /**
     * login window
     */
    loginWindow(args) {
        const { width, height } = args;
        const win = getMainWindow();

        const size = {
            width: width || 400,
            height: height || 300
        }
        win.setSize(size.width, size.height);
        win.setResizable(true);
        win.center();
        win.show();
        win.focus();
    }

    /**
     * restore window
     */
    restoreWindow(args) {
        const { width, height } = args;
        const win = getMainWindow();

        const size = {
            width: width || 980,
            height: height || 650
        }
        win.setSize(size.width, size.height);
        win.setResizable(true);
        win.center();
        win.show();
        win.focus();
    }

    /**
     * 生成设备指纹
     * @returns {string} 设备指纹
     */
    generateDeviceFingerprint() {
        try {
            const fingerprint = this.service.generateDeviceFingerprint();
            return {
                status: 'success',
                data: fingerprint
            };
        } catch (error) {
            console.error('生成设备指纹出错:', error);
            return {
                status: 'fail',
                message: error.message || '生成设备指纹失败'
            };
        }
    }

    /**
     * 检查是否已激活
     * @returns {Object} 检查结果
     */
    async checkActivation() {
        try {
            // 调用服务进行验证
            const result = await this.service.checkActivation();
            return result;
        } catch (error) {
            console.error('检查激活信息出错:', error);
            return {
                status: 'fail',
                message: error.message || '检查激活信息失败'
            };
        }
    }

    /**
     * 验证激活码
     * @param {Object} args - 包含激活码的参数对象
     * @returns {Object} 验证结果
     */
    async verifyActivation(args) {
        try {
            const { activationCode } = args;

            if (!activationCode) {
                return {
                    status: 'fail',
                    message: '激活码不能为空'
                };
            }

            // 调用服务层进行验证
            const result = await this.service.verifyActivation(activationCode);
            return result;
        } catch (error) {
            console.error('验证激活码出错:', error);
            return {
                status: 'fail',
                message: error.message || '验证激活码失败'
            };
        }
    }
}
EffectController.toString = () => '[class EffectController]';

module.exports = EffectController;