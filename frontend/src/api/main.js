import request from '@/utils/request'
// import storage from 'store'

const mainApi = {
  outApi: '/api/v1/outApi',
  openDir: '/api/v1/example/openLocalDir',
  uploadFile: '/api/v1/example/uploadFile',
  executeJS: '/api/v1/example/executeJS',
  autoLaunchEnable: '/api/v1/setting/autoLaunchEnable',
  autoLaunchDisable: '/api/v1/setting/autoLaunchDisable',
  autoLaunchIsEnabled: '/api/v1/setting/autoLaunchIsEnabled'
}

/**
 * outApi
 */
export function outApi (uri, parameter) {
  return request({
    url: mainApi[uri],
    method: 'post',
    data: parameter
  })
}

/**
 * local api
 */
export function localApi (uri, parameter) {
  return request({
    url: mainApi[uri],
    method: 'post',
    data: parameter
  })
}

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
 * executeJS
 */
export function executeJS (parameter) {
  return request({
    url: mainApi.executeJS,
    method: 'post',
    data: parameter
  })
}