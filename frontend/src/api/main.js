import storage from 'store2'
import request from '@/utils/request'

/**
 * 路由定义（主进程与渲染进程通信频道定义）
 */
const ipcApiRoute = {
  test: 'controller.example.test',
  messageShow: 'controller.example.messageShow',
  messageShowConfirm: 'controller.example.messageShowConfirm',
  selectFolder: 'controller.example.selectFolder',
  openDirectory: 'controller.example.openDirectory',
  loadViewContent: 'controller.example.loadViewContent',
  removeViewContent: 'controller.example.removeViewContent',
  createWindow: 'controller.example.createWindow',
  sendNotification: 'controller.example.sendNotification',
  initPowerMonitor: 'controller.example.initPowerMonitor',
  getScreen: 'controller.example.getScreen',
  openSoftware: 'controller.example.openSoftware', 
  autoLaunch: 'controller.example.autoLaunch',
  setTheme: 'controller.example.setTheme',
  getTheme: 'controller.example.getTheme',
  checkForUpdater: 'controller.example.checkForUpdater',
  downloadApp: 'controller.example.downloadApp',
  dbOperation: 'controller.example.dbOperation',
  sqlitedbOperation: 'controller.example.sqlitedbOperation',
  uploadFile: 'controller.example.uploadFile',
  checkHttpServer: 'controller.example.checkHttpServer',
  doHttpRequest: 'controller.example.doHttpRequest',
  doSocketRequest: 'controller.example.doSocketRequest',
  ipcInvokeMsg: 'controller.example.ipcInvokeMsg',
  ipcSendSyncMsg: 'controller.example.ipcSendSyncMsg',
  ipcSendMsg: 'controller.example.ipcSendMsg',
  getWCid: 'controller.example.getWCid',
  startJavaServer: 'controller.example.startJavaServer',
  closeJavaServer: 'controller.example.closeJavaServer',
  someJob: 'controller.example.someJob',
  timerJobProgress: 'controller.example.timerJobProgress',
  hello: 'controller.example.hello',
}

/**
 * 特殊的路由（频道）定义
 */
const specialIpcRoute = {
  appUpdater: 'app.updater', // 此频道在后端也有相同定义
  window1ToWindow2: 'window1-to-window2', // 窗口之间通信
  window2ToWindow1: 'window2-to-window1', // 窗口之间通信
}

/**
 * 访问内置http服务
 */
const requestHttp = (uri, parameter) => {
  // url转换
  const config = storage.get('httpServiceConfig');
  const host = config.server || 'http://localhost:7071';
  let url = uri.split('.').join('/');
  url = host + '/' + url;
  console.log('url:', url);
  return request({
    url: url,
    method: 'post', 
    data: parameter, // body
    params: {}, // URL 参数
    timeout: 60000,
  })
}

export {
  ipcApiRoute,
  specialIpcRoute,
  requestHttp,
}
