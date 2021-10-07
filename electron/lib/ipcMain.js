const { ipcMain: ipc } = require('electron')
const path = require('path')
const fs = require('fs')
const _ = require('lodash');

/**
 * 发送响应信息给渲染进程
 * @param event
 * @param channel
 * @param data
 * @private
 */
const _echo = (event, channel, data) => {
  console.log('[ipc] [answerRenderer] result: ', {channel, data})
  event.reply(`${channel}`, data)
}

/**
 * 执行主进程函数,并响应渲染进程
 * @param channel
 * @param callback
 */
const answerRenderer = (channel, callback) => {
  ipc.on(channel, async (event, param) => {
    const result = await callback(event, channel, param)
    _echo(event, channel, result)
  })
}

/**
 * get api method name
 * ex.) jsname='user' method='get' => 'user.get'
 * @param {String} jsname
 * @param {String} method
 */
const getApiName = (jsname, method) => {
  return jsname + '.' + method;
}

/**
 * 加载所有的主程序
 */
exports.setup = () => {
  const ipcDir = path.normalize(__dirname + '/../ipc');
  fs.readdirSync(ipcDir).forEach(function (filename) {
    if (path.extname(filename) === '.js' && filename !== 'index.js') {
      const name = path.basename(filename, '.js');
      const fileObj = require(`../ipc/${filename}`);
      _.map(fileObj, function(fn, method) {
        let methodName = getApiName(name, method);
        answerRenderer(methodName, fn);
      });
    }
  })
}
