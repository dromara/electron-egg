'use strict';

const _ = require('lodash');
const path = require('path');
const { Controller } = require('ee-core');
const {
  app: electronApp, dialog, shell, Notification, 
  powerMonitor, screen, nativeTheme
} = require('electron');
const Conf = require('ee-core/config');
const Ps = require('ee-core/ps');

/**
 * 操作系统 - 功能demo
 * @class
 */
class OsController extends Controller {

  constructor(ctx) {
    super(ctx);
  }

  /**
   * 所有方法接收两个参数
   * @param args 前端传的参数
   * @param event - ipc通信时才有值。详情见：控制器文档
   */

  /**
   * 消息提示对话框
   */
  messageShow () {
    dialog.showMessageBoxSync({
      type: 'info', // "none", "info", "error", "question" 或者 "warning"
      title: '自定义标题-message',
      message: '自定义消息内容',
      detail: '其它的额外信息'
    })
  
    return '打开了消息框';
  }

  /**
   * 消息提示与确认对话框
   */
  messageShowConfirm () {
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
  
    return data;
  }

  /**
   * 选择目录
   */
  selectFolder () {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openDirectory', 'createDirectory']
    });

    if (_.isEmpty(filePaths)) {
      return null
    }

    return filePaths[0];
  } 

  /**
   * 打开目录
   */
  openDirectory (args) {
    if (!args.id) {
      return false;
    }
    let dir = '';
    if (path.isAbsolute(args.id)) {
      dir = args.id;
    } else {
      dir = electronApp.getPath(args.id);
    }

    shell.openPath(dir);
    return true;
  }

  /**
   * 加载视图内容
   */
  loadViewContent (args) {
    const { type, content } = args;
    let contentUrl = content;
    if (type == 'html') {
      contentUrl = path.join('file://', electronApp.getAppPath(), content);
    }

    this.service.os.createBrowserView(contentUrl);

    return true
  }

  /**
   * 移除视图内容
   */
  removeViewContent () {
   
    this.service.os.removeBrowserView();

    return true
  }  

  /**
   * 打开新窗口
   */
  createWindow (args) {
    const { type, content, windowName, windowTitle } = args;
    let contentUrl = null;
    if (type == 'html') {
      contentUrl = path.join('file://', electronApp.getAppPath(), content)
    } else if (type == 'web') {
      contentUrl = content;
    } else if (type == 'vue') {
      let addr = 'http://localhost:8080'
      if (Ps.isProd()) {
        const mainServer = Conf.getValue('mainServer');
        addr = mainServer.protocol + mainServer.host + ':' + mainServer.port;
      }

      contentUrl = addr + content;
    } else {
      // some
    }

    console.log('contentUrl: ', contentUrl);
    const addonWindow = this.app.addon.window;
    let opt = {
      title: windowTitle
    }
    const win = addonWindow.create(windowName, opt);
    const winContentsId = win.webContents.id;

    // load page
    win.loadURL(contentUrl);

    return winContentsId;
  }
  
  /**
   * 获取窗口contents id
   */
  getWCid (args) {
    const addonWindow = this.app.addon.window;

    // 主窗口的name默认是main，其它窗口name开发者自己定义
    const name = args;
    const id = addonWindow.getWCid(name);

    return id;
  }

  /**
   * 加载扩展程序
   */
  // async loadExtension (args) {
  //   const crxFile = args[0];
  //   if (_.isEmpty(crxFile)) {
  //     return false;
  //   }
  //   const extensionId = path.basename(crxFile, '.crx');
  //   const chromeExtensionDir = chromeExtension.getDirectory();
  //   const extensionDir = path.join(chromeExtensionDir, extensionId);

  //   Log.info("[api] [example] [loadExtension] extension id:", extensionId);
  //   unzip(crxFile, extensionDir).then(() => {    
  //     Log.info("[api] [example] [loadExtension] unzip success!");
  //     chromeExtension.load(extensionId);
  //   });

  //   return true;
  // }

  /**
   * 创建系统通知
   */
  sendNotification (args, event) {
    const { title, subtitle, body, silent} = args;

    if (!Notification.isSupported()) {
      return '当前系统不支持通知';
    }

    let options = {};
    if (!_.isEmpty(title)) {
      options.title = title;
    }
    if (!_.isEmpty(subtitle)) {
      options.subtitle = subtitle;
    }
    if (!_.isEmpty(body)) {
      options.body = body;
    }
    if (!_.isEmpty(silent)) {
      options.silent = silent;
    }

    this.service.os.createNotification(options, event);

    return true
  }  

  /**
   * 电源监控
   */
  initPowerMonitor (args, event) {
    const channel = 'controller.os.initPowerMonitor';
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
  getScreen (args) {
    let data = [];
    let res = {};
    if (args == 0) {
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
    if (args == 1) {
      res = screen.getPrimaryDisplay();
    }
    if (args == 2) {
      let resArr = screen.getAllDisplays();
      // 数组，只取一个吧
      res = resArr[0];
    }
    // Log.info('[electron] [ipc] [example] [getScreen] res:', res);
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
  getTheme () {
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
  setTheme (args) {

    // TODO 好像没有什么明显效果
    nativeTheme.themeSource = args;

    return args;
  }  
}

OsController.toString = () => '[class OsController]';
module.exports = OsController;  