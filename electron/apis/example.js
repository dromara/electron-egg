'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const {exec} = require('child_process');
const {app, webContents, shell, dialog} = require('electron');
const AutoLaunchManager = require('../lib/autoLaunch');
const shortcut = require('../lib/shortcut');
const eLogger = require('../lib/eLogger').get();

/**
 * app根目录
 */
exports.getPath = function () {
  const dir = app.getAppPath();
  return dir;
}

/**
 * 打开目录
 */
exports.openDir = function (dir = '') {
  if (!dir) {
    return false;
  }
  dir = getElectronPath(dir);
  shell.openPath(dir);
  return true;
}

/**
 * 执行js
 */
exports.executeJS = function (str) {
  let jscode = `(()=>{alert('${str}');return 'fromJs:${str}';})()`;
  console.log(jscode);
  return webContents.fromId(1).executeJavaScript(jscode);
}

/**
 * 快捷键-注册
 */
exports.setShortcut = function (shortcutObj) {
  shortcut.register(shortcutObj, true, function (){
    MAIN_WINDOW.hide()
  });
  
  return true;
}

/**
 * 开机启动-开启
 */
exports.autoLaunchEnable = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const enable = autoLaunchManager.enable()
  return enable
}

/**
 * 开机启动-关闭
 */
exports.autoLaunchDisable = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const disable = autoLaunchManager.disable()
  return disable
}

/**
 * 开机启动-是否开启
 */
exports.autoLaunchIsEnabled = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const isEnable = autoLaunchManager.isEnabled()
  return isEnable
}

/**
 * 调用其它程序（exe、bash等可执行程序）
 */
exports.openSoftware = function (softName = '') {
  if (!softName) {
    return false;
  }

  // 资源路径不同
  let softwarePath = '';
  if (app.isPackaged) {
    // 打包后
    softwarePath = path.join(app.getAppPath(), "..", "extraResources", softName);
  } else {
    // 打包前
    softwarePath = path.join(app.getAppPath(), "build", "extraResources", softName);
  }
  // 检查程序是否存在
  if (!fs.existsSync(softwarePath)) {
    return false;
  }
  // 命令行字符串 并 执行
  let cmdStr = 'start ' + softwarePath;
  exec(cmdStr);

  return true;
}

/**
 * 选择目录
 */
 exports.selectDir = function () {
  var filePaths = dialog.showOpenDialogSync({
    properties: ['openDirectory', 'createDirectory']
  });
  console.log('[example] [selectDir] filePaths:', filePaths);
  if (_.isEmpty(filePaths)) {
    return null
  }

  return filePaths[0];
}

function getElectronPath(filepath) {
  //filepath = path.resolve(filepath);
  filepath = filepath.replace("resources", "");
  filepath = filepath.replace("app.asar", "");
  filepath = path.normalize(filepath);
  return filepath;
};