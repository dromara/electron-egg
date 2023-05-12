const { ipcRenderer: ipc } = (window.require && window.require('electron')) || window.electron || {};

/**
 * ipc
 * 官方api说明：https://www.electronjs.org/zh/docs/latest/api/ipc-renderer
 * 
 * 属性/方法
 * ipc.invoke(channel, param) - 发送异步消息（invoke/handle 模型）
 * ipc.sendSync(channel, param) - 发送同步消息（send/on 模型）
 * ipc.on(channel, listener) - 监听 channel, 当新消息到达，调用 listener
 * ipc.once(channel, listener) - 添加一次性 listener 函数
 * ipc.removeListener(channel, listener) - 为特定的 channel 从监听队列中删除特定的 listener 监听者
 * ipc.removeAllListeners(channel) - 移除所有的监听器，当指定 channel 时只移除与其相关的所有监听器
 * ipc.send(channel, ...args) - 通过channel向主进程发送异步消息
 * ipc.postMessage(channel, message, [transfer]) - 发送消息到主进程
 * ipc.sendTo(webContentsId, channel, ...args) - 通过 channel 发送消息到带有 webContentsId 的窗口
 * ipc.sendToHost(channel, ...args) - 消息会被发送到 host 页面上的 <webview> 元素
 */

/**
 * 是否为EE环境
 */
const isEE = ipc ? true : false;

export {
  ipc,
  isEE
}
