'use strict';

const Controller = require('ee-core').Controller;
const { app } = require('electron');

class ExampleController extends Controller {

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
}

module.exports = ExampleController;
