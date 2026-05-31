/* 
 * 如果启用了上下文隔离，渲染进程无法使用electron的api，
 * 可通过contextBridge 导出api给渲染进程使用
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
})
