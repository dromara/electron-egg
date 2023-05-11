/**
 * 基础路由
 * @type { *[] }
 */
import {AppSider, Menu} from '@/layouts'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const constantRouterMap = [
  {
    path: '/',
    component: AppSider,
    children: [
      {
        path: '/framework',
        name: 'Framework',
        component: Menu,
        props: { id: 'framework' },
        redirect: { name: 'FrameworkSocketIpc' },
        children: [
          {
            path: '/framework/socket/ipc',
            name: 'FrameworkSocketIpc',
            component: () => import('@/views/framework/socket/Ipc')
          },
          {
            path: '/framework/socket/httpserver',
            name: 'FrameworkSocketHttpServer',
            component: () => import('@/views/framework/socket/HttpServer')
          },
          {
            path: '/framework/socket/socketserver',
            name: 'FrameworkSocketSocketServer',
            component: () => import('@/views/framework/socket/SocketServer')
          }, 
          {
            path: '/framework/db/index',
            name: 'FrameworkDBIndex',
            component: () => import('@/views/framework/db/Index')
          },
          {
            path: '/framework/sqlitedb/index',
            name: 'FrameworkSqliteDBIndex',
            component: () => import('@/views/framework/sqlitedb/Index')
          },
          {
            path: '/framework/jobs/index',
            name: 'FrameworkJobsIndex',
            component: () => import('@/views/framework/jobs/Index')
          },
          {
            path: '/framework/updater/index',
            name: 'FrameworkUpdaterIndex',
            component: () => import('@/views/framework/updater/Index')
          }, 
          {
            path: '/framework/software/index',
            name: 'FrameworkSoftwareIndex',
            component: () => import('@/views/framework/software/Index')
          },
          {
            path: '/framework/java/index',
            name: 'FrameworkJavaIndex',
            component: () => import('@/views/framework/java/Index')
          },
          {
            path: '/framework/testapi/index',
            name: 'FrameworkTestApiIndex',
            component: () => import('@/views/framework/testapi/Index')
          },
        ]  
      },
      {
        path: '/os',
        name: 'Os',
        component: Menu,
        props: { id: 'os' },
        redirect: { name: 'OsFileIndex' },
        children: [
          {
            path: '/os/file/index',
            name: 'OsFileIndex',
            component: () => import('@/views/os/file/Index')
          },
          {
            path: '/os/windowview/index',
            name: 'OsWindowViewIndex',
            component: () => import('@/views/os/windowview/Index')
          },
          {
            path: '/os/window/index',
            name: 'OsWindowIndex',
            component: () => import('@/views/os/window/Index')
          },
          {
            path: '/os/notification/index',
            name: 'OsNotificationIndex',
            component: () => import('@/views/os/notification/Index')
          },
          {
            path: '/os/powermonitor/index',
            name: 'OsPowerMonitorIndex',
            component: () => import('@/views/os/powermonitor/Index')
          },
          {
            path: '/os/screen/index',
            name: 'OsScreenIndex',
            component: () => import('@/views/os/screen/Index')
          },
          {
            path: '/os/theme/index',
            name: 'OsThemeIndex',
            component: () => import('@/views/os/theme/Index')
          },   
          {
            path: '/os/system/index',
            name: 'OsSystemIndex',
            component: () => import('@/views/os/system/Index')
          },
        ]  
      },      
      {
        path: '/hardware',
        name: 'Hardware',
        component: Menu,
        props: { id: 'hardware' },
        redirect: { name: 'HardwarePrinterIndex' },
        children: [
          {
            path: '/hardware/printer/index',
            name: 'HardwarePrinterIndex',
            component: () => import('@/views/hardware/printer/Index')
          },
        ]  
      },
      {
        path: '/effect',
        name: 'Effect',
        component: Menu,
        props: { id: 'effect' },
        redirect: { name: 'EffectVideoIndex' },
        children: [
          {
            path: '/effect/video/index',
            name: 'EffectVideoIndex',
            component: () => import('@/views/effect/video/Index')
          },
        ]  
      },
    ]
  },
  {
    path: '/special',
    component: RouteView,
    //redirect: '/special/subwindow',
    children: [
      {
        path: 'subwindow',
        name: 'SpecialSubwindowIpc',
        component: () => import('@/views/os/subwindow/Ipc')
      }
    ]
  },
]
