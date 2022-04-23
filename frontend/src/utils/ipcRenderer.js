const { ipcRenderer: ipc } = window.require && window.require('electron') || {}

/**
 * （将废弃，请使用 $ipcInvoke 代替）异步调用主函数
 * @param ipc
 * @param channel
 * @param param
 * @returns {Promise<unknown>}
 */
const call = (ipc, channel, param) => {
  return new Promise((resolve) => {
    ipc.once(channel, (event, result) => {
      console.log('[ipcRenderer] [call] result:', result)
      resolve(result)
    })
    ipc.send(channel, param)
  })
}

/**
 * 发送异步消息（invoke/handle 模型）
 * @param ipc
 * @param channel
 * @param param
 * @returns {Promise}
 */
const invoke = (ipc, channel, param) => {
  const message = ipc.invoke(channel, param);
  return message;
}

/**
 * 发送同步消息（send/on 模型）
 * @param ipc
 * @param channel
 * @param param
 * @returns {Any}
 */
const sendSync = (ipc, channel, param) => {
  const message = ipc.sendSync(channel, param);
  return message;
}

export default {
  install(Vue) {
    Vue.prototype.$ipc = ipc // 全局注入ipc
    Vue.prototype.$ipcCall = (channel, param) => call(ipc, channel, param)
    Vue.prototype.$ipcInvoke = (channel, param) => invoke(ipc, channel, param)
    Vue.prototype.$ipcSendSync = (channel, param) => sendSync(ipc, channel, param)
  }
}
