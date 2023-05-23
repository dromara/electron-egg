const { app, session } = require('electron');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const Log = require('ee-core/log');

/**
 * 扩展插件 （electron自身对该功能并不完全支持，官方也不建议使用）
 * @class
 */
class ChromeExtensionAddon {

  constructor() {
  }

  /**
   * 创建
   */
  async create () {
    Log.info('[addon:chromeExtension] load');

    const extensionIds = this.getAllIds();
    for (let i = 0; i < extensionIds.length; i++) {
      await this.load(extensionIds[i]);
    }
  }

  /**
   * 获取扩展id列表（crx解压后的目录名，即是该扩展的id）
   */
  getAllIds () {
    const extendsionDir = this.getDirectory();
    const ids = this.getDirs(extendsionDir);

    return ids;
  }

  /**
   * 扩展所在目录
   */
  getDirectory () {
    let extensionDirPath = '';
    let variablePath = 'build'; // 打包前路径
    if (app.isPackaged) {
      variablePath = '..'; // 打包后路径
    }
    extensionDirPath = path.join(app.getAppPath(), variablePath, "extraResources", "chromeExtension");
  
    return extensionDirPath;
  }

  /**
   * 加载扩展
   */
  async load (extensionId = '') {
    if (_.isEmpty(extensionId)) {
      return false
    }
    
    try {
      const extensionPath = path.join(this.getDirectory(), extensionId);
      Log.info('[addon:chromeExtension] extensionPath:', extensionPath);
      await session.defaultSession.loadExtension(extensionPath, { allowFileAccess: true });
    } catch (e) {
      Log.info('[addon:chromeExtension] load extension error extensionId:%s, errorInfo:%s', extensionId, e.toString());
      return false
    }
  
    return true
  }
  
  /**
   * 获取目录下所有文件夹
   */
  getDirs(dir) {
    if (!dir) {
      return [];
    }

    const components = [];
    const files = fs.readdirSync(dir);
    files.forEach(function(item, index) {
      const stat = fs.lstatSync(dir + '/' + item);
      if (stat.isDirectory() === true) {
        components.push(item);
      }
    });

    return components;
  };
}

ChromeExtensionAddon.toString = () => '[class ChromeExtensionAddon]';
module.exports = ChromeExtensionAddon;