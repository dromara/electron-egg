import request from '@/utils/request'

const eggApiroute = {
  openDir: '/api/example/openLocalDir',
  uploadFile: '/api/example/uploadFile',
  executeJS: '/api/example/executeJS',
  setShortcut: '/api/example/setShortcut',
  autoLaunchEnable: '/api/example/autoLaunchEnable',
  autoLaunchDisable: '/api/example/autoLaunchDisable',
  autoLaunchIsEnabled: '/api/example/autoLaunchIsEnabled',
  openSoftware: '/api/example/openSoftware',
  selectFileDir: '/api/example/selectFileDir',
  messageShow: '/api/example/messageShow',
  messageShowConfirm: '/api/example/messageShowConfirm',
  dbOperation: '/api/example/dbOperation',
  testElectronApi: '/api/example/testElectronApi',
}

const ipcApiRoute = {
  messageShow: 'controller.example.messageShow',
  messageShowConfirm: 'controller.example.messageShowConfirm',
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