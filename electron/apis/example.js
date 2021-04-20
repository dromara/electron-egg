'use strict';

const path = require('path');
const {
  app,
  webContents,
  shell
} = require('electron');

exports.getPath = function () {
  const dir = app.getAppPath();
  return dir;
}

exports.openDir = function (dir = '') {
  if (!dir) {
    return false;
  }
  dir = getElectronPath(dir);
  shell.openItem(dir);
  return true;
}

exports.executeJS = function (str) {
  let jscode = `(()=>{alert('${str}');return 'fromJs:${str}';})()`;
  console.log(jscode);
  return webContents.fromId(1).executeJavaScript(jscode);
}

function getElectronPath(filepath) {
  //filepath = path.resolve(filepath);
  filepath = filepath.replace("resources", "");
  filepath = filepath.replace("app.asar", "");
  filepath = path.normalize(filepath);
  return filepath;
};