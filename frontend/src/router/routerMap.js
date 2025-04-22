/**
 * 基础路由
 * @type { *[] }
 */

// 引入electron环境判断
import { isEE } from '@/utils/ipcRenderer';

// 判断是否是打包环境（非开发环境）
// isEE为true表示在electron环境中运行
// 在electron环境中，如果检测到是开发模式（通过URL中是否包含localhost或特定端口），则不重定向到登录页
const isDev = isEE && window.location.href.includes('localhost');
const rootRedirect = (!isDev) ? { name: 'SpecialLoginWindow' } : { name: 'Framework' };

const constantRouterMap = [{
        path: '/',
        redirect: rootRedirect,
        component: () =>
            import ('@/layouts/AppSider.vue'),
        children: [{
                path: '/framework',
                name: 'Framework',
                redirect: { name: 'FrameworkSocketIpc' },
                children: [{
                        path: '/framework/socket/ipc',
                        name: 'FrameworkSocketIpc',
                        component: () =>
                            import ('@/views/framework/socket/Ipc.vue')
                    },
                    {
                        path: '/framework/socket/httpserver',
                        name: 'FrameworkSocketHttpServer',
                        component: () =>
                            import ('@/views/framework/socket/HttpServer.vue')
                    },
                    {
                        path: '/framework/socket/socketserver',
                        name: 'FrameworkSocketSocketServer',
                        component: () =>
                            import ('@/views/framework/socket/SocketServer.vue')
                    },
                    {
                        path: '/framework/sqlitedb/index',
                        name: 'FrameworkSqliteDBIndex',
                        component: () =>
                            import ('@/views/framework/sqlitedb/Index.vue')
                    },
                    {
                        path: '/framework/jobs/index',
                        name: 'FrameworkJobsIndex',
                        component: () =>
                            import ('@/views/framework/jobs/Index.vue')
                    },
                    {
                        path: '/framework/software/index',
                        name: 'FrameworkSoftwareIndex',
                        component: () =>
                            import ('@/views/framework/software/Index.vue')
                    },
                ]
            },
            {
                path: '/updater',
                name: 'Updater',
                component: () =>
                    import ('@/views/framework/updater/Index.vue')
            },
            {
                path: '/os',
                name: 'Os',
                redirect: { name: 'OsFileIndex' },
                children: [{
                        path: '/os/file/index',
                        name: 'OsFileIndex',
                        component: () =>
                            import ('@/views/os/file/Index.vue')
                    },
                    {
                        path: '/os/file/pic',
                        name: 'OsFilePic',
                        component: () =>
                            import ('@/views/os/file/Pic.vue')
                    },
                    {
                        path: '/os/window/index',
                        name: 'OsWindowIndex',
                        component: () =>
                            import ('@/views/os/window/Index.vue')
                    },
                    {
                        path: '/os/notification/index',
                        name: 'OsNotificationIndex',
                        component: () =>
                            import ('@/views/os/notification/Index.vue')
                    }
                ]
            },
            {
                path: '/effect',
                name: 'Effect',
                redirect: { name: 'EffectLoginIndex' },
                children: [{
                    path: '/effect/login/index',
                    name: 'EffectLoginIndex',
                    component: () =>
                        import ('@/views/effect/login/Index.vue')
                }]
            },
            {
                path: '/cross',
                name: 'Cross',
                redirect: { name: 'CrossGoIndex' },
                children: [{
                        path: '/cross/go/index',
                        name: 'CrossGoIndex',
                        component: () =>
                            import ('@/views/cross/go/Index.vue')
                    },
                    {
                        path: '/cross/java/index',
                        name: 'CrossJavaIndex',
                        component: () =>
                            import ('@/views/cross/java/Index.vue')
                    },
                    {
                        path: '/cross/python/index',
                        name: 'CrossPythonIndex',
                        component: () =>
                            import ('@/views/cross/python/Index.vue')
                    },
                ]
            },
            {
                path: '/live_save',
                name: 'Live_save',
                component: () =>
                    import ('@/views/live_save/index.vue')
            },
            {
                path: '/livechat',
                name: 'LiveChat',
                component: () =>
                    import ('@/views/livechat/LivechatProvider.vue'),
                redirect: { name: 'LiveChatTextControl' },
                children: [{
                        path: '/livechat/text-control',
                        name: 'LiveChatTextControl',
                        component: () =>
                            import ('@/views/livechat/AutoTextControl.vue')
                    },
                    {
                        path: '/livechat/text-reply',
                        name: 'LiveChatTextReply',
                        component: () =>
                            import ('@/views/livechat/AutoTextReply.vue')
                    },
                    {
                        path: '/livechat/voice-assistant',
                        name: 'LiveChatVoiceAssistant',
                        component: () =>
                            import ('@/views/livechat/VoiceAssistant.vue')
                    }
                ]
            },
        ]
    },
    {
        path: '/special',
        children: [{
                path: 'subwindow',
                name: 'SpecialSubwindowIpc',
                component: () =>
                    import ('@/views/os/subwindow/Ipc.vue')
            },
            {
                path: '/login',
                name: 'SpecialLoginWindow',
                component: () =>
                    import ('@/views/effect/login/Window.vue')
            },
        ]
    },
]

export default constantRouterMap
