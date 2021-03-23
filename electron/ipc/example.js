const { answerRenderer } = require('./index')

answerRenderer('example.hello', async (msg) => {
  let newMsg = msg + " +1"
  let reply = ''
  reply = '收到：' + msg + '，返回：' + newMsg
  return reply
})
