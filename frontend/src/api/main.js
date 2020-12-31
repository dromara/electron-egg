import request from '@/utils/request'
// import storage from 'store'

const mainApi = {
  outApi: '/api/v1/outApi',
  openDir: '/api/v1/example/openLocalDir',
  uploadFile: '/api/v1/example/uploadFile',
  autoLaunchEnable: '/api/v1/setting/autoLaunchEnable',
  autoLaunchDisable: '/api/v1/setting/autoLaunchDisable',
  autoLaunchIsEnabled: '/api/v1/setting/autoLaunchIsEnabled'
}

/**
 * outApi
 */
// export function outApi (parameter) {
//   parameter.data.token = storage.get(ACCESS_TOKEN)
//   parameter.data.uid = storage.get(USER_INFO) ? storage.get(USER_INFO).uid : ''
//   return request({
//     url: mainApi.outApi,
//     method: 'post',
//     data: parameter
//   })
// }

/**
 * openDir
 */
export function openDir (parameter) {
  return request({
    url: mainApi.openDir,
    method: 'post',
    data: parameter
  })
}

/**
 * uploadFile
 */
export function uploadFile (parameter) {
  return request({
    url: mainApi.uploadFile,
    method: 'post',
    data: parameter
  })
}

/**
 * autoLaunchEnable
 */
export function autoLaunchEnable (parameter) {
  return request({
    url: mainApi.autoLaunchEnable,
    method: 'post',
    data: parameter
  })
}

/**
 * autoLaunchDisable
 */
export function autoLaunchDisable (parameter) {
  return request({
    url: mainApi.autoLaunchDisable,
    method: 'post',
    data: parameter
  })
}

/**
 * autoLaunchIsEnabled
 */
export function autoLaunchIsEnabled (parameter) {
  return request({
    url: mainApi.autoLaunchIsEnabled,
    method: 'post',
    data: parameter
  })
}