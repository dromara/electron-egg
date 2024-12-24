/**
 * 基础路由
 * @type { *[] }
 */

const constantRouterMap = [
  {
    path: '/',
    component: () => import('@/layouts/AppSider.vue'),
    children: [
      {
        path: '/framework',
        name: 'Framework',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'framework' },
        //props: true,
        redirect: { name: 'FrameworkSocketIpc' },
        children: [
          {
            path: '/framework/socket/ipc',
            name: 'FrameworkSocketIpc',
            component: () => import('@/views/framework/socket/Ipc.vue')
          },
          {
            path: '/framework/socket/httpserver',
            name: 'FrameworkSocketHttpServer',
            component: () => import('@/views/framework/socket/HttpServer.vue')
          },
          {
            path: '/framework/socket/socketserver',
            name: 'FrameworkSocketSocketServer',
            component: () => import('@/views/framework/socket/SocketServer.vue')
          }, 
          {
            path: '/framework/jsondb/index',
            name: 'FrameworkJsonDBIndex',
            component: () => import('@/views/framework/jsondb/Index.vue')
          },
          {
            path: '/framework/sqlitedb/index',
            name: 'FrameworkSqliteDBIndex',
            component: () => import('@/views/framework/sqlitedb/Index.vue')
          },
          {
            path: '/framework/jobs/index',
            name: 'FrameworkJobsIndex',
            component: () => import('@/views/framework/jobs/Index.vue')
          },
          {
            path: '/framework/updater/index',
            name: 'FrameworkUpdaterIndex',
            component: () => import('@/views/framework/updater/Index.vue')
          }, 
          {
            path: '/framework/software/index',
            name: 'FrameworkSoftwareIndex',
            component: () => import('@/views/framework/software/Index.vue')
          },
          {
            path: '/framework/java/index',
            name: 'FrameworkJavaIndex',
            component: () => import('@/views/framework/java/Index.vue')
          },
          {
            path: '/framework/testapi/index',
            name: 'FrameworkTestApiIndex',
            component: () => import('@/views/framework/testapi/Index.vue')
          },
        ]  
      },
      {
        path: '/os',
        name: 'Os',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'os' },
        redirect: { name: 'OsFileIndex' },
        children: [
          {
            path: '/os/file/index',
            name: 'OsFileIndex',
            component: () => import('@/views/os/file/Index.vue')
          },
          {
            path: '/os/file/pic',
            name: 'OsFilePic',
            component: () => import('@/views/os/file/Pic.vue')
          },
          {
            path: '/os/windowview/index',
            name: 'OsWindowViewIndex',
            component: () => import('@/views/os/windowview/Index.vue')
          },
          {
            path: '/os/window/index',
            name: 'OsWindowIndex',
            component: () => import('@/views/os/window/Index.vue')
          },
          {
            path: '/os/notification/index',
            name: 'OsNotificationIndex',
            component: () => import('@/views/os/notification/Index.vue')
          },
          {
            path: '/os/powermonitor/index',
            name: 'OsPowerMonitorIndex',
            component: () => import('@/views/os/powermonitor/Index.vue')
          },
          {
            path: '/os/screen/index',
            name: 'OsScreenIndex',
            component: () => import('@/views/os/screen/Index.vue')
          },
          {
            path: '/os/theme/index',
            name: 'OsThemeIndex',
            component: () => import('@/views/os/theme/Index.vue')
          },   
          {
            path: '/os/system/index',
            name: 'OsSystemIndex',
            component: () => import('@/views/os/system/Index.vue')
          },
        ]  
      },      
      {
        path: '/hardware',
        name: 'Hardware',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'hardware' },
        redirect: { name: 'HardwarePrinterIndex' },
        children: [
          {
            path: '/hardware/printer/index',
            name: 'HardwarePrinterIndex',
            component: () => import('@/views/hardware/printer/Index.vue')
          },
        ]  
      },
      {
        path: '/effect',
        name: 'Effect',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'effect' },
        redirect: { name: 'EffectLoginIndex' },
        children: [
          {
            path: '/effect/login/index',
            name: 'EffectLoginIndex',
            component: () => import('@/views/effect/login/Index.vue')
          }
        ]  
      },
      {
        path: '/cross',
        name: 'Cross',
        component: () => import('@/layouts/Menu.vue'),
        props: { id: 'cross' },
        redirect: { name: 'CrossGoIndex' },
        children: [
          {
            path: '/cross/go/index',
            name: 'CrossGoIndex',
            component: () => import('@/views/cross/go/Index.vue')
          },
          {
            path: '/cross/java/index',
            name: 'CrossJavaIndex',
            component: () => import('@/views/cross/java/Index.vue')
          },
          {
            path: '/cross/python/index',
            name: 'CrossPythonIndex',
            component: () => import('@/views/cross/python/Index.vue')
          },
        ]  
      },
    ]
  },
  {
    path: '/special',
    children: [
      {
        path: 'subwindow',
        name: 'SpecialSubwindowIpc',
        component: () => import('@/views/os/subwindow/Ipc.vue')
      },
      {
        path: '/login',
        name: 'SpecialLoginWindow',
        component: () => import('@/views/effect/login/Window.vue')
      },
    ]
  },
]

export default constantRouterMap