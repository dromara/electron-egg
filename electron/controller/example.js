'use strict';

const _ = require('lodash');
const path = require('path');
const is = require('electron-is');
const Controller = require('ee-core').Controller;
const electronApp = require('electron').app;
const {dialog, webContents, shell, BrowserWindow, BrowserView, Notification, powerMonitor, screen, nativeTheme} = require('electron');

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
   * args 前端传的参数
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
}

module.exports = ExampleController;
