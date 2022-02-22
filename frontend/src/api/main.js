import request from '@/utils/request'

const eggApiroute = {
  uploadFile: '/api/example/uploadFile',
  openSoftware: '/api/example/openSoftware',
  messageShow: '/api/example/messageShow',
  messageShowConfirm: '/api/example/messageShowConfirm',
  dbOperation: '/api/example/dbOperation',
  test1: '/api/example/test1',
}

const ipcApiRoute = {
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
}

const specialIpcRoute = {
  appUpdater: 'app.updater' // 此频道在后端也有相同定义
}

/**
 * 访问egg api
 */
const requestEggApi = (uri, parameter) => {
  return request({
    url: eggApiroute[uri],
    method: 'post',
    data: parameter
  })
}

export {
  requestEggApi,
  ipcApiRoute,
  specialIpcRoute
}