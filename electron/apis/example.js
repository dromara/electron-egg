'use strict';

/**
 * egg服务调用electron功能时，建议使用该模块
 */

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const {exec} = require('child_process');
const {app, webContents, shell, dialog} = require('electron');
const AutoLaunchManager = require('../lib/autoLaunch');
const shortcut = require('../lib/shortcut');
const chromeExtension = require('../lib/chromeExtension');
const unzip = require("unzip-crx-3");

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
  const filePaths = dialog.showOpenDialogSync({
    properties: ['openDirectory', 'createDirectory']
  });
  console.log('[example] [selectDir] filePaths:', filePaths);
  if (_.isEmpty(filePaths)) {
    return null
  }

  return filePaths[0];
}

/**
 * 测试用的 - 忽略
 */
exports.testElectronApi = function () {
  const filePaths = dialog.showSaveDialogSync({
    properties: ['openFile', 'multiSelections']
  });
  console.log('[example] [testElectronApi] filePaths:', filePaths);

  return true;
}

/**
 * 显示消息对话框
 */
exports.messageShow = function () {
  dialog.showMessageBoxSync({
    type: 'info', // "none", "info", "error", "question" 或者 "warning"
    title: '自定义标题-message',
    message: '自定义消息内容',
    detail: '其它的额外信息'
  })

  return true;
}

/**
 * 显示消息对话框和确认
 */
exports.messageShowConfirm = function () {
  const res = dialog.showMessageBoxSync({
    type: 'info',
    title: '自定义标题-message',
    message: '自定义消息内容',
    detail: '其它的额外信息',
    cancelId: 1, // 用于取消对话框的按钮的索引
    defaultId: 0, // 设置默认选中的按钮
    buttons: ['确认', '取消'], // 按钮及索引
  })
  console.log('[example] [messageShowConfirm] 结果:', res, res === 0 ? '点击确认按钮' : '点击取消按钮');

  return true;
}

/**
 * 加载扩展程序
 */
exports.loadExtension = async function (crxFile) {
  if (_.isEmpty(crxFile)) {
    return false;
  }

  const extensionId = path.basename(crxFile, '.crx');
  const chromeExtensionDir = chromeExtension.getDirectory();
  const extensionDir = path.join(chromeExtensionDir, extensionId);

  console.log("[api] [example] [loadExtension] extension id:", extensionId);
  unzip(crxFile, extensionDir).then(() => {    
    console.log("[api] [example] [loadExtension] unzip success!");
    chromeExtension.load(extensionId);
  });

  return true;
}

function getElectronPath(filepath) {
  //filepath = path.resolve(filepath);
  filepath = filepath.replace("resources", "");
  filepath = filepath.replace("app.asar", "");
  filepath = path.normalize(filepath);
  return filepath;
};