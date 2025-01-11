import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import routerMap from './routerMap'

const Router = createRouter({
  history: createWebHashHistory(),
  routes: routerMap as RouteRecordRaw[],
})

export default Router
