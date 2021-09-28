/**
 * 基础路由
 * @type { *[] }
 */
 import {AppSider, DemoMenu} from '@/layouts'

 const RouteView = {
   name: 'RouteView',
   render: (h) => h('router-view')
 }
export const constantRouterMap = [
  {
    path: '/',
    component: AppSider,
    children: [
      {
        path: '/demo',
        name: 'Demo',
        component: DemoMenu,
        children: [
          {
            path: '/demo/file/open-dir',
            name: 'DemoFileOpenDir',
            component: () => import('@/views/demo/file/OpenDir')
          },
          {
            path: '/demo/file/upload-file',
            name: 'DemoFileUploadFile',
            component: () => import('@/views/demo/file/UploadFile')
          },
          {
            path: '/demo/socket/ipc',
            name: 'DemoSocketIpc',
            component: () => import('@/views/demo/socket/Ipc')
          },
          {
            path: '/demo/shortcut/index',
            name: 'DemoShortcutIndex',
            component: () => import('@/views/demo/shortcut/Index')
          },
          {
            path: '/demo/software/open',
            name: 'DemoSoftwareOpen',
            component: () => import('@/views/demo/software/Open')
          },
          {
            path: '/demo/system/autoLaunch',
            name: 'DemoSystemAutoLaunch',
            component: () => import('@/views/demo/system/AutoLaunch')
          },
        ]  
      },
      {
        path: '/other/index',
        name: 'OtherIndex',
        component: () => import('@/views/other/Index')
      }
    ]
  }
]
