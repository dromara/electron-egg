/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
    {
      path: '/testc',
      component: { template: '<div><router-view /></div>' },
      children: [
        {
          path: 'testc',
          name: 'testc',
          component: { template: '<div>ccc</div>' }
        },
        {
          path: '/testd',
          name: 'testd',
          component: { template: '<div>ddd</div>' }
        }
      ]
    },
    { path: '/testa', component: () => import('@/views/Contenta') },
    { path: '/testb', component: () => import('@/views/Contentb') }
  ]