import request from '@/utils/request'

const eggApiroute = {
  uploadFile: '/api/example/uploadFile',
  autoLaunchEnable: '/api/example/autoLaunchEnable',
  autoLaunchDisable: '/api/example/autoLaunchDisable',
  autoLaunchIsEnabled: '/api/example/autoLaunchIsEnabled',
  openSoftware: '/api/example/openSoftware',
  messageShow: '/api/example/messageShow',
  messageShowConfirm: '/api/example/messageShowConfirm',
  dbOperation: '/api/example/dbOperation',
  testElectronApi: '/api/example/testElectronApi',
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
  ipcApiRoute
}