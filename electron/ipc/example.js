'use strict';

/**
 * 前端(html)调用electron功能时，建议使用该模块
 * 
 * 定义的function 接收三个参数 
 * @param event ipcMain事件对象
 * @param channel 频道
 * @param arg 接收到的消息
 */

const {app, dialog, BrowserWindow, BrowserView, Notification, powerMonitor, screen, nativeTheme} = require('electron');
const path = require('path');
const _ = require('lodash');
const is = require('electron-is');
const config = require('../config');

let myTimer = null;
let browserViewObj = null;
let notificationObj = null;

exports.hello = function (event, channel, arg) {
  let newMsg = arg + " +1"
  let reply = ''
  reply = '收到：' + arg + '，返回：' + newMsg
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
  console.log('[electron] [ipc] [example] [messageShowConfirm] 结果:', res);

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
    y: 170,
    width: 650,
    height: 400
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

/**
 * 打开新窗口
 */
exports.createWindow = function (event, channel, arg) {
  let content = null;
  if (arg.type == 'html') {
    content = path.join('file://', app.getAppPath(), arg.content)
  } else {
    content = arg.content;
  }

  let winObj = new BrowserWindow({
    x: 10,
    y: 10,
    width: 980, 
    height: 650 
  })
  winObj.loadURL(content);

  return winObj.id
}

/**
 * 创建系统通知
 */
exports.sendNotification = function (event, channel, arg) {
  if (!Notification.isSupported()) {
    return '当前系统不支持通知';
  }

  let options = {};
  if (!_.isEmpty(arg.title)) {
    options.title = arg.title;
  }
  if (!_.isEmpty(arg.subtitle)) {
    options.subtitle = arg.subtitle;
  }
  if (!_.isEmpty(arg.body)) {
    options.body = arg.body;
  }
  if (!_.isEmpty(arg.silent)) {
    options.silent = arg.silent;
  }

  notificationObj = new Notification(options);

  if (arg.clickEvent) {
    notificationObj.on('click', (e) => {
      let data = {
        type: 'click',
        msg: '您点击了通知消息'
      }
      event.reply(`${channel}`, data)
    });
  }

  if (arg.closeEvent) {
    notificationObj.on('close', (e) => {
      let data = {
        type: 'close',
        msg: '您关闭了通知消息'
      }
      event.reply(`${channel}`, data)
    });
  }

  notificationObj.show();

  return true
}

/**
 * 电源监控
 */
exports.initPowerMonitor = function (event, channel, arg) {
  powerMonitor.on('on-ac', (e) => {
    let data = {
      type: 'on-ac',
      msg: '接入了电源'
    }
    event.reply(`${channel}`, data)
  });

  powerMonitor.on('on-battery', (e) => {
    let data = {
      type: 'on-battery',
      msg: '使用电池中'
    }
    event.reply(`${channel}`, data)
  });

  powerMonitor.on('lock-screen', (e) => {
    let data = {
      type: 'lock-screen',
      msg: '锁屏了'
    }
    event.reply(`${channel}`, data)
  });

  powerMonitor.on('unlock-screen', (e) => {
    let data = {
      type: 'unlock-screen',
      msg: '解锁了'
    }
    event.reply(`${channel}`, data)
  });

  return true
}

/**
 * 获取屏幕信息
 */
exports.getScreen = function (event, channel, arg) {

  let data = [];
  let res = {};
  if (arg == 0) {
    let res = screen.getCursorScreenPoint();
    data = [
      {
        title: '横坐标',
        desc: res.x
      },
      {
        title: '纵坐标',
        desc: res.y
      },
    ]
    
    return data;
  }
  if (arg == 1) {
    res = screen.getPrimaryDisplay();
  }
  if (arg == 2) {
    let resArr = screen.getAllDisplays();
    // 数组，只取一个吧
    res = resArr[0];
  }
  // console.log('[electron] [ipc] [example] [getScreen] res:', res);
  data = [
    {
      title: '分辨率',
      desc: res.bounds.width + ' x ' + res.bounds.height
    },
    {
      title: '单色显示器',
      desc: res.monochrome ? '是' : '否'
    },
    {
      title: '色深',
      desc: res. colorDepth
    },
    {
      title: '色域',
      desc: res.colorSpace
    },
    {
      title: 'scaleFactor',
      desc: res.scaleFactor
    },
    {
      title: '加速器',
      desc: res.accelerometerSupport
    },
    {
      title: '触控',
      desc: res.touchSupport == 'unknown' ? '不支持' : '支持'
    },
  ]

  return data;
}

/**
 * 获取系统主题
 */
exports.getTheme = function (event, channel, arg) {
  let theme = 'system';
  if (nativeTheme.shouldUseHighContrastColors) {
    theme = 'light';
  } else if (nativeTheme.shouldUseInvertedColorScheme) {
    theme = 'dark';
  }

  return theme;
}

/**
 * 设置系统主题
 */
exports.setTheme = function (event, channel, arg) {

  // TODO 好像没有什么明显效果
  nativeTheme.themeSource = arg;

  return arg;
}

/**
 * 检查是否有新版本
 */
exports.checkForUpdater = function (event, channel, arg) {
  const updateConfig = config.get('autoUpdate');
  if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    || (is.linux() && updateConfig.linux)) {
    const autoUpdater = require('../lib/autoUpdater');
    autoUpdater.checkUpdate();
  }

  return;
}