/**
 * 基础路由
 * @type { *[] }
 */
 import {AppSider, Menu} from '@/layouts'

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
        path: '/base',
        name: 'Base',
        component: Menu,
        children: [
          {
            path: '/base/index',
            name: 'BaseIndex',
            component: () => import('@/views/base/file/Index')
          },
          {
            path: '/base/file/index',
            name: 'BaseFileIndex',
            component: () => import('@/views/base/file/Index')
          },
          {
            path: '/base/socket/index',
            name: 'BaseSocketIndex',
            component: () => import('@/views/base/socket/Index')
          },
          {
            path: '/base/db/index',
            name: 'BaseDBIndex',
            component: () => import('@/views/base/db/Index')
          },
          {
            path: '/base/windowview/index',
            name: 'BaseWindowViewIndex',
            component: () => import('@/views/base/windowview/Index')
          },
          {
            path: '/base/window/index',
            name: 'BaseWindowIndex',
            component: () => import('@/views/base/window/Index')
          },
          {
            path: '/base/extension/index',
            name: 'BaseExtensionIndex',
            component: () => import('@/views/base/extension/Index')
          },
          {
            path: '/base/notification/index',
            name: 'BaseNotificationIndex',
            component: () => import('@/views/base/notification/Index')
          },
          {
            path: '/base/powermonitor/index',
            name: 'BasePowerMonitorIndex',
            component: () => import('@/views/base/powermonitor/Index')
          },
          {
            path: '/base/screen/index',
            name: 'BaseScreenIndex',
            component: () => import('@/views/base/screen/Index')
          },
          {
            path: '/base/theme/index',
            name: 'BaseThemeIndex',
            component: () => import('@/views/base/theme/Index')
          },                               
          {
            path: '/base/software/open',
            name: 'BaseSoftwareIndex',
            component: () => import('@/views/base/software/Index')
          },
          {
            path: '/base/system/index',
            name: 'BaseSystemIndex',
            component: () => import('@/views/base/system/Index')
          },
          {
            path: '/base/testapi/index',
            name: 'BaseTestApiIndex',
            component: () => import('@/views/base/testapi/Index')
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
