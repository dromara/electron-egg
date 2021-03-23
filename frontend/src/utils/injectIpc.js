const { ipcRenderer: ipc } = window.require('electron')

/**
 * 异步调用主函数
 * @param ipc
 * @param channel
 * @param param
 * @returns {Promise<unknown>}
 */
const callMain = (ipc, channel, param) => {
  return new Promise((resolve) => {
    // 声明渲染进程函数, 用于主进程函数回调, 返回数据
    // 调用主进程函数
    ipc.send(channel, param)
    ipc.once(channel, (event, result) => {
      resolve(result)
    })
  })
}

export default {
  install(Vue) {
    Vue.prototype.$ipc = ipc // 全局注入ipc
    Vue.prototype.$callMain = (channel, param) => callMain(ipc, channel, param) // 全局注入调用主进程函数的方法
  }
}
