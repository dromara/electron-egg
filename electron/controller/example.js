'use strict';

const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const is = require('electron-is');
const { exec } = require('child_process');
const unzip = require("unzip-crx-3");
const Controller = require('ee-core').Controller;
const electronApp = require('electron').app;
const {dialog, webContents, shell, BrowserWindow, BrowserView, Notification, powerMonitor, screen, nativeTheme} = require('electron');
const chromeExtension = require('../library/chromeExtension');
const autoLaunchManager = require('../library/autoLaunch');

let myTimer = null;
let browserViewObj = null;
let notificationObj = null;

/**
 * 示例控制器
 * @class
 */
class ExampleController extends Controller {

  /**
   * 所有方法接收两个参数
   * @param args 前端 或 egg，传的参数（单个参数，或参数数组）
   * @param event - IpcMainEvent 文档：https://www.electronjs.org/docs/latest/api/structures/ipc-main-event
   */

   constructor(ctx) {
    super(ctx);

    //this.myTimer = null;

   }

  /**
   * test
   */
  async test (args) {
    let obj = {
      status:'ok'
    }

    // 调用egg的某个api
    // const result = await this.app.curlEgg('post', '/api/v1/example/test2', {name: 'gsx2'});
    // console.log('fffffffffff: ', result);
    //this.app.logger.info('ssssssssssssssssssss');

    return obj;
  }

  /**
   * hello
   */
  hello (args) {
    let newMsg = args + " +1";
    let content = '';
    content = '收到：' + args + '，返回：' + newMsg;

    // let channel = "example.socketMessageStop";
    // event.reply(`${channel}`, '另外的数据');
    return content;
  }

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
    const dir = electronApp.getPath(args.id);
    shell.openPath(dir);
    return true;
  }

  /**
   * 长消息 - 开始
   */
  socketMessageStart (args, event) {
    // 每隔1秒，向前端页面发送消息
    // 用定时器模拟
    
    // 前端ipc频道 channel
    const channel = 'controller.example.socketMessageStart';
    myTimer = setInterval(function(e, c, msg) {
      let timeNow = Date.now();
      let data = msg + ':' + timeNow;
      e.reply(`${c}`, data)
    }, 1000, event, channel, args)

    return '开始了'
  }

  /**
   * 长消息 - 停止
   */
  socketMessageStop () {
    clearInterval(myTimer);
    return '停止了'
  }

  /**
   * 执行js语句
   */
  executeJS (args) {
    let jscode = `(()=>{alert('${args}');return 'fromJs:${args}';})()`;
    return webContents.fromId(1).executeJavaScript(jscode);
  }

  /**
   * 加载视图内容
   */
  loadViewContent (args) {
    let content = null;
    if (args.type == 'html') {
      content = path.join('file://', electronApp.getAppPath(), args.content)
    } else {
      content = args.content;
    }

    browserViewObj = new BrowserView();
    this.app.electron.mainWindow.setBrowserView(browserViewObj)
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
  removeViewContent () {
    this.app.electron.mainWindow.removeBrowserView(browserViewObj);
    return true
  }  

  /**
   * 打开新窗口
   */
  createWindow (args) {
    let content = null;
    if (args.type == 'html') {
      content = path.join('file://', electronApp.getAppPath(), args.content)
    } else {
      content = args.content;
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
   * 加载扩展程序
   */
  async loadExtension (args) {
    const crxFile = args[0];
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

  /**
   * 创建系统通知
   */
  sendNotification (arg, event) {
    const channel = 'controller.example.sendNotification';
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
  initPowerMonitor (arg, event) {
    const channel = 'controller.example.initPowerMonitor';
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
  getScreen (arg) {
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
   * 调用其它程序（exe、bash等可执行程序）
   */
  openSoftware (softName) {
    if (!softName) {
      return false;
    }

    // 资源路径不同
    let softwarePath = '';
    if (electronApp.isPackaged) {
      // 打包后
      softwarePath = path.join(electronApp.getAppPath(), "..", "extraResources", softName);
    } else {
      // 打包前
      softwarePath = path.join(electronApp.getAppPath(), "build", "extraResources", softName);
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
   * 开机启动-开启
   */
  autoLaunch (type) {
    console.log('type:', type);
    let res = {
      type: type,
      status: null
    };
    if (type == 'check') {
      res.status = autoLaunchManager.isEnabled();
    } else if (type == 'open') {
      autoLaunchManager.enable();
      res.status = true;
    } else if (type == 'close') {
      autoLaunchManager.disable();
      res.status = false;
    }

    return res
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


  /**
   * 检查是否有新版本
   */
  checkForUpdater () {
    // const updateConfig = config.get('autoUpdate');
    // if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    //   || (is.linux() && updateConfig.linux)) {
    //   const autoUpdater = require('../lib/autoUpdater');
    //   autoUpdater.checkUpdate();
    // }

    return;
  }

  /**
   * 下载新版本
   */
  downloadApp () {
    // const updateConfig = config.get('autoUpdate');
    // if ((is.windows() && updateConfig.windows) || (is.macOS() && updateConfig.macOS)
    //   || (is.linux() && updateConfig.linux)) {
    //   const autoUpdater = require('../lib/autoUpdater');
    //   autoUpdater.download();
    // }

    return;
  }

}

module.exports = ExampleController;
