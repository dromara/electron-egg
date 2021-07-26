'use strict';

const path = require('path');
const {app, webContents, shell} = require('electron');
const AutoLaunchManager = require('../lib/autoLaunch');
const shortcut = require('../lib/shortcut');

exports.getPath = function () {
  const dir = app.getAppPath();
  return dir;
}

exports.openDir = function (dir = '') {
  if (!dir) {
    return false;
  }
  dir = getElectronPath(dir);
  shell.openPath(dir);
  return true;
}

exports.executeJS = function (str) {
  let jscode = `(()=>{alert('${str}');return 'fromJs:${str}';})()`;
  console.log(jscode);
  return webContents.fromId(1).executeJavaScript(jscode);
}

exports.setShortcut = function (shortcutObj) {
  shortcut.register(shortcutObj, true, function (){
    MAIN_WINDOW.hide()
  });
  
  return true;
}

exports.autoLaunchEnable = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const enable = autoLaunchManager.enable()
  return enable
}

exports.autoLaunchDisable = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const disable = autoLaunchManager.disable()
  return disable
}

exports.autoLaunchIsEnabled = function () {
  const autoLaunchManager = new AutoLaunchManager()
  const isEnable = autoLaunchManager.isEnabled()
  return isEnable
}

exports.openSoftware = function (softName = '') {
  if (!softName) {
    return false;
  }

  let powershellPath = path.join(app.getAppPath(), "..", "tmp", softName);
  console.log(powershellPath);

  return true;
}

function getElectronPath(filepath) {
  //filepath = path.resolve(filepath);
  filepath = filepath.replace("resources", "");
  filepath = filepath.replace("app.asar", "");
  filepath = path.normalize(filepath);
  return filepath;
};