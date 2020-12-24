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
        path: 'setting1',
        name: 'setting1',
        component: { template: '<div><h1>这是设置内一</h1></div>' }
      },
      {
        path: 'setting2',
        name: 'setting2',
        component: { template: '<div><h1>这是设置内二</h1></div>' }
      },
    ]
  }
]