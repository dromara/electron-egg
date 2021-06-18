const { ipcMain: ipc } = require('electron')
const path = require('path')
const fs = require('fs')

/**
 * 发送响应信息给渲染进程
 * @param event
 * @param channel
 * @param data
 * @private
 */
const _echo = (event, channel, data) => {
  event.reply(`${channel}`, data)
}

/**
 * 执行主进程函数,并响应渲染进程
 * @param channel
 * @param callback
 */
module.exports.answerRenderer = (channel, callback) => {
  ipc.on(channel, async (event, param) => {
    const result = await callback(param)
    _echo(event, channel, result)
  })
}

/**
 * 加载所有的主程序
 */
module.exports.setup = () => {
  const ipcDir = path.normalize(__dirname + '/')

  fs.readdirSync(ipcDir).forEach(function (filename) {
    if (path.extname(filename) === '.js' && filename !== 'index.js') {
      const filePath = path.join(ipcDir, filename)
      require(filePath)
    }
  })
}
