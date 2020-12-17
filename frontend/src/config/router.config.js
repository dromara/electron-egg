/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
    // {
    //   path: '/test',
    //   redirect: '/testa',
    //   hidden: true,
    //   children: [
    //     {
    //       path: '/testa',
    //       name: 'testa',
    //       component: { template: '<div>foo</div>' }
    //     },
    //     {
    //       path: '/testb',
    //       name: 'testb',
    //       component: () => import(/* webpackChunkName: "user" */ '../views/Contentb')
    //     }
    //   ]
    // },
    { path: '/testa', component: () => import('@/views/Contenta') },
    { path: '/testb', component: () => import('@/views/Contentb') }

  ]