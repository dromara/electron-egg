import { createRouter, createWebHashHistory } from 'vue-router'
import routerMap from './routerMap'

const Router = createRouter({
  history: createWebHashHistory(),
  routes: routerMap,
})

export default Router
