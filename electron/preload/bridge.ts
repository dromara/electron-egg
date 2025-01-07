/* 
 * 如果启用了上下文隔离，渲染进程无法使用electron的api，
 * 可通过contextBridge 导出api给渲染进程使用
 */

import { type IpcRenderer, contextBridge, ipcRenderer } from 'electron';

// 确保contextBridge.exposeInMainWorld的参数类型正确，这里进行简单的类型定义示例
type ElectronApi = {
    ipcRenderer: IpcRenderer;
};

const ele: ElectronApi = {
    ipcRenderer,
};
contextBridge.exposeInMainWorld('electron', ele);