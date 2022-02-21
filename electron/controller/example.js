'use strict';

const _ = require('lodash');
const Controller = require('ee-core').Controller;
const {app, dialog, BrowserWindow, BrowserView, Notification, powerMonitor, screen, nativeTheme} = require('electron');

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
  hello (args, event) {
    let newMsg = args + " +1";
    let reply = '';
    reply = '收到：' + args + '，返回：' + newMsg;

    // let channel = "example.socketMessageStop";
    // event.reply(`${channel}`, '另外的数据');
    return reply;
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
  selectDir () {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openDirectory', 'createDirectory']
    });
    console.log('[example] [selectDir] filePaths:', filePaths);
    if (_.isEmpty(filePaths)) {
      return null
    }

    return filePaths[0];
  }  
}

module.exports = ExampleController;
