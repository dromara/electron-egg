'use strict';

const path = require('path');
const {
  app,
  webContents,
  shell,
  globalShortcut
} = require('electron');
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

exports.setShortcut = function (shortcutStr = "") {
  if (!shortcutStr || shortcutStr == "") {
    return false;
  }
  shortcut.register(shortcutStr, true, function (){
    MAIN_WINDOW.show()
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