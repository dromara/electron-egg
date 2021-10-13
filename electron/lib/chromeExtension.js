'use strict';

const { app, session } = require('electron');
const _ = require('lodash');
const fs = require('fs');
const path = require('path')
const eLogger = require('./eLogger').get();

/**
 * 安装模块
 */
exports.setup = async function () {
  console.log('[electron-lib-chromeExtension] [setup]');
  const extensionIds = this.getAllIds();
  
  for (let i = 0; i < extensionIds.length; i++) {
    await this.load(extensionIds[i]);
  }
}

/**
 * 获取扩展id列表（crx解压后的目录名，即是该扩展的id）
 */
exports.getAllIds = function () {
  const extendsionDir = this.getDirectory();
  const ids = getDirs(extendsionDir);

  return ids;
}

/**
 * 扩展所在目录
 */
exports.getDirectory = function () {
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
exports.load = async function (extensionId = '') {
  if (_.isEmpty(extensionId)) {
    return false
  }
  
  try {
    const extensionPath = path.join(this.getDirectory(), extensionId);
    console.log('[chromeExtension] [load] extensionPath:', extensionPath);
    await session.defaultSession.loadExtension(extensionPath, { allowFileAccess: true });
  } catch (e) {
    eLogger.error('[chromeExtension] [load] load extension error extensionId:%s, errorInfo:%s', extensionId, e.toString());
    return false
  }

  return true
}

/*
 * 获取目录下所有文件夹
 */
function getDirs(dir) {
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