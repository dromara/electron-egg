'use strict'
const { app, dialog } = require('electron')
const AutoLaunchManager = require('../lib/AutoLaunch')

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


exports.appExit = function () {
  app.exit()
}

exports.appRelaunch = function () {
  app.relaunch()
  app.exit()
}


/**
 * 选择本地文件夹
 * @param title 弹出框的标题
 * @return {Promise<*>}
 */
exports.choiceFolder = async function (title = '') {
  return await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: title
  })
}

/**
 * 选择本地文件
 * @param title 弹出框的标题
 * @param extensions 后缀名集合 e.g: ['exe','txt','png']
 * @return {Promise<*>}
 */
exports.choiceFile = async function (title = '', extensions = []) {
  return await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{
      extensions: extensions
    }],
    title: title
  })
}
