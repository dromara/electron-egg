'use strict';

/**
 * 前端(html)调用electron功能时，建议使用该模块
 * 
 * 定义的function 接收三个参数 
 * @param event ipcMain事件对象
 * @param channel 频道
 * @param arg 接收到的消息
 */

const {app, dialog, BrowserWindow, BrowserView} = require('electron');
const path = require('path');

let myTimer = null;
let browserViewObj = null;

exports.hello = function (event, channel, msg) {
  let newMsg = msg + " +1"
  let reply = ''
  reply = '收到：' + msg + '，返回：' + newMsg
  return reply
}

exports.messageShow = function (event, channel, arg) {
  dialog.showMessageBoxSync({
    type: 'info', // "none", "info", "error", "question" 或者 "warning"
    title: '自定义标题-message',
    message: '自定义消息内容',
    detail: '其它的额外信息'
  })

  return '打开了消息框';
}

exports.messageShowConfirm = function (event, channel, arg) {
  const res = dialog.showMessageBoxSync({
    type: 'info',
    title: '自定义标题-message',
    message: '自定义消息内容',
    detail: '其它的额外信息',
    cancelId: 1, // 用于取消对话框的按钮的索引
    defaultId: 0, // 设置默认选中的按钮
    buttons: ['确认', '取消'], // 按钮及索引
  })
  let data = (res === 0) ? '点击确认按钮' : '点击取消按钮';
  console.log('[electron] [ipc] [example] [messageShowConfirm] 结果:', res, );

  return data;
}

/**
 * 长消息 - 开始
 */
exports.socketMessageStart = function (event, channel, arg) {
  // 每隔1秒，向前端页面发送消息
  // 用定时器模拟
  myTimer = setInterval(function(e, c, msg) {
    let timeNow = Date.now();
    let data = msg + ':' + timeNow;
    e.reply(`${c}`, data)
  }, 1000, event, channel, arg)

  return '开始了'
}

/**
 * 长消息 - 停止
 */
exports.socketMessageStop = function () {
  clearInterval(myTimer);
  return '停止了'
}

/**
 * 加载视图内容
 */
exports.loadViewContent = function (event, channel, arg) {
  let content = null;
  if (arg.type == 'html') {
    content = path.join('file://', app.getAppPath(), arg.content)
  } else {
    content = arg.content;
  }
  
  browserViewObj = new BrowserView();
  MAIN_WINDOW.setBrowserView(browserViewObj)
  browserViewObj.setBounds({
    x: 300,
    y: 80,
    width: 650,
    height: 480
  });
  browserViewObj.webContents.loadURL(content);
  return true
}

/**
 * 移除视图内容
 */
exports.removeViewContent = function () {
  MAIN_WINDOW.removeBrowserView(browserViewObj);
  return true
}