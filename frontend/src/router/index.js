import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

// const Foo = { template: '<div>foo</div>' }
// const Bar = { template: '<div>bar</div>' }
// const constantRouterMap = [
//     { path: '/testa', component: Foo },
//     { path: '/testb', component: Bar }
// ]

// const constantRouterMap = [

//     { path: '/testb', component: () => import('@/views/Contentb') }
//   ]

export default new Router({
  mode: 'history',
  routes: constantRouterMap
})
