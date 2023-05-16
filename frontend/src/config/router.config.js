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
        path: '/example',
        name: 'Example',
        component: RouteView,
        redirect: { name: 'ExampleHelloIndex' },
        children: [
          {
            path: '/example/hello/index',
            name: 'ExampleHelloIndex',
            component: () => import('@/views/example/hello/Index')
          },
        ]  
      },
      // {
      //   path: '/example',
      //   name: 'Example',
      //   component: Menu,
      //   props: { id: 'example' },
      //   redirect: { name: 'ExampleHelloIndex' },
      //   children: [
      //     {
      //       path: '/example/hello/index',
      //       name: 'ExampleHelloIndex',
      //       component: () => import('@/views/example/hello/Index')
      //     },
      //   ]  
      // },
    ]
  }
]
