import request from '@/utils/request'

const ipcApiRoute = {
  test: 'controller.example.test',
  messageShow: 'controller.example.messageShow',
  messageShowConfirm: 'controller.example.messageShowConfirm',
  selectFolder: 'controller.example.selectFolder',
  openDirectory: 'controller.example.openDirectory',
  socketMessageStart: 'controller.example.socketMessageStart',
  socketMessageStop: 'controller.example.socketMessageStop',
  hello: 'controller.example.hello',
  executeJS: 'controller.example.executeJS',
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
  uploadFile: 'controller.example.uploadFile',
}

const specialIpcRoute = {
  appUpdater: 'app.updater' // 此频道在后端也有相同定义
}

/**
 * 访问http服务
 */
const requestHttp = (uri, parameter) => {
  const url = uri.split('.').join('/');
  console.log('url:', url);
  return request({
    url: url,
    method: 'post', 
    data: parameter, // body
    params: {}, // URL 参数
  })
}

export {
  ipcApiRoute,
  specialIpcRoute,
  requestHttp
}