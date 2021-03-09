/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/',
    component: { template: '<div><router-view /></div>' },
    children: [
      {
        path: 'fileOpenDir',
        name: 'FileOpenDir',
        component: () => import('@/views/file/OpenDir')
      },
      {
        path: 'uploadFile',
        name: 'UploadFile',
        component: () => import('@/views/file/UploadFile')
      },
      {
        path: 'ipcExample',
        name: 'IpcExample',
        component: () => import('@/views/file/IpcExample')
      },
      {
        path: 'setting',
        name: 'Setting',
        component: () => import('@/views/Setting')
      }
    ]
  }
]
