const { answerRenderer } = require('./index')

answerRenderer('example.test', async (name) => {
  const luckNum = (Math.random()*1000).toFixed()
  return `${name}, 你的幸运数字是：${luckNum}`
})
